import { useState } from "react";
import { C } from '../../config/theme.js';
import { Logo } from '../Logo.jsx';
import { btn, font } from '../../styles/buttonStyles.js';

const VARIANTS = [
  { id: "standard", name: "Standaard", price: "499", desc: "AI-beleid op basis van uw scanresultaten, direct per e-mail geleverd. Door u zelf te controleren en vast te stellen." },
  { id: "premium", name: "Premium", price: "1.999", desc: "AI-beleid inclusief een bespreking met een specialist. Wij nemen contact met u op om een gesprek in te plannen." },
];

const inputStyle = {
  width: "100%", padding: "12px 16px", fontSize: 14, background: C.bgInput, color: C.white,
  border: `1.5px solid ${C.accentBorder}`, borderRadius: 10, fontFamily: "'Inter',sans-serif",
  outline: "none", boxSizing: "border-box",
};

const labelStyle = { fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6, display: "block" };

export function OrderScreen({ submissionId, onSubmit, submitting, error }) {
  const [variant, setVariant] = useState("standard");
  const [form, setForm] = useState({ name: "", firm: "", email: "", address: "", postcode: "", city: "" });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const valid = form.name && form.firm && form.email?.includes("@") && form.address && form.postcode && form.city;

  const handleSubmit = () => {
    if (!valid || submitting) return;
    onSubmit({ ...form, variant, submissionId });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 560, padding: 24, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}><Logo size={200} /></div>

        <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 8, textAlign: "center" }}>
            Bestel uw AI-beleid
          </h2>
          <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", lineHeight: 1.7, marginBottom: 24 }}>
            Op basis van uw scanresultaten genereren wij een compleet AI-beleidsdocument voor uw organisatie.
          </p>

          {/* Variant selection */}
          <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
            {VARIANTS.map((v) => (
              <div
                key={v.id}
                onClick={() => setVariant(v.id)}
                style={{
                  padding: 18, borderRadius: 12, cursor: "pointer",
                  border: `2px solid ${variant === v.id ? C.accent : C.border}`,
                  background: variant === v.id ? C.accentDim : C.bgCardAlt,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: variant === v.id ? C.accent : C.white }}>{v.name}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: variant === v.id ? C.accent : C.white }}>&euro;{v.price}</span>
                </div>
                <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Contact details */}
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>Naam</label>
              <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="Uw volledige naam" />
            </div>
            <div>
              <label style={labelStyle}>Kantoor / organisatie</label>
              <input style={inputStyle} value={form.firm} onChange={set("firm")} placeholder="Naam van uw kantoor" />
            </div>
            <div>
              <label style={labelStyle}>E-mailadres</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set("email")} placeholder="uw@email.nl" />
            </div>

            {/* Billing address */}
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 12 }}>Factuuradres</p>
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Adres</label>
                  <input style={inputStyle} value={form.address} onChange={set("address")} placeholder="Straat en huisnummer" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Postcode</label>
                    <input style={inputStyle} value={form.postcode} onChange={set("postcode")} placeholder="1234 AB" />
                  </div>
                  <div>
                    <label style={labelStyle}>Plaats</label>
                    <input style={inputStyle} value={form.city} onChange={set("city")} placeholder="Plaats" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, marginTop: 20 }}>
            U ontvangt een factuur op het opgegeven adres.
            {variant === "standard" && " Uw AI-beleid wordt direct na bestelling gegenereerd en per e-mail geleverd. Het document dient door u te worden gecontroleerd voordat u het vaststelt."}
            {variant === "premium" && " Wij nemen binnen 2 werkdagen contact met u op om een bespreking in te plannen."}
          </p>

          {error && (
            <p style={{ fontSize: 13, color: C.danger, marginTop: 12 }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!valid || submitting}
            style={{
              ...btn, width: "100%", padding: "14px 28px", fontSize: 14, fontWeight: 700, marginTop: 20,
              background: valid && !submitting ? C.accent : C.bgInput,
              color: valid && !submitting ? C.black : C.textDim,
              border: `1px solid ${valid && !submitting ? C.accent : C.border}`,
              cursor: valid && !submitting ? "pointer" : "default",
              boxShadow: valid && !submitting ? `0 0 30px ${C.accentDim}` : "none",
              borderRadius: 10,
            }}
          >
            {submitting ? "Bestelling verwerken..." : `Bestellen - \u20AC${VARIANTS.find(v => v.id === variant).price}`}
          </button>

          <p style={{ fontSize: 11, color: C.textDim, textAlign: "center", marginTop: 12 }}>
            Alle bedragen zijn exclusief btw.
          </p>
        </div>
      </div>
    </div>
  );
}
