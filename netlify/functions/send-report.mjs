// Sends the generated report via email using Resend

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { email, report, scores, lang, submissionId } = await req.json();

    if (!email || !report) {
      return new Response(
        JSON.stringify({ error: "Missing email or report." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Server-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return new Response(
        JSON.stringify({ error: "Invalid email address." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert markdown report to HTML for email
    const reportHtml = markdownToHtml(report);

    const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const scoreColor = (s) => s >= 75 ? "#10b981" : s >= 45 ? "#f59e0b" : "#ef4444";
    const scoreLabel = (s) => s >= 75 ? "Goed" : s >= 45 ? "Matig" : "Onvoldoende";

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; }
    .header { background: #050a12; padding: 32px 40px; text-align: center; }
    .header img { height: 40px; width: auto; }
    .badge { display: inline-block; padding: 4px 14px; border-radius: 16px; background: rgba(0,212,138,0.12); border: 1px solid rgba(0,212,138,0.25); margin-bottom: 16px; }
    .badge span { font-size: 10px; font-weight: 700; color: #00d48a; letter-spacing: 1.5px; text-transform: uppercase; }
    .scores { background: #050a12; padding: 24px 40px 32px; text-align: center; }
    .score-grid { display: inline-flex; gap: 24px; margin-top: 16px; }
    .score-item { text-align: center; }
    .score-num { font-size: 32px; font-weight: 800; }
    .score-label { font-size: 11px; color: #8b9dc3; margin-top: 4px; }
    .content { padding: 36px 40px; }
    .content h2 { font-size: 18px; font-weight: 800; color: #00d48a; margin-top: 28px; margin-bottom: 10px; border-bottom: 2px solid #e8e8e8; padding-bottom: 6px; }
    .content h3 { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-top: 20px; margin-bottom: 8px; }
    .content p { font-size: 14px; line-height: 1.75; color: #374151; margin: 6px 0; }
    .content ol { padding-left: 20px; margin: 10px 0; }
    .content li { font-size: 14px; line-height: 1.75; color: #374151; margin-bottom: 8px; }
    .content ul { padding-left: 20px; margin: 10px 0; }
    .content ul li { list-style-type: disc; }
    .content a { color: #00d48a; text-decoration: underline; }
    .content strong { color: #1a1a2e; }
    .content em { color: #6b7280; }
    .cta { background: #f0fdf8; border: 1px solid rgba(0,212,138,0.25); border-radius: 12px; padding: 28px; text-align: center; margin: 32px 40px; }
    .cta h3 { font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
    .cta p { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 16px; }
    .cta a { display: inline-block; padding: 12px 28px; background: #00d48a; color: #000; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; }
    .footer { padding: 24px 40px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 11px; color: #9ca3af; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://theinnovativelawyer.ai/logo.webp" alt="The Innovative Lawyer" style="height: 40px;" onerror="this.style.display='none'" />
    </div>
    <div class="scores">
      <div class="badge"><span>AI Compliance Rapport</span></div>
      <div>
        <div style="font-size: 48px; font-weight: 800; color: ${scoreColor(scores.overall)}">${scores.overall}</div>
        <div style="font-size: 13px; font-weight: 600; color: ${scoreColor(scores.overall)}">${scoreLabel(scores.overall)}</div>
      </div>
      <div class="score-grid">
        <div class="score-item">
          <div class="score-num" style="color: ${scoreColor(scores.orde)}">${scores.orde}</div>
          <div class="score-label">NOvA</div>
        </div>
        <div class="score-item">
          <div class="score-num" style="color: ${scoreColor(scores.avg)}">${scores.avg}</div>
          <div class="score-label">AVG / GDPR</div>
        </div>
        <div class="score-item">
          <div class="score-num" style="color: ${scoreColor(scores.aiact)}">${scores.aiact}</div>
          <div class="score-label">EU AI Act</div>
        </div>
      </div>
    </div>
    <div class="content">
      <p style="font-size: 13px; color: #6b7280; line-height: 1.7; padding: 14px 18px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
        Dit rapport is opgesteld op basis van uw antwoorden, getoetst aan drie kaders: de
        <a href="https://www.advocatenorde.nl/document/nova-aanbevelingen-ai-in-de-advocatuur-2025">NOvA-aanbevelingen</a> (november 2025), het AP-beleidsdocument
        <a href="https://autoriteitpersoonsgegevens.nl/system/files?file=2026-02/verantwoord-vooruit-ap-visie-op-generatieve-ai.pdf">Verantwoord Vooruit</a> (februari 2026) en de
        <a href="https://artificialintelligenceact.eu/article/4/">EU AI Act</a>.
      </p>
      ${reportHtml}
    </div>
    <div class="cta">
      <h3>Van scan naar werkend AI-beleid?</h3>
      <p>Ontvang een compleet AI-beleidsdocument op maat — kant-en-klaar voor uw kantoor, gebaseerd op uw antwoorden en getoetst aan NOvA, AVG en AI Act.</p>
      <a href="mailto:info@theinnovativelawyer.ai?subject=AI-beleidsscan%20opvolging">Plan een kennismaking →</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} The Innovative Lawyer · Dit rapport is automatisch gegenereerd op basis van uw antwoorden.</p>
    </div>
  </div>
</body>
</html>`;

    const subject = lang === "en"
      ? "Your AI Compliance Report — The Innovative Lawyer"
      : "Uw AI-compliance rapport — The Innovative Lawyer";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject,
        html: htmlBody,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || "Failed to send email" }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save email + report to Supabase (fail-safe: non-blocking)
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
      if (supabaseUrl && supabaseKey) {
        const sbHeaders = {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        };
        if (submissionId) {
          // Update existing row with email + report
          await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${submissionId}`, {
            method: "PATCH",
            headers: { ...sbHeaders, "Prefer": "return=minimal" },
            body: JSON.stringify({ email, report }),
          });
        } else {
          // No submissionId — insert a new row
          await fetch(`${supabaseUrl}/rest/v1/submissions`, {
            method: "POST",
            headers: { ...sbHeaders, "Prefer": "return=minimal" },
            body: JSON.stringify({ email, report, scores, lang }),
          });
        }
      }
    } catch (e) {
      console.error("Supabase save failed (non-blocking):", e);
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error: " + err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Simple markdown to HTML converter for the email
function markdownToHtml(md) {
  if (!md) return "";
  let html = "";
  const lines = md.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      html += `<h2>${escHtml(line.slice(3))}</h2>`;
      i++; continue;
    }
    if (line.startsWith("### ")) {
      html += `<h3>${escHtml(line.slice(4))}</h3>`;
      i++; continue;
    }
    if (line.startsWith("- ")) {
      html += "<ul>";
      while (i < lines.length && lines[i].startsWith("- ")) {
        html += `<li>${inlineToHtml(lines[i].slice(2))}</li>`;
        i++;
      }
      html += "</ul>"; continue;
    }
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      html += "<ol>";
      while (i < lines.length) {
        const m = lines[i].match(/^(\d+)\.\s+(.*)$/);
        if (!m) break;
        html += `<li>${inlineToHtml(m[2])}</li>`;
        i++;
      }
      html += "</ol>"; continue;
    }
    if (line.trim() === "") { i++; continue; }
    html += `<p>${inlineToHtml(line)}</p>`;
    i++;
  }
  return html;
}

function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineToHtml(text) {
  let s = escHtml(text);
  // Bold
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Links
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

export const config = {
  path: "/api/send-report",
};
