import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const ANVIL_CONTEXT = `Anvil is an operations-focused consultancy that designs and builds internal systems for companies so their operations become a source of competitive advantage rather than just admin or box-ticking.

Anvil is a team of strategists, designers, and engineers who:
- Architect operational systems that create clarity and empower teams
- Deliver pragmatic, short-cycle projects aimed at tangible value rather than long, multi-year programmes
- Embed with clients as a partner, then hand over systems with training and documentation so the client fully owns and runs them

Anvil's website: https://www.anvil-online.com`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ok = (body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* ------------------------------------------------------------------ */
/*  Fetch and extract text content from a website                     */
/* ------------------------------------------------------------------ */
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    const res = await fetch(fullUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AnvilCRM/1.0; +https://www.anvil-online.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return `[Could not fetch website: HTTP ${res.status}]`;
    }

    const html = await res.text();

    // Strip HTML to plain text
    let text = html
      // Remove script and style blocks entirely
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Convert common block elements to newlines
      .replace(
        /<\/?(div|p|h[1-6]|li|tr|br|hr|section|article|header|footer|nav|main|aside|blockquote)[^>]*>/gi,
        "\n",
      )
      // Remove all remaining tags
      .replace(/<[^>]+>/g, " ")
      // Decode common HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&#\d+;/g, " ")
      .replace(/&\w+;/g, " ")
      // Collapse whitespace
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    // Truncate to ~12000 chars to stay within token limits
    const MAX_CHARS = 12000;
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS) + "\n\n[Content truncated]";
    }

    return text || "[Website returned empty content]";
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return `[Could not fetch website: ${msg}]`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!GEMINI_API_KEY) {
    return ok({ error: "GEMINI_API_KEY not configured as a Supabase secret." });
  }

  try {
    const { website, companyName, contactName, contactRole, messages, stream } =
      await req.json();

    // Fetch actual website content for the initial request
    let websiteContent = "";
    const isInitialRequest =
      messages?.length === 1 && messages[0]?.role === "user";

    if (website && isInitialRequest) {
      websiteContent = await fetchWebsiteContent(website);
    }

    const websiteSection = websiteContent
      ? `\n\n--- WEBSITE CONTENT (scraped from ${website}) ---\n${websiteContent}\n--- END WEBSITE CONTENT ---`
      : "";

    const systemPrompt = `You are a sales intelligence assistant for Anvil.

${ANVIL_CONTEXT}

You are analysing a prospect's company to help an Anvil consultant prepare for outreach.

Company: ${companyName}
Website: ${website}
Contact: ${contactName}, ${contactRole}${websiteSection}

Guidelines:
- When first asked, provide a concise company brief covering:
  1. What the company does (use the actual website content provided above, not guesses)
  2. Key alignment points — where Anvil's operational systems expertise could add value
  3. Potential talking points for outreach
  4. Any relevant industry context
- Base your analysis on the actual website content provided — do not fabricate or assume information not present in the content
- Keep responses concise, practical, and focused on actionable sales intelligence
- Use British English spelling
- Format with clear sections using markdown headers (##) and bullet points for scannability
- For follow-up questions, provide focused answers relevant to Anvil's sales process`;

    const geminiContents = (messages as ChatMessage[]).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Streaming mode
    if (stream) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiContents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      });

      if (!geminiRes.ok) {
        const errorBody = await geminiRes.text();
        return ok({ error: `Gemini ${geminiRes.status}: ${errorBody}` });
      }

      // Pipe the SSE stream through to the client
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const reader = geminiRes.body!.getReader();

      const readable = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  if (!jsonStr || jsonStr === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(jsonStr);
                    const text =
                      parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    const thought =
                      parsed.candidates?.[0]?.content?.parts?.[0]?.thought;

                    if (thought) {
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: "thinking" })}\n\n`,
                        ),
                      );
                    } else if (text) {
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: "text", text })}\n\n`,
                        ),
                      );
                    }
                  } catch {
                    // skip unparseable lines
                  }
                }
              }
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
            );
            controller.close();
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Stream error";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", text: msg })}\n\n`,
              ),
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming fallback
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    });

    if (!geminiRes.ok) {
      const errorBody = await geminiRes.text();
      return ok({ error: `Gemini ${geminiRes.status}: ${errorBody}` });
    }

    const geminiData = await geminiRes.json();
    const response =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    return ok({ response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return ok({ error: message });
  }
});
