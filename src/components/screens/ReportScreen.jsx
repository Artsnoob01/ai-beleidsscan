import { C } from '../../config/theme.js';
import { t } from '../../config/translations.js';
import { Logo } from '../Logo.jsx';
import { ScoreRing } from '../ScoreRing.jsx';
import { getLevel } from '../../logic/scoring.js';
import { renderMd } from '../MarkdownRenderer.jsx';
import { btn, font } from '../../styles/buttonStyles.js';

export function ReportScreen({ scores, report, email, emailSent, emailSending, emailError, dispatch, onRetrySend, lang }) {
  const s = scores, ol = getLevel(s.overall, lang);
  const summaryMatch = report.match(/## (?:Samenvatting|Executive Summary)\s*\n([\s\S]*?)(?=\n## )/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const dateLocale = lang === 'en' ? 'en-GB' : 'nl-NL';

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, overflowY: "auto" }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Logo size={150} />
        <button onClick={() => dispatch({ type: "RESTART" })} style={{ ...btn, padding: "7px 14px", fontSize: 11, background: C.bgCard, color: C.textMuted, border: `1px solid ${C.border}` }}>{t(lang, 'report_new_scan')}</button>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 16, background: C.accentDim, border: `1px solid ${C.accentBorder}`, marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: 1.5, textTransform: "uppercase" }}>{t(lang, 'report_badge')}</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.white, marginBottom: 6 }}>{t(lang, 'report_title')}</h1>
          <p style={{ fontSize: 13, color: C.textMuted }}>{new Date().toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        {/* Overall score */}
        <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, marginBottom: 20, textAlign: "center" }}>
          <ScoreRing score={s.overall} size={130} lang={lang} />
          <div style={{ fontSize: 13, fontWeight: 600, color: ol.color, marginTop: 8, padding: "4px 14px", display: "inline-block", borderRadius: 10, background: ol.bg, border: `1px solid ${ol.border}` }}>{t(lang, 'score_overall')}: {ol.label}</div>
        </div>

        {/* Per-axis scores */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 36 }}>
          {[
            { s: s.orde, l: t(lang, 'score_nova'), sub: t(lang, 'score_nova_sub') },
            { s: s.avg, l: t(lang, 'score_avg'), sub: t(lang, 'score_avg_sub') },
            { s: s.aiact, l: t(lang, 'score_aiact'), sub: t(lang, 'score_aiact_sub') },
          ].map((d, i) => (
            <div key={i} style={{ background: C.bgCard, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              <ScoreRing score={d.s} size={90} label={d.l} sub={d.sub} lang={lang} />
            </div>
          ))}
        </div>

        {/* Summary */}
        {summary && (
          <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: "28px 32px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: C.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.accent }}>✦</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{t(lang, 'report_summary')}</span>
            </div>
            {renderMd(summary)}
          </div>
        )}

        {/* Email status */}
        {emailSending && (
          <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.accentBorder}`, padding: 28, marginBottom: 24, textAlign: "center" }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", margin: "0 auto 14px", animation: "sp .8s linear infinite" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 6 }}>{t(lang, 'report_sending')}</h3>
            <p style={{ fontSize: 13, color: C.textMuted }}>{t(lang, 'report_sending_desc')} <strong style={{ color: C.accent }}>{email}</strong>.</p>
          </div>
        )}

        {emailSent && !emailError && !emailSending && (
          <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.successBorder}`, padding: 28, marginBottom: 24, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.successDim, border: `1px solid ${C.successBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 14px" }}>✓</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 6 }}>{t(lang, 'report_sent_title')}</h3>
            <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              {t(lang, 'report_sent_desc')} <strong style={{ color: C.accent }}>{email}</strong>. {t(lang, 'report_check_spam')}
            </p>
          </div>
        )}

        {emailError && !emailSending && (
          <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.dangerBorder}`, padding: 28, marginBottom: 24, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.dangerDim, border: `1px solid ${C.dangerBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 14px" }}>⚠</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 6 }}>{t(lang, 'report_email_failed')}</h3>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 16, lineHeight: 1.7 }}>{emailError}</p>
            <button onClick={onRetrySend} style={{ ...btn, padding: "12px 28px", fontSize: 13, background: C.accent, color: C.black, borderRadius: 8 }}>
              {t(lang, 'report_email_retry')}
            </button>
            <p style={{ fontSize: 11, color: C.textDim, marginTop: 12, lineHeight: 1.5 }}>
              {t(lang, 'report_email_note')}
            </p>
          </div>
        )}

        {/* CTA */}
        <div style={{ padding: 28, background: `linear-gradient(135deg,${C.bgCard},${C.bgCardAlt})`, borderRadius: 14, border: `1px solid ${C.accentBorder}`, textAlign: "center" }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.white, marginBottom: 6 }}>{t(lang, 'report_cta_title')}</h3>
          <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 18, lineHeight: 1.6 }}>{t(lang, 'report_cta_desc')}</p>
          <a href="mailto:info@theinnovativelawyer.ai?subject=AI-beleidsscan%20opvolging" style={{ ...btn, padding: "12px 28px", fontSize: 13, background: C.accent, color: C.black, textDecoration: "none", borderRadius: 8 }}>{t(lang, 'report_cta_button')}</a>
        </div>
      </div>
    </div>
  );
}
