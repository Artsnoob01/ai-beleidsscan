import { C } from '../../config/theme.js';
import { t } from '../../config/translations.js';
import { Logo } from '../Logo.jsx';
import { ScoreRing } from '../ScoreRing.jsx';
import { getLevel } from '../../logic/scoring.js';
import { btn, font } from '../../styles/buttonStyles.js';

export function EmailScreen({ email, scores, dispatch, handleEmailSubmit, lang }) {
  const s = scores, ol = getLevel(s.overall, lang);
  const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 520, padding: 24, width: "100%" }}>
        <div style={{ marginBottom: 32 }}><Logo size={200} /></div>

        <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, marginBottom: 24 }}>
          <ScoreRing score={s.overall} size={120} lang={lang} />
          <div style={{ fontSize: 13, fontWeight: 600, color: ol.color, marginTop: 8, padding: "4px 14px", display: "inline-block", borderRadius: 10, background: ol.bg, border: `1px solid ${ol.border}` }}>{t(lang, 'score_overall')}: {ol.label}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 20 }}>
            {[
              { s: s.orde, l: t(lang, 'score_nova'), sub: t(lang, 'score_nova_sub') },
              { s: s.avg, l: t(lang, 'score_avg'), sub: t(lang, 'score_avg_sub') },
              { s: s.aiact, l: t(lang, 'score_aiact'), sub: t(lang, 'score_aiact_sub') },
            ].map((d, i) => (
              <div key={i} style={{ background: C.bgCardAlt, borderRadius: 10, border: `1px solid ${C.border}`, padding: 14 }}>
                <ScoreRing score={d.s} size={70} label={d.l} sub={d.sub} lang={lang} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px" }}>✉</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 8 }}>{t(lang, 'email_ready')}</h2>
          <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24, lineHeight: 1.7 }}>
            {t(lang, 'email_desc')}
          </p>
          <label htmlFor="email-input" className="sr-only">{t(lang, 'email_placeholder')}</label>
          <input
            id="email-input"
            type="email"
            placeholder={t(lang, 'email_placeholder')}
            value={email}
            onChange={e => dispatch({ type: "SET_EMAIL", email: e.target.value })}
            onKeyDown={e => e.key === "Enter" && validEmail && handleEmailSubmit()}
            style={{
              width: "100%", padding: "14px 18px", fontSize: 15, background: C.bgInput, color: C.white,
              border: `1.5px solid ${email && !validEmail ? C.dangerBorder : C.accentBorder}`,
              borderRadius: 10, fontFamily: "'Inter',sans-serif", outline: "none", boxSizing: "border-box",
              marginBottom: 16, textAlign: "center",
            }}
          />
          <button
            onClick={handleEmailSubmit}
            disabled={!validEmail}
            style={{
              ...btn, width: "100%", padding: "14px 28px", fontSize: 14, fontWeight: 700,
              background: validEmail ? C.accent : C.bgInput, color: validEmail ? C.black : C.textDim,
              border: `1px solid ${validEmail ? C.accent : C.border}`,
              cursor: validEmail ? "pointer" : "default",
              boxShadow: validEmail ? `0 0 30px ${C.accentDim}` : "none",
              borderRadius: 10,
            }}
          >
            {t(lang, 'email_submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
