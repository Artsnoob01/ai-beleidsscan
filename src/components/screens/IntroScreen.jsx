import { C } from '../../config/theme.js';
import { t } from '../../config/translations.js';
import { Logo } from '../Logo.jsx';
import { btn, font } from '../../styles/buttonStyles.js';

export function IntroScreen({ totalQ, dispatch, lang }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `linear-gradient(${C.accent} 1px, transparent 1px), linear-gradient(90deg, ${C.accent} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 44 }}><Logo size={280} /></div>
          <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 20, background: C.accentDim, border: `1px solid ${C.accentBorder}`, marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: 2, textTransform: "uppercase" }}>{t(lang, 'intro_badge')}</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 800, color: C.white, lineHeight: 1.15, maxWidth: 680, margin: "0 auto 20px", letterSpacing: -0.5 }}>{t(lang, 'intro_title')}</h1>
          <p style={{ fontSize: 15, color: C.textMuted, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>{t(lang, 'intro_subtitle')}</p>
          <button onClick={() => dispatch({ type: "START_QUIZ" })} style={{ ...btn, padding: "16px 40px", fontSize: 15, fontWeight: 700, background: C.accent, color: C.black, borderRadius: 10, boxShadow: `0 0 40px ${C.accentDim}` }}>{t(lang, 'intro_start')}</button>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 20 }}>{t(lang, 'intro_meta_prefix')}{totalQ}{t(lang, 'intro_meta_suffix')}</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: C.border }}>
        {[
          { i: "\uD83D\uDCDC", t: t(lang, 'intro_nova_title'), d: t(lang, 'intro_nova_desc') },
          { i: "\uD83D\uDD12", t: t(lang, 'intro_avg_title'), d: t(lang, 'intro_avg_desc') },
          { i: "\uD83C\uDDEA\uD83C\uDDFA", t: t(lang, 'intro_aiact_title'), d: t(lang, 'intro_aiact_desc') },
        ].map((f, i) => (
          <div key={i} style={{ padding: "28px 20px", background: C.bgCard, textAlign: "center" }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{f.i}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 4 }}>{f.t}</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
