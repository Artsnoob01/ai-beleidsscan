// Processes an order: saves to Supabase, triggers policy generation, sends notifications

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { name, firm, email, address, postcode, city, variant, submissionId } = await req.json();

    // Validation
    if (!name || !firm || !email || !address || !postcode || !city || !variant || !submissionId) {
      return new Response(JSON.stringify({ error: "Alle velden zijn verplicht." }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: "Ongeldig e-mailadres." }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // 1. Fetch original scan answers from Supabase
    let answers = null;
    let scores = null;
    let lang = "nl";
    if (supabaseUrl && supabaseKey) {
      const sbHeaders = {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      };

      // Fetch submission
      const subRes = await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${submissionId}&select=answers,scores,lang`, {
        headers: sbHeaders,
      });
      if (subRes.ok) {
        const rows = await subRes.json();
        if (rows.length > 0) {
          answers = rows[0].answers;
          scores = rows[0].scores;
          lang = rows[0].lang || "nl";
        }
      }

      // 2. Save order to Supabase
      await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: "POST",
        headers: { ...sbHeaders, "Prefer": "return=representation" },
        body: JSON.stringify({
          submission_id: submissionId,
          variant,
          name,
          firm,
          email,
          billing_address: `${address}, ${postcode} ${city}`,
          status: variant === "standard" ? "generating" : "pending_review",
        }),
      });
    }

    // 3. Send notification email to team
    if (resendKey) {
      const variantLabel = variant === "standard" ? "Standaard (\u20AC499)" : "Premium (\u20AC999)";
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: fromAddress,
          to: ["info@theinnovativelawyer.ai"],
          subject: `Nieuwe bestelling: ${variantLabel} - ${firm}`,
          html: `
            <h2>Nieuwe bestelling AI-beleid</h2>
            <p><strong>Variant:</strong> ${variantLabel}</p>
            <p><strong>Naam:</strong> ${name}</p>
            <p><strong>Kantoor:</strong> ${firm}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Factuuradres:</strong> ${address}, ${postcode} ${city}</p>
            <p><strong>Scan ID:</strong> ${submissionId}</p>
            ${variant === "premium" ? "<p><strong>Actie vereist:</strong> Het beleidsdocument wordt gegenereerd en naar jullie gestuurd ter review.</p>" : "<p>Het beleidsdocument wordt automatisch gegenereerd en naar de klant gestuurd.</p>"}
          `,
        }),
      });
    }

    // 4. For standard variant: generate and send policy immediately
    if (variant === "standard" && answers && scores) {
      try {
        await generateAndSendPolicy({ answers, scores, lang, email, name, firm, submissionId, supabaseUrl, supabaseKey, resendKey, fromAddress });
      } catch (e) {
        console.error("Policy generation failed:", e);
        // Still return success to client - they'll get a notification
      }
    }

    // 5. For premium variant: generate and send to team for review
    if (variant === "premium" && answers && scores) {
      try {
        await generateAndSendPolicy({ answers, scores, lang, email: "info@theinnovativelawyer.ai", name, firm, submissionId, supabaseUrl, supabaseKey, resendKey, fromAddress, isReview: true, clientEmail: email });
      } catch (e) {
        console.error("Policy generation for review failed:", e);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error: " + err.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
}

// Generate policy document with Claude and send as PDF
async function generateAndSendPolicy({ answers, scores, lang, email, name, firm, submissionId, supabaseUrl, supabaseKey, resendKey, fromAddress, isReview, clientEmail }) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const prompt = buildPolicyPrompt(answers, scores, lang, name, firm);

  // Call Claude API (non-streaming for serverless)
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const policyText = data.content?.[0]?.text || "";

  if (!policyText) throw new Error("Empty policy response");

  // Generate PDF
  const { jsPDF } = await import("jspdf");
  const pdfBase64 = await generatePolicyPDF(jsPDF, policyText, scores, name, firm);

  // Send email with PDF
  if (resendKey) {
    const subject = isReview
      ? `[REVIEW] AI-beleid voor ${firm} - ter controle`
      : `Uw AI-beleid - The Innovative Lawyer`;

    const htmlBody = isReview
      ? `<p>Hierbij het automatisch gegenereerde AI-beleidsdocument voor <strong>${firm}</strong> ter review.</p>
         <p><strong>Klant:</strong> ${name} (${clientEmail})</p>
         <p><strong>Scan ID:</strong> ${submissionId}</p>
         <p>Na review en eventuele aanvullingen, stuur het definitieve document door naar de klant.</p>`
      : `<p>Beste ${name},</p>
         <p>Hierbij ontvangt u het AI-beleidsdocument voor ${firm}, opgesteld op basis van uw AI-beleidsscan.</p>
         <p>Dit document is automatisch gegenereerd op basis van uw antwoorden en de actuele wet- en regelgeving (NOvA-aanbevelingen, AVG en EU AI Act). Wij adviseren u het document te controleren en waar nodig aan te passen aan de specifieke situatie van uw organisatie voordat u het vaststelt als beleid.</p>
         <p>Heeft u vragen of wilt u het document laten reviewen door onze specialisten? Neem gerust contact op.</p>
         <p>Met vriendelijke groet,<br/><strong>Joyce Boonstra</strong><br/>The Innovative Lawyer<br/>theinnovativelawyer.ai</p>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject,
        html: htmlBody,
        attachments: [{
          filename: `AI-beleid-${firm.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`,
          content: pdfBase64,
        }],
      }),
    });
  }

  // Update order status in Supabase
  if (supabaseUrl && supabaseKey) {
    const sbHeaders = {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal",
    };
    await fetch(`${supabaseUrl}/rest/v1/orders?submission_id=eq.${submissionId}`, {
      method: "PATCH",
      headers: sbHeaders,
      body: JSON.stringify({
        status: isReview ? "review_sent" : "delivered",
        policy: policyText,
      }),
    });
  }
}

// Placeholder policy prompt - replace with final version when ready
function buildPolicyPrompt(answers, scores, lang, name, firm) {
  const ctx = `Organisatie: ${firm}
Contactpersoon: ${name}
Antwoorden uit de AI-beleidsscan: ${JSON.stringify(answers)}
Scores: NOvA ${scores.orde}/100, AVG ${scores.avg}/100, AI Act ${scores.aiact}/100, Overall ${scores.overall}/100.`;

  return `Je bent een AI-compliance specialist voor de Nederlandse advocatuur. Op basis van onderstaande scanresultaten schrijf je een compleet, kant-en-klaar AI-beleidsdocument voor ${firm}.

${ctx}

INSTRUCTIES:
- Schrijf een professioneel AI-beleidsdocument in het Nederlands
- Het document moet direct bruikbaar zijn als intern beleid
- Gebruik de volgende structuur met ## koppen:

## 1. Inleiding en doel
Beschrijf het doel van het AI-beleid en de scope.

## 2. Definities
Definieer relevante termen (AI, generatieve AI, persoonsgegevens, etc.).

## 3. Governance en verantwoordelijkheden
Wie is verantwoordelijk voor AI-beleid, toezicht en naleving.

## 4. Goedgekeurde AI-tools
Welke tools mogen worden gebruikt en onder welke voorwaarden. Baseer dit op de tools die het kantoor heeft aangegeven te gebruiken.

## 5. Toegestaan gebruik
Waarvoor mag AI worden ingezet en welke data mag worden ingevoerd.

## 6. Verboden gebruik
Wat mag niet, inclusief vertrouwelijke data in ongoedgekeurde tools.

## 7. Verificatie en kwaliteitscontrole
Hoe wordt AI-output gecontroleerd op juistheid.

## 8. Privacy en AVG-compliance
DPIA, verwerkersovereenkomsten, dataclassificatie.

## 9. Clientcommunicatie
Hoe worden clienten geinformeerd over AI-gebruik.

## 10. Training en AI-geletterdheid
Wat wordt verwacht qua kennis en opleiding (art. 4 AI Act).

## 11. Incidentprocedure
Wat te doen bij een AI-gerelateerd incident of datalek.

## 12. Review en actualisatie
Hoe vaak wordt het beleid herzien.

Schrijf professioneel, concreet en specifiek voor ${firm}. Verwijs naar de NOvA-aanbevelingen, AVG en EU AI Act waar relevant, maar zonder URLs of klikbare links. Maximaal 4000 woorden.`;
}

// Generate policy PDF
async function generatePolicyPDF(jsPDF, policyText, scores, name, firm) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const marginL = 20;
  const contentW = pageW - 40;
  const bottomMargin = 25;
  let y = 0;

  const green = [0, 212, 138];
  const darkBg = [5, 10, 18];
  const textDark = [30, 30, 46];
  const textGray = [107, 114, 128];

  // Header
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageW, 40, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...green);
  doc.text("AI-beleid", pageW / 2, 18, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(firm, pageW / 2, 28, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(139, 157, 195);
  doc.text(`Gegenereerd: ${new Date().toLocaleDateString("nl-NL")}`, pageW / 2, 35, { align: "center" });

  y = 50;

  // Parse markdown
  const lines = policyText.split("\n");
  let i = 0;

  function checkPageBreak(needed) {
    if (y + needed > pageH - bottomMargin) {
      doc.addPage();
      y = 20;
    }
  }

  function cleanMd(text) {
    return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      y += 6;
      checkPageBreak(14);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...green);
      const headingLines = doc.splitTextToSize(line.slice(3).trim(), contentW);
      headingLines.forEach((hl) => { doc.text(hl, marginL, y); y += 5.5; });
      doc.setDrawColor(...green);
      doc.setLineWidth(0.5);
      doc.line(marginL, y - 2, marginL + contentW, y - 2);
      y += 3;
      i++; continue;
    }

    if (line.startsWith("### ")) {
      y += 3;
      checkPageBreak(10);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textDark);
      doc.text(cleanMd(line.slice(4).trim()), marginL, y);
      y += 6;
      i++; continue;
    }

    if (line.startsWith("- ")) {
      while (i < lines.length && lines[i].startsWith("- ")) {
        checkPageBreak(8);
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textDark);
        doc.text("\u2022", marginL + 2, y);
        const wrapped = doc.splitTextToSize(cleanMd(lines[i].slice(2).trim()), contentW - 8);
        wrapped.forEach((wl) => { checkPageBreak(5); doc.text(wl, marginL + 7, y); y += 4.2; });
        y += 1; i++;
      }
      y += 1; continue;
    }

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
        const wrapped = doc.splitTextToSize(cleanMd(m[2]), contentW - 10);
        wrapped.forEach((wl) => { checkPageBreak(5); doc.text(wl, marginL + 9, y); y += 4.2; });
        y += 1.5; i++;
      }
      y += 1; continue;
    }

    if (line.trim() === "") { y += 2; i++; continue; }

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    const wrapped = doc.splitTextToSize(cleanMd(line.trim()), contentW);
    wrapped.forEach((wl) => { checkPageBreak(5); doc.text(wl, marginL, y); y += 4.2; });
    y += 1; i++;
  }

  // Disclaimer
  y += 8;
  checkPageBreak(25);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, marginL + contentW, y);
  y += 6;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...textGray);
  const disclaimer = "Disclaimer: Dit AI-beleidsdocument is automatisch gegenereerd op basis van de ingevulde AI-beleidsscan en actuele wet- en regelgeving. Het document dient als uitgangspunt en moet door uw organisatie worden gecontroleerd en waar nodig aangepast voordat het wordt vastgesteld als beleid. The Innovative Lawyer is niet aansprakelijk voor de volledigheid of juistheid van dit document.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentW);
  disclaimerLines.forEach((dl) => { doc.text(dl, marginL, y); y += 3.5; });

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.text(`\u00A9 ${new Date().getFullYear()} The Innovative Lawyer - theinnovativelawyer.ai`, pageW / 2, y, { align: "center" });

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
}

export const config = {
  path: "/api/process-order",
};
