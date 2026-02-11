"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Contact } from "@/lib/crm-data";
import { createBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CompanyChatbotProps {
  contact: Contact;
  /** When true, renders without the fixed-position wrapper (for embedding in mobile panel) */
  embedded?: boolean;
}

const THINKING_PHASES = [
  "Looking up company",
  "Reviewing website",
  "Analysing business model",
  "Identifying alignment",
  "Preparing brief",
];

/* ------------------------------------------------------------------ */
/*  Lightweight markdown → JSX (no external deps)                     */
/* ------------------------------------------------------------------ */
function renderMarkdown(md: string): ReactNode[] {
  const lines = md.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;
  let key = 0;

  function inlineFormat(text: string): ReactNode {
    const parts: ReactNode[] = [];
    let remaining = text;
    let partKey = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const italicMatch = remaining.match(
        /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/,
      );
      const codeMatch = remaining.match(/`(.+?)`/);
      const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

      const matches = [
        boldMatch ? { type: "bold", match: boldMatch } : null,
        italicMatch ? { type: "italic", match: italicMatch } : null,
        codeMatch ? { type: "code", match: codeMatch } : null,
        linkMatch ? { type: "link", match: linkMatch } : null,
      ]
        .filter(Boolean)
        .sort((a, b) => a!.match.index! - b!.match.index!);

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const first = matches[0]!;
      const idx = first.match.index!;

      if (idx > 0) {
        parts.push(remaining.slice(0, idx));
      }

      if (first.type === "bold") {
        parts.push(
          <strong key={partKey++} className="font-semibold text-white/60">
            {first.match[1]}
          </strong>,
        );
      } else if (first.type === "italic") {
        parts.push(
          <em key={partKey++} className="italic text-white/45">
            {first.match[1]}
          </em>,
        );
      } else if (first.type === "code") {
        parts.push(
          <code
            key={partKey++}
            className="text-[13px] text-white/50 bg-white/[0.05] px-1.5 py-0.5 rounded"
          >
            {first.match[1]}
          </code>,
        );
      } else if (first.type === "link") {
        parts.push(
          <a
            key={partKey++}
            href={first.match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 underline underline-offset-2 decoration-white/15 hover:text-white/70 transition-colors"
          >
            {first.match[1]}
          </a>,
        );
      }
      remaining = remaining.slice(idx + first.match[0].length);
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={key++}
          className="text-sm font-medium text-white/55 mt-4 mb-1.5 first:mt-0"
        >
          {inlineFormat(line.slice(4))}
        </h4>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={key++}
          className="text-sm font-semibold text-white/60 mt-5 mb-2 first:mt-0"
        >
          {inlineFormat(line.slice(3))}
        </h3>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2
          key={key++}
          className="text-[15px] font-semibold text-white/60 mt-5 mb-2 first:mt-0"
        >
          {inlineFormat(line.slice(2))}
        </h2>,
      );
      i++;
      continue;
    }

    if (/^[-*_]{3,}$/.test(line.trim())) {
      elements.push(<hr key={key++} className="border-white/[0.06] my-5" />);
      i++;
      continue;
    }

    if (/^[\s]*[-*+]\s/.test(line)) {
      const items: ReactNode[] = [];
      let itemKey = 0;
      while (i < lines.length && /^[\s]*[-*+]\s/.test(lines[i])) {
        const text = lines[i].replace(/^[\s]*[-*+]\s+/, "");
        items.push(
          <li
            key={itemKey++}
            className="text-sm leading-[1.7] text-white/45 marker:text-white/15"
          >
            {inlineFormat(text)}
          </li>,
        );
        i++;
      }
      elements.push(
        <ul key={key++} className="mb-3 pl-4 space-y-1 list-disc">
          {items}
        </ul>,
      );
      continue;
    }

    if (/^[\s]*\d+[.)]\s/.test(line)) {
      const items: ReactNode[] = [];
      let itemKey = 0;
      while (i < lines.length && /^[\s]*\d+[.)]\s/.test(lines[i])) {
        const text = lines[i].replace(/^[\s]*\d+[.)]\s+/, "");
        items.push(
          <li
            key={itemKey++}
            className="text-sm leading-[1.7] text-white/45 marker:text-white/15"
          >
            {inlineFormat(text)}
          </li>,
        );
        i++;
      }
      elements.push(
        <ol key={key++} className="mb-3 pl-4 space-y-1 list-decimal">
          {items}
        </ol>,
      );
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={key++}
          className="border-l-2 border-white/10 pl-4 text-white/35 mb-3 text-sm"
        >
          {inlineFormat(quoteLines.join(" "))}
        </blockquote>,
      );
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      !/^[\s]*[-*+]\s/.test(lines[i]) &&
      !/^[\s]*\d+[.)]\s/.test(lines[i]) &&
      !/^[-*_]{3,}$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(
        <p
          key={key++}
          className="mb-3 last:mb-0 text-sm leading-[1.8] text-white/45"
        >
          {inlineFormat(paraLines.join(" "))}
        </p>,
      );
    }
  }

  return elements;
}

/* ------------------------------------------------------------------ */
/*  In-memory cache for follow-up messages (session only)             */
/* ------------------------------------------------------------------ */
const followUpCache = new Map<string, Message[]>();

/* ------------------------------------------------------------------ */

export function CompanyChatbot({
  contact,
  embedded = false,
}: CompanyChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const [hideFirstPrompt, setHideFirstPrompt] = useState(false);
  const [savedBrief, setSavedBrief] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef(contact);
  const abortRef = useRef(false);
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  contactRef.current = contact;

  /* Auto-scroll: use scrollTop instead of scrollIntoView to avoid layout thrashing */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading, streamingText]);

  const startThinking = useCallback(() => {
    setThinkingPhase(0);
    let phase = 0;
    thinkingIntervalRef.current = setInterval(() => {
      phase = (phase + 1) % THINKING_PHASES.length;
      setThinkingPhase(phase);
    }, 2800);
  }, []);

  const stopThinking = useCallback(() => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
  }, []);

  /* ---- Supabase: load saved brief ---- */
  async function loadBrief(): Promise<string | null> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("company_intel")
      .select("brief")
      .eq("contact_id", contact.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("[CompanyChatbot] loadBrief error:", error.message);
      return null;
    }
    return data?.brief || null;
  }

  /* ---- Supabase: save/update brief (shared — one brief per contact) ---- */
  async function saveBrief(
    brief: string,
    forContactId: string,
    forWebsite: string,
  ) {
    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn("[CompanyChatbot] saveBrief: no user session");
        return;
      }

      // Delete any existing briefs for this contact (from any user)
      await supabase
        .from("company_intel")
        .delete()
        .eq("contact_id", forContactId);

      // Insert fresh
      const { error } = await supabase.from("company_intel").insert({
        user_id: user.id,
        contact_id: forContactId,
        brief,
        website_used: forWebsite,
      });

      if (error) {
        console.error("[CompanyChatbot] saveBrief failed:", error.message);
      }
    } catch (err) {
      console.error("[CompanyChatbot] saveBrief exception:", err);
    }
  }

  /* ---- Call edge function ---- */
  async function callEdgeFunction(
    allMessages: Message[],
    persistBrief: boolean,
  ) {
    const c = contactRef.current;
    const capturedContactId = c.id;
    const capturedWebsite = c.website;
    const supabase = createBrowserClient();

    startThinking();
    setStreamingText("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/Sales-Chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || supabaseAnonKey}`,
          apikey: supabaseAnonKey || "",
        },
        body: JSON.stringify({
          website: c.website,
          companyName: c.company,
          contactName: c.name,
          contactRole: c.role,
          messages: allMessages,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Edge function error: ${res.status} ${errorText}`);
      }

      const contentType = res.headers.get("content-type") || "";
      let responseText = "";

      if (contentType.includes("text/event-stream")) {
        stopThinking();
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (abortRef.current) {
            reader.cancel();
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);

              if (parsed.type === "thinking") {
                startThinking();
              } else if (parsed.type === "text") {
                stopThinking();
                responseText += parsed.text;
                setStreamingText(responseText);
              } else if (parsed.type === "done") {
                if (responseText && !abortRef.current) {
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: responseText },
                  ]);
                  setStreamingText("");
                }
              } else if (parsed.type === "error") {
                if (!abortRef.current) {
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: parsed.text },
                  ]);
                }
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }

        // Safety net after stream ends
        if (responseText && !abortRef.current) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.content === responseText) return prev;
            return [...prev, { role: "assistant", content: responseText }];
          });
          setStreamingText("");
        }
      } else {
        // JSON fallback
        stopThinking();
        const data = await res.json();
        responseText =
          data?.response || data?.error || "No response generated.";
        if (!abortRef.current) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: responseText },
          ]);
        }
      }

      if (persistBrief && responseText) {
        if (!abortRef.current) {
          setSavedBrief(responseText);
        }
        saveBrief(responseText, capturedContactId, capturedWebsite);
      }
    } catch (err) {
      stopThinking();
      if (!abortRef.current) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Unable to connect.\n${msg}` },
        ]);
      }
    } finally {
      stopThinking();
      if (!abortRef.current) {
        setLoading(false);
        setStreamingText("");
      }
    }
  }

  /* ---- On contact change: load from DB or fetch fresh ---- */
  useEffect(() => {
    abortRef.current = false;
    setInput("");
    setLoading(false);
    setStreamingText("");
    setHideFirstPrompt(false);
    setSavedBrief(null);
    stopThinking();

    if (!contact.website) {
      setMessages([]);
      return () => {
        abortRef.current = true;
        stopThinking();
      };
    }

    let cancelled = false;

    async function init() {
      const brief = await loadBrief();

      if (cancelled) return;

      if (brief) {
        setSavedBrief(brief);
        const restored: Message[] = [{ role: "assistant", content: brief }];
        const followUps = followUpCache.get(contact.id);
        if (followUps) {
          restored.push(...followUps);
        }
        setMessages(restored);
        setHideFirstPrompt(false);
      } else {
        const prompt = `Analyse ${contact.company}'s website (${contact.website}) and provide a brief on who they are, what they do, and how Anvil's services could align with their needs.`;
        const initial: Message[] = [{ role: "user", content: prompt }];
        setMessages(initial);
        setHideFirstPrompt(true);
        setLoading(true);

        setTimeout(() => {
          if (!cancelled && !abortRef.current) {
            callEdgeFunction(initial, true);
          }
        }, 100);
      }
    }

    init();

    return () => {
      cancelled = true;
      abortRef.current = true;
      stopThinking();
    };
  }, [contact.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Save follow-up messages to session cache ---- */
  useEffect(() => {
    if (savedBrief && messages.length > 1) {
      const followUps = messages.slice(1);
      if (followUps.length > 0) {
        followUpCache.set(contact.id, followUps);
      }
    }
  }, [messages, savedBrief, contact.id]);

  /* ---- Refresh brief ---- */
  async function handleRefresh() {
    if (loading || !contact.website) return;

    setMessages([]);
    setStreamingText("");
    setSavedBrief(null);
    setHideFirstPrompt(true);
    followUpCache.delete(contact.id);

    const prompt = `Analyse ${contact.company}'s website (${contact.website}) and provide a brief on who they are, what they do, and how Anvil's services could align with their needs.`;
    const initial: Message[] = [{ role: "user", content: prompt }];
    setMessages(initial);
    setLoading(true);

    await callEdgeFunction(initial, true);
  }

  /* ---- Send follow-up ---- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const updated: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(updated);
    setInput("");
    setLoading(true);
    await callEdgeFunction(updated, false);
  }

  const hasWebsite = !!contact.website;

  /* ---- Memoize rendered messages so they don't re-parse on stream updates ---- */
  const renderedMessages = useMemo(
    () =>
      messages.map((message, i) => (
        <div
          key={i}
          className={cn(
            "min-w-0",
            i === 0 && hideFirstPrompt && message.role === "user" && "hidden",
          )}
        >
          {message.role === "assistant" ? (
            <div className="min-w-0 break-words">
              {renderMarkdown(message.content)}
            </div>
          ) : (
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-xl bg-white/[0.05] px-4 py-3 text-sm text-white/50">
                {message.content}
              </p>
            </div>
          )}
        </div>
      )),
    [messages, hideFirstPrompt],
  );

  /* ---- Memoize streaming markdown so it only re-parses when streamingText changes ---- */
  const renderedStreaming = useMemo(() => {
    if (!streamingText) return null;
    return renderMarkdown(streamingText);
  }, [streamingText]);

  /* ---- Shared inner content (used in both modes) ---- */
  const headerContent = (
    <>
      <div
        className={cn(
          "flex items-center justify-between",
          embedded ? "px-5 pt-4 pb-3" : "px-7 pt-6 pb-4",
        )}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-white/25 mb-1">
            Company Intel
          </p>
          <p className="text-base font-medium text-white/55">
            {contact.company || contact.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasWebsite && savedBrief && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              title="Regenerate brief"
              className="text-white/15 hover:text-white/35 transition-colors disabled:opacity-30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </button>
          )}
          {contact.website && (
            <a
              href={
                contact.website.startsWith("http")
                  ? contact.website
                  : `https://${contact.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              {contact.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>
      <div className={cn(embedded ? "mx-5" : "mx-7", "h-px bg-white/[0.05]")} />
    </>
  );

  const messagesContent = (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto pt-6 pb-4 min-w-0 overscroll-contain",
        embedded ? "px-5" : "px-7",
      )}
    >
      {!hasWebsite ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.06]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/15"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <p className="text-sm text-white/25">
              Add a website to this contact
            </p>
            <p className="text-xs text-white/12 mt-1.5">
              Edit the contact and add their company URL to generate intel
            </p>
          </div>
        </div>
      ) : messages.length === 0 && !loading ? (
        <div className="flex h-full items-center justify-center">
          <span className="text-sm text-white/20">Loading brief...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6 min-w-0">
          {renderedMessages}

          {/* Streaming text with formatted markdown */}
          {renderedStreaming && (
            <div className="min-w-0 break-words">{renderedStreaming}</div>
          )}

          {/* Thinking indicator */}
          {loading && !streamingText && (
            <div className="flex items-center gap-3 py-1">
              <div className="thinking-spinner" />
              <span className="text-xs text-white/25 transition-opacity duration-500">
                {THINKING_PHASES[thinkingPhase]}
                <span className="thinking-ellipsis" />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const inputContent = hasWebsite ? (
    <div className={cn("pb-6 pt-2", embedded ? "px-5" : "px-7")}>
      <div className="h-px bg-white/[0.05] mb-5" />
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up..."
          disabled={loading}
          className="h-9 w-full bg-transparent text-sm text-white/55 placeholder:text-white/15 focus:outline-none disabled:opacity-30"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-lg p-2 text-white/20 transition-colors hover:bg-white/[0.04] hover:text-white/40 disabled:opacity-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
          </svg>
        </button>
      </form>
    </div>
  ) : null;

  /* ---- Embedded mode: bare content for mobile panel ---- */
  if (embedded) {
    return (
      <div className="flex flex-1 flex-col min-h-0">
        {headerContent}
        {messagesContent}
        {inputContent}
      </div>
    );
  }

  /* ---- Desktop mode: fixed side panel ---- */
  return (
    <div
      className="fixed inset-y-0 left-0 z-50 hidden sm:flex flex-col p-3 pr-0"
      style={{
        width: "calc(100vw - 420px)",
        maxWidth: "720px",
        animation: "panelSlideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_6%/0.95)] backdrop-blur-2xl">
        {headerContent}
        {messagesContent}
        {inputContent}
      </div>
    </div>
  );
}
