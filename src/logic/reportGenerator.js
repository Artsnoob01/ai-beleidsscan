// Prompt wordt server-side opgebouwd — client stuurt alleen answers, scores en lang.

export async function genReport(answers, scores, lang, retries = 2, onChunk = null) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, scores, lang }),
      });

      if (!r.ok) {
        const status = r.status;
        if (status === 429 && attempt < retries) {
          await new Promise(res => setTimeout(res, 2000 * (attempt + 1)));
          continue;
        }
        if (status >= 500 && attempt < retries) {
          await new Promise(res => setTimeout(res, 1500 * (attempt + 1)));
          continue;
        }
        if (status === 429) {
          throw new Error("Te veel verzoeken. Probeer het over enkele minuten opnieuw.");
        }
        throw new Error(`API fout (status ${status})`);
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";
      let submissionId = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "submission_id") {
              submissionId = parsed.id;
              continue;
            }
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              fullText += parsed.delta.text;
              if (onChunk) onChunk(fullText);
            }
          } catch (e) {
            // skip unparseable lines
          }
        }
      }

      if (!fullText) throw new Error("Leeg antwoord van API");
      return { ok: true, text: fullText, submissionId };
    } catch (err) {
      if (attempt === retries) {
        return {
          ok: false,
          text: "",
          error: err.message || "Er is een onbekende fout opgetreden.",
        };
      }
    }
  }
  return { ok: false, text: "", error: "Maximaal aantal pogingen bereikt." };
}
