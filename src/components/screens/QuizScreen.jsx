import { useRef, useEffect } from 'react';
import { C } from '../../config/theme.js';
import { t } from '../../config/translations.js';
import { Logo } from '../Logo.jsx';
import { btn, font } from '../../styles/buttonStyles.js';

export function QuizScreen({ sections, sec, si, ans, lang, dispatch, scrollTop, secDone, handleNext, handleBack }) {
  const headingRef = useRef(null);
  const prevSi = useRef(si);

  useEffect(() => {
    if (prevSi.current !== si) {
      prevSi.current = si;
      headingRef.current?.focus();
    }
  }, [si]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={140} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: C.textDim }}>{si + 1} / {sections.length}</span>
          <div style={{ display: "flex", gap: 3 }}>
            {["nl", "en"].map(l => (
              <button key={l} onClick={() => dispatch({ type: "SET_LANG", lang: l })} style={{ ...btn, padding: "3px 8px", fontSize: 10, background: lang === l ? C.accentDim : "transparent", color: lang === l ? C.accent : C.textDim, border: `1px solid ${lang === l ? C.accentBorder : "transparent"}`, borderRadius: 4 }} aria-pressed={lang === l}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, maxWidth: 680, width: "100%", margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }} role="progressbar" aria-valuenow={si + 1} aria-valuemin={1} aria-valuemax={sections.length} aria-label={t(lang, 'quiz_progress')}>
          {sections.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= si ? C.accent : C.border, opacity: i <= si ? 1 : 0.4, transition: "all .4s" }} />
          ))}
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 26 }} aria-hidden="true">{sec.icon}</span>
            <h2 ref={headingRef} tabIndex={-1} style={{ fontSize: 22, fontWeight: 800, color: C.white, outline: "none" }}>{sec.title}</h2>
          </div>
          <p style={{ fontSize: 13, color: C.textMuted }}>{sec.subtitle}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {sec.questions.map((q, qi) => (
            <fieldset key={q.id} style={{ border: "none", margin: 0, padding: 0 }}>
              <legend className="sr-only">{q.text}</legend>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: q.hint ? 4 : 10, lineHeight: 1.5 }}>
                <span style={{ color: C.accent, marginRight: 6, fontWeight: 800 }}>{qi + 1}.</span>{q.text}
              </label>
              {q.hint && (
                <p style={{ fontSize: 11, color: C.textDim, marginBottom: 10, lineHeight: 1.6, paddingLeft: 22 }}>{q.hint}</p>
              )}
              {q.type === "select" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }} role="radiogroup" aria-label={q.text}>
                  {q.options.map(o => (
                    <button key={o.v} role="radio" aria-checked={ans[q.id] === o.v} onClick={() => dispatch({ type: "SET_ANSWER", id: q.id, value: o.v })} style={{
                      ...btn, width: "100%", padding: "12px 16px", textAlign: "left", justifyContent: "flex-start", fontSize: 13,
                      color: ans[q.id] === o.v ? C.accent : C.text, background: ans[q.id] === o.v ? C.accentDim : C.bgInput,
                      border: `1.5px solid ${ans[q.id] === o.v ? C.accentBorder : C.border}`,
                    }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: `2px solid ${ans[q.id] === o.v ? C.accent : C.textDim}`, background: ans[q.id] === o.v ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
                        {ans[q.id] === o.v && <span style={{ color: C.black, fontSize: 10, fontWeight: 900 }}>✓</span>}
                      </span>
                      {o.l}
                    </button>
                  ))}
                </div>
              )}
              {q.type === "multi" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} role="group" aria-label={q.text}>
                  {q.options.map(o => {
                    const sel = ans[q.id]?.includes(o.v);
                    return (
                      <button key={o.v} role="checkbox" aria-checked={!!sel} onClick={() => dispatch({ type: "TOGGLE_MULTI", id: q.id, value: o.v })} style={{ ...btn, padding: "8px 14px", fontSize: 12, color: sel ? C.accent : C.textMuted, background: sel ? C.accentDim : C.bgInput, border: `1.5px solid ${sel ? C.accentBorder : C.border}`, borderRadius: 6 }}>
                        {sel && <span style={{ fontSize: 10 }} aria-hidden="true">✓ </span>}{o.l}
                      </button>
                    );
                  })}
                </div>
              )}
              {q.type === "multi_with_other" && (
                <div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} role="group" aria-label={q.text}>
                    {q.options.map(o => {
                      const sel = ans[q.id]?.includes(o.v);
                      return (
                        <button key={o.v} role="checkbox" aria-checked={!!sel} onClick={() => dispatch({ type: "TOGGLE_MULTI", id: q.id, value: o.v })} style={{ ...btn, padding: "8px 14px", fontSize: 12, color: sel ? C.accent : C.textMuted, background: sel ? C.accentDim : C.bgInput, border: `1.5px solid ${sel ? C.accentBorder : C.border}`, borderRadius: 6 }}>
                          {sel && <span style={{ fontSize: 10 }} aria-hidden="true">✓ </span>}{o.l}
                        </button>
                      );
                    })}
                  </div>
                  {ans[q.id]?.includes("other") && (
                    <div style={{ marginTop: 10 }}>
                      <label htmlFor={`${q.id}_other`} className="sr-only">{t(lang, 'quiz_other_placeholder')}</label>
                      <input
                        id={`${q.id}_other`}
                        type="text"
                        placeholder={t(lang, 'quiz_other_placeholder')}
                        value={ans[q.id + "_other"] || ""}
                        maxLength={200}
                        onChange={e => dispatch({ type: "SET_ANSWER", id: q.id + "_other", value: e.target.value.slice(0, 200) })}
                        style={{ width: "100%", padding: "10px 14px", fontSize: 13, background: C.bgInput, color: C.text, border: `1.5px solid ${C.accentBorder}`, borderRadius: 8, fontFamily: "'Inter',sans-serif", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </fieldset>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingBottom: 36 }}>
          <button onClick={handleBack} disabled={si === 0} style={{ ...btn, padding: "11px 22px", fontSize: 13, background: "transparent", color: si === 0 ? C.textDim : C.textMuted, border: `1px solid ${si === 0 ? C.border : C.borderLight}`, opacity: si === 0 ? 0.4 : 1, cursor: si === 0 ? "default" : "pointer" }}>{t(lang, 'quiz_prev')}</button>
          <button onClick={handleNext} disabled={!secDone} style={{ ...btn, padding: "11px 28px", fontSize: 13, background: secDone ? C.accent : C.bgInput, color: secDone ? C.black : C.textDim, border: `1px solid ${secDone ? C.accent : C.border}`, cursor: secDone ? "pointer" : "default", boxShadow: secDone ? `0 0 20px ${C.accentDim}` : "none" }}>
            {si === sections.length - 1 ? t(lang, 'quiz_generate') : t(lang, 'quiz_next')}
          </button>
        </div>
      </div>
    </div>
  );
}
