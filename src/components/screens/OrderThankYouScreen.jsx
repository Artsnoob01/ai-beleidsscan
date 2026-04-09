import { C } from '../../config/theme.js';
import { Logo } from '../Logo.jsx';
import { btn, font } from '../../styles/buttonStyles.js';

export function OrderThankYouScreen({ variant, email, onContinue }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 520, padding: 24, width: "100%" }}>
        <div style={{ marginBottom: 32 }}><Logo size={200} /></div>

        <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: C.accentDim, border: `1px solid ${C.accentBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 20px",
          }}>
            &#x2713;
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 10 }}>
            Bedankt voor uw bestelling
          </h2>

          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
            U ontvangt een factuur op het opgegeven e-mailadres:
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.accent, marginBottom: 24 }}>{email}</p>

          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 28 }}>
            Om uw AI-beleid zo goed mogelijk af te stemmen op uw organisatie hebben wij nog een aantal aanvullende gegevens van u nodig.
          </p>

          <button
            onClick={onContinue}
            style={{
              ...btn, width: "100%", padding: "14px 28px", fontSize: 14, fontWeight: 700,
              background: C.accent, color: C.black,
              border: `1px solid ${C.accent}`,
              cursor: "pointer",
              boxShadow: `0 0 30px ${C.accentDim}`,
              borderRadius: 10,
            }}
          >
            Gegevens invullen &#x2192;
          </button>
        </div>
      </div>
    </div>
  );
}
