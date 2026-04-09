import { useRef, useReducer, useEffect, useCallback } from "react";
import { SECTIONS, QUESTIONNAIRE_ID } from './config/questionnaire.js';
import { calcScores } from './logic/scoring.js';
import { genReport } from './logic/reportGenerator.js';
import { loadProgress, saveProgress, clearProgress } from './logic/persistence.js';
import { printStyles } from './styles/printStyles.js';

import { IntroScreen } from './components/screens/IntroScreen.jsx';
import { QuizScreen } from './components/screens/QuizScreen.jsx';
import { EmailScreen } from './components/screens/EmailScreen.jsx';
import { GeneratingScreen } from './components/screens/GeneratingScreen.jsx';
import { ErrorScreen } from './components/screens/ErrorScreen.jsx';
import { ReportScreen } from './components/screens/ReportScreen.jsx';
import { OrderScreen } from './components/screens/OrderScreen.jsx';
import { OrderQuestionsScreen } from './components/screens/OrderQuestionsScreen.jsx';
import { OrderThankYouScreen } from './components/screens/OrderThankYouScreen.jsx';
import { OrderConfirmScreen } from './components/screens/OrderConfirmScreen.jsx';

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const initialState = {
  phase: "intro",     // intro | quiz | email | gen | report | error | order | order_thankyou | order_questions | order_confirm
  sectionIndex: 0,
  answers: {},
  scores: null,
  report: "",
  lang: "nl",
  error: null,
  email: "",
  emailSent: false,
  emailSending: false,
  emailError: null,
  submissionId: null,
  orderSubmitting: false,
  orderError: null,
  orderVariant: null,
  orderEmail: null,
  orderData: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "START_QUIZ":
      return { ...state, phase: "quiz" };
    case "SET_ANSWER":
      return { ...state, answers: { ...state.answers, [action.id]: action.value } };
    case "TOGGLE_MULTI": {
      const current = state.answers[action.id] || [];
      const next = current.includes(action.value)
        ? current.filter(x => x !== action.value)
        : [...current, action.value];
      return { ...state, answers: { ...state.answers, [action.id]: next } };
    }
    case "NEXT_SECTION":
      return { ...state, sectionIndex: state.sectionIndex + 1 };
    case "PREV_SECTION":
      return { ...state, sectionIndex: Math.max(0, state.sectionIndex - 1) };
    case "SET_LANG":
      return { ...state, lang: action.lang };
    case "SHOW_EMAIL":
      return { ...state, phase: "email", scores: action.scores };
    case "SET_EMAIL":
      return { ...state, email: action.email };
    case "START_GENERATING":
      return { ...state, phase: "gen", error: null, report: "" };
    case "STREAM_CHUNK":
      return { ...state, report: action.text };
    case "REPORT_READY":
      return { ...state, phase: "report", report: action.report };
    case "REPORT_ERROR":
      return { ...state, phase: "error", error: action.error };
    case "EMAIL_SENDING":
      return { ...state, emailSending: true, emailError: null };
    case "EMAIL_SUCCESS":
      return { ...state, emailSending: false, emailSent: true, emailError: null };
    case "EMAIL_FAILED":
      return { ...state, emailSending: false, emailSent: false, emailError: action.error };
    case "SET_SUBMISSION_ID":
      return { ...state, submissionId: action.id };
    case "SHOW_ORDER":
      return { ...state, phase: "order" };
    case "ORDER_TO_THANKYOU":
      return { ...state, phase: "order_thankyou", orderData: action.orderData, orderError: null };
    case "ORDER_TO_QUESTIONS":
      return { ...state, phase: "order_questions" };
    case "ORDER_SUBMITTING":
      return { ...state, orderSubmitting: true, orderError: null };
    case "ORDER_SUCCESS":
      return { ...state, phase: "order_confirm", orderSubmitting: false, orderVariant: action.variant, orderEmail: action.email };
    case "ORDER_ERROR":
      return { ...state, orderSubmitting: false, orderError: action.error };
    case "RESTART":
      return { ...initialState };
    default:
      return state;
  }
}

function getInitialState() {
  const saved = loadProgress(QUESTIONNAIRE_ID);
  if (saved && Object.keys(saved.answers).length > 0) {
    return {
      ...initialState,
      phase: "quiz",
      answers: saved.answers,
      sectionIndex: saved.sectionIndex,
      email: saved.email,
    };
  }
  return initialState;
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);
  const ref = useRef(null);
  const { phase, sectionIndex: si, answers: ans, scores, report, lang, error, email, emailSent, emailSending, emailError, submissionId, orderSubmitting, orderError, orderVariant, orderEmail } = state;

  // Check URL for order param: ?bestel=SUBMISSION_ID
  const orderSubmissionId = useRef(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bestelId = params.get("bestel");
    if (bestelId) {
      orderSubmissionId.current = bestelId;
      dispatch({ type: "SHOW_ORDER" });
    }
  }, []);
  const sec = SECTIONS[si];
  const totalQ = SECTIONS.reduce((s, x) => s + x.questions.length, 0);
  const secDone = sec?.questions.every(q =>
    (q.type === "multi" || q.type === "multi_with_other") ? ans[q.id]?.length > 0 : !!ans[q.id]
  );

  // Wrap dispatch to clear persistence on restart
  const wrappedDispatch = useCallback((action) => {
    if (action.type === 'RESTART') clearProgress();
    dispatch(action);
  }, []);

  // Persist quiz progress
  useEffect(() => {
    if (state.phase === 'quiz' || state.phase === 'email') {
      saveProgress(QUESTIONNAIRE_ID, {
        answers: state.answers,
        sectionIndex: state.sectionIndex,
        email: state.email,
      });
    }
  }, [state.answers, state.sectionIndex, state.email, state.phase]);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNext = useCallback(() => {
    if (si < SECTIONS.length - 1) {
      dispatch({ type: "NEXT_SECTION" });
      scrollTop();
    } else {
      const s = calcScores(ans, SECTIONS);
      dispatch({ type: "SHOW_EMAIL", scores: s });
    }
  }, [si, ans, scrollTop]);

  const handleBack = useCallback(() => {
    if (si > 0) {
      dispatch({ type: "PREV_SECTION" });
      scrollTop();
    }
  }, [si, scrollTop]);

  // Shared function for generating report and sending email
  const generateAndSend = useCallback((targetLang) => {
    dispatch({ type: "START_GENERATING" });
    genReport(ans, scores, targetLang, 2, (text) => {
      dispatch({ type: "STREAM_CHUNK", text });
    }).then(async (result) => {
      if (result.ok) {
        dispatch({ type: "REPORT_READY", report: result.text });
        if (result.submissionId) {
          dispatch({ type: "SET_SUBMISSION_ID", id: result.submissionId });
        }
        // Send email
        dispatch({ type: "EMAIL_SENDING" });
        try {
          const resp = await fetch("/api/send-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, report: result.text, scores, lang: targetLang, submissionId: result.submissionId }),
          });
          if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            throw new Error(errData.error || "Verzenden mislukt");
          }
          dispatch({ type: "EMAIL_SUCCESS" });
        } catch (e) {
          dispatch({ type: "EMAIL_FAILED", error: e.message || "Het rapport kon niet per e-mail worden verzonden." });
        }
      } else {
        dispatch({ type: "REPORT_ERROR", error: result.error });
      }
    });
  }, [ans, scores, email]);

  const handleEmailSubmit = useCallback(() => {
    if (!email || !email.includes("@")) return;
    generateAndSend(lang);
  }, [email, lang, generateAndSend]);

  // Retry sending email without regenerating the report
  const handleRetrySend = useCallback(async () => {
    dispatch({ type: "EMAIL_SENDING" });
    try {
      const resp = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, report, scores, lang, submissionId }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Verzenden mislukt");
      }
      dispatch({ type: "EMAIL_SUCCESS" });
    } catch (e) {
      dispatch({ type: "EMAIL_FAILED", error: e.message || "Het rapport kon niet per e-mail worden verzonden." });
    }
  }, [email, report, scores, lang, submissionId]);

  const handleRetryGenerate = useCallback(() => {
    generateAndSend(lang);
  }, [lang, generateAndSend]);

  const handleOrderNext = useCallback((orderData) => {
    dispatch({ type: "ORDER_TO_THANKYOU", orderData });
  }, []);

  const handleOrderToContinue = useCallback(() => {
    dispatch({ type: "ORDER_TO_QUESTIONS" });
  }, []);

  const handleOrderQuestionsSubmit = useCallback(async (policyDetails) => {
    dispatch({ type: "ORDER_SUBMITTING" });
    try {
      const resp = await fetch("/api/process-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state.orderData, policyDetails }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Bestelling mislukt");
      }
      dispatch({ type: "ORDER_SUCCESS", variant: state.orderData.variant, email: state.orderData.email });
    } catch (e) {
      dispatch({ type: "ORDER_ERROR", error: e.message });
    }
  }, [state.orderData]);

  // ─── RENDER ───

  if (phase === "order") return (
    <OrderScreen
      submissionId={orderSubmissionId.current || submissionId}
      onSubmit={handleOrderNext}
      submitting={false}
      error={orderError}
    />
  );

  if (phase === "order_thankyou") return (
    <OrderThankYouScreen
      variant={state.orderData?.variant}
      email={state.orderData?.email}
      onContinue={handleOrderToContinue}
    />
  );

  if (phase === "order_questions") return (
    <OrderQuestionsScreen
      onSubmit={handleOrderQuestionsSubmit}
      submitting={orderSubmitting}
      error={orderError}
    />
  );

  if (phase === "order_confirm") return (
    <OrderConfirmScreen variant={orderVariant} email={orderEmail} />
  );

  if (phase === "intro") return (
    <>
      <style>{printStyles}</style>
      <IntroScreen totalQ={totalQ} dispatch={wrappedDispatch} lang={lang} />
    </>
  );

  if (phase === "email") return (
    <EmailScreen email={email} scores={scores} dispatch={wrappedDispatch} handleEmailSubmit={handleEmailSubmit} lang={lang} />
  );

  if (phase === "gen") return <GeneratingScreen lang={lang} />;

  if (phase === "error") return (
    <ErrorScreen error={error} dispatch={wrappedDispatch} onRetry={handleRetryGenerate} lang={lang} />
  );

  if (phase === "report") return (
    <>
      <style>{printStyles}</style>
      <ReportScreen
        scores={scores} report={report} email={email}
        emailSent={emailSent} emailSending={emailSending} emailError={emailError}
        dispatch={wrappedDispatch} onRetrySend={handleRetrySend} lang={lang}
      />
    </>
  );

  // ─── QUIZ (default) ───
  return (
    <div ref={ref}>
      <QuizScreen
        sections={SECTIONS} sec={sec} si={si} ans={ans} lang={lang}
        dispatch={wrappedDispatch} scrollTop={scrollTop} secDone={secDone}
        handleNext={handleNext} handleBack={handleBack}
      />
    </div>
  );
}
