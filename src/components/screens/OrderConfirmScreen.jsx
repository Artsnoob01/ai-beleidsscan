import { C } from '../../config/theme.js';
import { Logo } from '../Logo.jsx';
import { font } from '../../styles/buttonStyles.js';

export function OrderConfirmScreen({ variant, email }) {
  const isStandard = variant === "standard";

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
            {isStandard ? "\u2709" : "\u2713"}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 10 }}>
            Bedankt voor uw bestelling
          </h2>

          {isStandard ? (
            <>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
                Uw AI-beleid wordt nu gegenereerd en binnen enkele minuten per e-mail verstuurd naar:
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.accent, marginBottom: 16 }}>{email}</p>
              <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>
                Dit document is automatisch gegenereerd op basis van uw scanresultaten. Controleer het document en pas het waar nodig aan voordat u het vaststelt als beleid.
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
                Bedankt voor uw bestelling. Wij nemen binnen 2 werkdagen contact met u op om een gesprek in te plannen waarin we uw AI-beleid bespreken.
              </p>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
                Na de bespreking ontvangt u het definitieve document per e-mail op:
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.accent, marginBottom: 16 }}>{email}</p>
            </>
          )}
        </div>

        <p style={{ fontSize: 11, color: C.textDim, marginTop: 20, lineHeight: 1.5 }}>
          U ontvangt een factuur op het opgegeven adres.
        </p>
      </div>
    </div>
  );
}
