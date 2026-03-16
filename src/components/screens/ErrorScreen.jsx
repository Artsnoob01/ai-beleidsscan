import { C } from '../../config/theme.js';
import { t } from '../../config/translations.js';
import { Logo } from '../Logo.jsx';
import { btn, font } from '../../styles/buttonStyles.js';

export function ErrorScreen({ error, dispatch, onRetry, lang }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 480, padding: 24 }}>
        <div style={{ marginBottom: 28 }}><Logo size={200} /></div>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: C.dangerDim, border: `1px solid ${C.dangerBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 20px" }}>⚠</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 8 }}>{t(lang, 'error_title')}</h2>
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 8, lineHeight: 1.6 }}>{error}</p>
        <p style={{ fontSize: 12, color: C.textDim, marginBottom: 24 }}>{t(lang, 'error_saved')}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onRetry} style={{ ...btn, padding: "12px 28px", fontSize: 13, background: C.accent, color: C.black, borderRadius: 8 }}>
            {t(lang, 'error_retry')}
          </button>
          <button onClick={() => dispatch({ type: "RESTART" })} style={{ ...btn, padding: "12px 28px", fontSize: 13, background: C.bgCard, color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8 }}>
            {t(lang, 'error_restart')}
          </button>
        </div>
      </div>
    </div>
  );
}
