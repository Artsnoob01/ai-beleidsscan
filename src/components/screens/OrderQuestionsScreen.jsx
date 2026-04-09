import { useState } from "react";
import { C } from '../../config/theme.js';
import { Logo } from '../Logo.jsx';
import { btn, font } from '../../styles/buttonStyles.js';

const inputStyle = {
  width: "100%", padding: "12px 16px", fontSize: 14, background: C.bgInput, color: C.white,
  border: `1.5px solid ${C.accentBorder}`, borderRadius: 10, fontFamily: "'Inter',sans-serif",
  outline: "none", boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle, minHeight: 80, resize: "vertical",
};

const labelStyle = { fontSize: 13, fontWeight: 600, color: C.white, marginBottom: 6, display: "block" };
const hintStyle = { fontSize: 11, color: C.textDim, marginTop: 4, lineHeight: 1.5 };

const REVIEW_OPTIONS = [
  { v: "quarterly", l: "Elk kwartaal" },
  { v: "biannual", l: "Halfjaarlijks" },
  { v: "annual", l: "Jaarlijks" },
];

export function OrderQuestionsScreen({ onSubmit, submitting, error }) {
  const [form, setForm] = useState({
    officialName: "",
    aiResponsible: "",
    aiResponsibleRole: "",
    approvedTools: "",
    forbiddenTools: "",
    dataClassification: "standard",
    reviewFrequency: "annual",
    existingPolicies: "",
    remarks: "",
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const valid = form.officialName && form.aiResponsible;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 560, padding: 24, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}><Logo size={200} /></div>

        <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 8, textAlign: "center" }}>
            Aanvullende gegevens
          </h2>
          <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", lineHeight: 1.7, marginBottom: 28 }}>
            Deze informatie gebruiken wij om uw AI-beleid zo specifiek mogelijk te maken voor uw organisatie.
          </p>

          <div style={{ display: "grid", gap: 20 }}>
            {/* Official name */}
            <div>
              <label style={labelStyle}>Officiële naam van uw organisatie *</label>
              <input style={inputStyle} value={form.officialName} onChange={set("officialName")} placeholder="Zoals het in het beleidsdocument moet verschijnen" />
              <p style={hintStyle}>Dit is de naam die in het beleidsdocument wordt gebruikt.</p>
            </div>

            {/* AI responsible */}
            <div>
              <label style={labelStyle}>AI-verantwoordelijke *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input style={inputStyle} value={form.aiResponsible} onChange={set("aiResponsible")} placeholder="Naam" />
                <input style={inputStyle} value={form.aiResponsibleRole} onChange={set("aiResponsibleRole")} placeholder="Functie" />
              </div>
              <p style={hintStyle}>De persoon die verantwoordelijk is voor het AI-beleid binnen uw organisatie.</p>
            </div>

            {/* Approved tools */}
            <div>
              <label style={labelStyle}>Welke AI-tools mogen gebruikt worden?</label>
              <textarea style={textareaStyle} value={form.approvedTools} onChange={set("approvedTools")} placeholder="Bijv. ChatGPT Enterprise, Copilot, Harvey, etc." />
              <p style={hintStyle}>Laat leeg om dit te baseren op uw scanantwoorden.</p>
            </div>

            {/* Forbidden tools */}
            <div>
              <label style={labelStyle}>Welke AI-tools zijn expliciet niet toegestaan?</label>
              <textarea style={textareaStyle} value={form.forbiddenTools} onChange={set("forbiddenTools")} placeholder="Bijv. gratis versies van ChatGPT, onbekende tools, etc." />
            </div>

            {/* Data classification */}
            <div>
              <label style={labelStyle}>Dataclassificatie</label>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { v: "standard", l: "Standaard (openbaar / intern / vertrouwelijk / strikt vertrouwelijk)" },
                  { v: "simple", l: "Eenvoudig (openbaar / vertrouwelijk)" },
                  { v: "custom", l: "Eigen indeling (beschrijf hieronder bij opmerkingen)" },
                ].map((opt) => (
                  <div
                    key={opt.v}
                    onClick={() => setForm({ ...form, dataClassification: opt.v })}
                    style={{
                      padding: 12, borderRadius: 10, cursor: "pointer",
                      border: `1.5px solid ${form.dataClassification === opt.v ? C.accent : C.border}`,
                      background: form.dataClassification === opt.v ? C.accentDim : "transparent",
                      fontSize: 13, color: form.dataClassification === opt.v ? C.accent : C.textMuted,
                    }}
                  >
                    {opt.l}
                  </div>
                ))}
              </div>
            </div>

            {/* Review frequency */}
            <div>
              <label style={labelStyle}>Hoe vaak moet het beleid worden herzien?</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {REVIEW_OPTIONS.map((opt) => (
                  <div
                    key={opt.v}
                    onClick={() => setForm({ ...form, reviewFrequency: opt.v })}
                    style={{
                      padding: 12, borderRadius: 10, cursor: "pointer", textAlign: "center",
                      border: `1.5px solid ${form.reviewFrequency === opt.v ? C.accent : C.border}`,
                      background: form.reviewFrequency === opt.v ? C.accentDim : "transparent",
                      fontSize: 13, color: form.reviewFrequency === opt.v ? C.accent : C.textMuted,
                    }}
                  >
                    {opt.l}
                  </div>
                ))}
              </div>
            </div>

            {/* Existing policies */}
            <div>
              <label style={labelStyle}>Bestaande beleidsregels of richtlijnen</label>
              <textarea style={textareaStyle} value={form.existingPolicies} onChange={set("existingPolicies")} placeholder="Zijn er bestaande regels waar het AI-beleid op moet aansluiten?" />
            </div>

            {/* Remarks */}
            <div>
              <label style={labelStyle}>Overige wensen of opmerkingen</label>
              <textarea style={textareaStyle} value={form.remarks} onChange={set("remarks")} placeholder="Eventuele specifieke wensen voor het beleidsdocument" />
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: C.danger, marginTop: 12 }}>{error}</p>
          )}

          <button
            onClick={() => valid && !submitting && onSubmit(form)}
            disabled={!valid || submitting}
            style={{
              ...btn, width: "100%", padding: "14px 28px", fontSize: 14, fontWeight: 700, marginTop: 24,
              background: valid && !submitting ? C.accent : C.bgInput,
              color: valid && !submitting ? C.black : C.textDim,
              border: `1px solid ${valid && !submitting ? C.accent : C.border}`,
              cursor: valid && !submitting ? "pointer" : "default",
              boxShadow: valid && !submitting ? `0 0 30px ${C.accentDim}` : "none",
              borderRadius: 10,
            }}
          >
            {submitting ? "Beleidsdocument wordt gegenereerd..." : "Genereer mijn AI-beleid \u2192"}
          </button>
        </div>
      </div>
    </div>
  );
}
