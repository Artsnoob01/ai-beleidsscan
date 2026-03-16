import { getStore } from "@netlify/blobs";
import { buildPrompt } from "./prompts.js";
import { sanitizeAnswers } from "./sanitize.js";
import { supabaseInsert } from "./supabase.js";

const WINDOW_MS = 15 * 60 * 1000; // 15 minuten
const MAX_REQUESTS = 10;

async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + "ail-scan-rate-limit-salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function checkRateLimit(req) {
  try {
    const store = getStore("rate-limits");
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipKey = await hashIP(clientIP);
    const now = Date.now();

    const existing = await store.get(ipKey, { type: "json" });

    if (existing && (now - existing.windowStart) < WINDOW_MS) {
      if (existing.count >= MAX_REQUESTS) {
        return { limited: true, ipHash: ipKey };
      }
      await store.setJSON(ipKey, { count: existing.count + 1, windowStart: existing.windowStart });
    } else {
      await store.setJSON(ipKey, { count: 1, windowStart: now });
    }

    return { limited: false, ipHash: ipKey };
  } catch (e) {
    // Fail open: als blob store niet beschikbaar is, request doorlaten
    console.error("Rate limit check failed:", e);
    return { limited: false, ipHash: null };
  }
}

// Edge Function for streaming - no timeout issues on Netlify free tier
export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limiting
  const { limited, ipHash } = await checkRateLimit(req);
  if (limited) {
    return new Response(
      JSON.stringify({ error: "Te veel verzoeken. Probeer het over enkele minuten opnieuw." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "900" } }
    );
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { answers, scores, lang } = body;

    // Validate required fields
    if (!answers || typeof answers !== 'object' ||
        !scores || typeof scores !== 'object' ||
        !lang || !['nl', 'en'].includes(lang)) {
      return new Response(
        JSON.stringify({ error: "Invalid request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize free-text answers and build prompt server-side
    const cleanAnswers = sanitizeAnswers(answers);
    const prompt = buildPrompt(cleanAnswers, scores, lang);

    // Save submission to Supabase (fail-safe: non-blocking)
    let submissionId = null;
    try {
      const row = await supabaseInsert("submissions", {
        answers: cleanAnswers,
        scores,
        lang,
        ip_hash: ipHash,
      });
      submissionId = row?.id ?? null;
    } catch (e) {
      console.error("Supabase insert failed (non-blocking):", e);
    }

    const sanitizedBody = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 5000,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(sanitizedBody),
    });

    if (!response.ok) {
      const errData = await response.text();
      return new Response(
        JSON.stringify({ error: `API error (status ${response.status})` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the response through to the client, prepending submission_id
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Pipe: first our custom event, then the Anthropic stream
    (async () => {
      try {
        // Send submission_id as first SSE event
        if (submissionId) {
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ type: "submission_id", id: submissionId })}\n\n`)
          );
        }

        // Pipe the Anthropic stream
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } catch (e) {
        console.error("Stream error:", e);
      } finally {
        writer.close();
      }
    })();

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error: " + err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const config = {
  path: "/api/generate",
};
