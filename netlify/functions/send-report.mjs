// Sends the generated report as PDF attachment via email using Resend
import { jsPDF } from "jspdf";

const LOGO_URL = "https://images.squarespace-cdn.com/content/v1/669fae01753c7f1a79db39a6/d848d469-55de-4474-b68f-a482cfa12722/Anti-Flash+White+and+Green+2200x400+(presentation).png?format=1500w";

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

    // Generate PDF
    const pdfBase64 = await generatePDF(report, scores, lang);

    // Build email
    const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const subject = lang === "en"
      ? "Your AI Policy Scan - The Innovative Lawyer"
      : "Uw AI-beleidsscan - The Innovative Lawyer";

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
    .content { padding: 36px 40px; }
    .content p { font-size: 14px; line-height: 1.75; color: #374151; margin: 10px 0; }
    .content strong { color: #1a1a2e; }
    .cta { background: #f0fdf8; border: 1px solid rgba(0,212,138,0.25); border-radius: 12px; padding: 28px; text-align: center; margin: 32px 40px; }
    .cta p { font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 16px; }
    .cta a { display: inline-block; padding: 12px 28px; background: #00d48a; color: #000; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="The Innovative Lawyer" style="height: 40px; width: auto;" onerror="this.style.display='none'" />
    </div>
    <div class="content">
      <p>Beste lezer,</p>
      <p>Bedankt voor het invullen van de AI-beleidsscan van The Innovative Lawyer.</p>
      <p>Op basis van uw antwoorden hebben het AI-gebruik binnen uw organisatie getoetst aan drie belangrijke pijlers:</p>
      <p>
        <strong>NOvA</strong>: Hoe verhoudt uw AI-gebruik zich tot de kernwaarden en de Aanbevelingen AI in de advocatuur?<br/>
        <strong>AVG</strong>: Voldoet uw AI-gebruik aan privacyregelgeving?<br/>
        <strong>AI Act</strong>: Handelt u conform de nieuwe Europese AI-regelgeving?
      </p>
      <p>In de bijlage vindt u uw persoonlijke rapport met een uitgebreide analyse per onderdeel en concrete aanbevelingen om uw AI-beleid vorm te geven of te versterken.</p>
      <p>AI-regelgeving ontwikkelt zich snel. Een goed AI-beleid beschermt niet alleen uw kantoor, maar geeft ook vertrouwen aan uw cliënten en medewerkers.</p>
      <p style="margin-top: 24px;">Met vriendelijke groet,<br/><strong>Joyce Boonstra</strong><br/>The Innovative Lawyer<br/>theinnovativelawyer.ai</p>
    </div>
    <div class="cta">
      <p>Wilt u weten hoe u de verbeterpunten uit uw rapport direct kunt aanpakken?</p>
      <a href="mailto:info@theinnovativelawyer.ai?subject=Kennismaking%20AI-beleidsscan">Plan een kennismaking &rarr;</a>
    </div>
  </div>
</body>
</html>`;

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
        attachments: [
          {
            filename: "AI-beleidsscan-rapport.pdf",
            content: pdfBase64,
          },
        ],
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
          await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${submissionId}`, {
            method: "PATCH",
            headers: { ...sbHeaders, "Prefer": "return=minimal" },
            body: JSON.stringify({ email, report }),
          });
        } else {
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

// --- PDF Generation ---

async function fetchLogoBase64() {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    return "data:image/png;base64," + base64;
  } catch {
    return null;
  }
}

async function generatePDF(report, scores, lang) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;
  const bottomMargin = 25;
  let y = 0;

  // Colors
  const green = [0, 212, 138];
  const darkBg = [5, 10, 18];
  const textDark = [30, 30, 46];
  const textGray = [107, 114, 128];

  // --- Header with dark background ---
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageW, 52, "F");

  // Logo
  const logoData = await fetchLogoBase64();
  if (logoData) {
    try {
      // Logo is wide (2200x400 ratio = 5.5:1), scale to fit
      const logoH = 10;
      const logoW = logoH * 5.5;
      const logoX = (pageW - logoW) / 2;
      doc.addImage(logoData, "PNG", logoX, 8, logoW, logoH);
    } catch {
      // Skip logo on error
    }
  }

  // Scores in header
  const scoreColor = (s) => s >= 75 ? [16, 185, 129] : s >= 45 ? [245, 158, 11] : [239, 68, 68];
  const scoreItems = [
    { label: "NOvA", value: scores.orde },
    { label: "AVG / GDPR", value: scores.avg },
    { label: "EU AI Act", value: scores.aiact },
  ];

  const scoreStartX = pageW / 2 - 45;
  scoreItems.forEach((item, i) => {
    const x = scoreStartX + i * 30 + 15;
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...scoreColor(item.value));
    doc.text(String(item.value), x, 32, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(139, 157, 195);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, x, 38, { align: "center" });
  });

  // Overall score
  doc.setFontSize(9);
  doc.setTextColor(...green);
  doc.setFont("helvetica", "bold");
  doc.text(`Overall: ${scores.overall}/100`, pageW / 2, 47, { align: "center" });

  y = 60;

  // --- Parse and render markdown ---
  const lines = report.split("\n");
  let i = 0;

  function checkPageBreak(needed) {
    if (y + needed > pageH - bottomMargin) {
      doc.addPage();
      y = 20;
    }
  }

  function renderWrappedText(text, fontSize, fontStyle, color, indent) {
    indent = indent || 0;
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setTextColor(...color);
    const maxW = contentW - indent;
    const wrapped = doc.splitTextToSize(cleanMarkdown(text), maxW);
    wrapped.forEach((line) => {
      checkPageBreak(fontSize * 0.4 + 1);
      doc.text(line, marginL + indent, y);
      y += fontSize * 0.45;
    });
    y += 1;
  }

  while (i < lines.length) {
    const line = lines[i];

    // H2 heading
    if (line.startsWith("## ")) {
      y += 4;
      checkPageBreak(14);
      const headingText = line.slice(3).trim();
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...green);
      const headingLines = doc.splitTextToSize(headingText, contentW);
      headingLines.forEach((hl) => {
        doc.text(hl, marginL, y);
        y += 5.5;
      });
      // Green underline
      doc.setDrawColor(...green);
      doc.setLineWidth(0.5);
      doc.line(marginL, y - 2, marginL + contentW, y - 2);
      y += 3;
      i++;
      continue;
    }

    // H3 heading
    if (line.startsWith("### ")) {
      y += 2;
      checkPageBreak(10);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textDark);
      doc.text(cleanMarkdown(line.slice(4).trim()), marginL, y);
      y += 6;
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith("- ")) {
      while (i < lines.length && lines[i].startsWith("- ")) {
        const itemText = lines[i].slice(2).trim();
        checkPageBreak(8);
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textDark);
        doc.text("\u2022", marginL + 2, y);
        const wrapped = doc.splitTextToSize(cleanMarkdown(itemText), contentW - 8);
        wrapped.forEach((wl) => {
          checkPageBreak(5);
          doc.text(wl, marginL + 7, y);
          y += 4.2;
        });
        y += 1;
        i++;
      }
      y += 1;
      continue;
    }

    // Ordered list
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      while (i < lines.length) {
        const m = lines[i].match(/^(\d+)\.\s+(.*)$/);
        if (!m) break;
        checkPageBreak(8);
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...green);
        doc.text(m[1] + ".", marginL + 1, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textDark);
        const wrapped = doc.splitTextToSize(cleanMarkdown(m[2]), contentW - 10);
        wrapped.forEach((wl) => {
          checkPageBreak(5);
          doc.text(wl, marginL + 9, y);
          y += 4.2;
        });
        y += 1.5;
        i++;
      }
      y += 1;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      y += 2;
      i++;
      continue;
    }

    // Regular paragraph
    renderWrappedText(line.trim(), 9.5, "normal", textDark);
    i++;
  }

  // --- Footer on last page ---
  y += 8;
  checkPageBreak(20);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, marginL + contentW, y);
  y += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textGray);
  doc.text(`\u00A9 ${new Date().getFullYear()} The Innovative Lawyer - theinnovativelawyer.ai`, pageW / 2, y, { align: "center" });
  y += 4;
  doc.text("Dit rapport is automatisch gegenereerd op basis van uw antwoorden.", pageW / 2, y, { align: "center" });

  // Return base64
  const arrayBuf = doc.output("arraybuffer");
  return Buffer.from(arrayBuf).toString("base64");
}

// Strip markdown formatting for PDF plain text
function cleanMarkdown(text) {
  let s = text;
  // Remove bold
  s = s.replace(/\*\*(.+?)\*\*/g, "$1");
  // Remove italic
  s = s.replace(/\*(.+?)\*/g, "$1");
  // Remove links, keep text
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return s;
}

export const config = {
  path: "/api/send-report",
};
