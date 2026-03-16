import { C } from '../../config/theme.js';
import { t } from '../../config/translations.js';
import { Logo } from '../Logo.jsx';
import { font } from '../../styles/buttonStyles.js';

export function GeneratingScreen({ lang }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }} role="status" aria-live="polite">
        <div style={{ marginBottom: 28 }}><Logo size={200} /></div>
        <div style={{ width: 44, height: 44, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", margin: "0 auto 20px", animation: "sp .8s linear infinite" }} />
        <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 6 }}>{t(lang, 'gen_title')}</h2>
        <p style={{ fontSize: 13, color: C.textMuted }}>{t(lang, 'gen_desc')}</p>
      </div>
    </div>
  );
}
