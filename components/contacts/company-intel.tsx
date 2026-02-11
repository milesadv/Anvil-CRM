"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { Contact } from "@/lib/crm-data";
import { createBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type IntelSectionKey = "objections" | "key_questions";

interface IntelSectionDef {
  key: IntelSectionKey;
  label: string;
  description: string;
  prompt: string;
}

interface CompanyIntelProps {
  contact: Contact;
  /** When true, renders without the fixed-position wrapper (for embedding in mobile panel) */
  embedded?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const THINKING_PHASES = [
  "Looking up company",
  "Reviewing website",
  "Analysing business model",
  "Identifying alignment",
  "Preparing brief",
];

const INTEL_SECTIONS: IntelSectionDef[] = [
  {
    key: "objections",
    label: "Objections & Responses",
    description: "Anticipated pushback and how to handle it",
    prompt:
      "Based on the company brief above, list the most likely objections this prospect might raise about working with Anvil, and provide a concise recommended response for each.",
  },
  {
    key: "key_questions",
    label: "Key Questions to Ask",
    description: "Discovery questions tailored to this prospect",
    prompt:
      "Based on the company brief above, suggest 5-7 tailored discovery questions an Anvil consultant should ask this prospect to uncover their operational pain points and priorities.",
  },
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
    // Single-pass scan to find all inline tokens without catastrophic backtracking
    const tokens: {
      type: string;
      index: number;
      length: number;
      groups: string[];
    }[] = [];

    // Bold: **text**
    const boldRe = /\*\*(.+?)\*\*/g;
    let m: RegExpExecArray | null;
    while ((m = boldRe.exec(text)) !== null) {
      tokens.push({
        type: "bold",
        index: m.index,
        length: m[0].length,
        groups: [m[1]],
      });
    }

    // Code: `text`
    const codeRe = /`(.+?)`/g;
    while ((m = codeRe.exec(text)) !== null) {
      tokens.push({
        type: "code",
        index: m.index,
        length: m[0].length,
        groups: [m[1]],
      });
    }

    // Link: [text](url)
    const linkRe = /\[(.+?)\]\((.+?)\)/g;
    while ((m = linkRe.exec(text)) !== null) {
      tokens.push({
        type: "link",
        index: m.index,
        length: m[0].length,
        groups: [m[1], m[2]],
      });
    }

    // Italic: *text* (single asterisk, not inside bold)
    // Use a simple regex without lookbehinds to avoid backtracking
    const italicRe = /\*([^*]+)\*/g;
    while ((m = italicRe.exec(text)) !== null) {
      tokens.push({
        type: "italic",
        index: m.index,
        length: m[0].length,
        groups: [m[1]],
      });
    }

    // Sort by position and remove overlapping tokens (keep earliest/longest)
    tokens.sort((a, b) => a.index - b.index || b.length - a.length);
    const filtered: typeof tokens = [];
    let lastEnd = 0;
    for (const token of tokens) {
      if (token.index >= lastEnd) {
        filtered.push(token);
        lastEnd = token.index + token.length;
      }
    }

    if (filtered.length === 0) return text;

    const parts: ReactNode[] = [];
    let partKey = 0;
    let cursor = 0;

    for (const token of filtered) {
      if (token.index > cursor) {
        parts.push(text.slice(cursor, token.index));
      }

      if (token.type === "bold") {
        parts.push(
          <strong key={partKey++} className="font-semibold text-white/60">
            {token.groups[0]}
          </strong>,
        );
      } else if (token.type === "italic") {
        parts.push(
          <em key={partKey++} className="italic text-white/45">
            {token.groups[0]}
          </em>,
        );
      } else if (token.type === "code") {
        parts.push(
          <code
            key={partKey++}
            className="text-[13px] text-white/50 bg-white/[0.05] px-1.5 py-0.5 rounded"
          >
            {token.groups[0]}
          </code>,
        );
      } else if (token.type === "link") {
        parts.push(
          <a
            key={partKey++}
            href={token.groups[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 underline underline-offset-2 decoration-white/15 hover:text-white/70 transition-colors"
          >
            {token.groups[0]}
          </a>,
        );
      }
      cursor = token.index + token.length;
    }

    if (cursor < text.length) {
      parts.push(text.slice(cursor));
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
/*  Skeleton loaders                                                   */
/* ------------------------------------------------------------------ */

function BriefSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-5/6 rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
      <div className="pt-2">
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-4/5 rounded" />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3 py-2">
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-5/6 rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CompanyIntel({ contact, embedded = false }: CompanyIntelProps) {
  const [brief, setBrief] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [sectionLoading, setSectionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const lastRefreshRef = useRef(0);

  /* Auto-scroll */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [brief, sections, briefLoading, sectionLoading]);

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

  /* ---- Supabase helpers ---- */

  async function loadIntel(): Promise<{
    brief: string;
    sections: Record<string, string>;
    isStale: boolean;
  } | null> {
    const supabase = createBrowserClient();
    const { data, error: err } = await supabase
      .from("company_intel")
      .select("brief, sections, website_used")
      .eq("contact_id", contact.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (err || !data?.brief) return null;
    const rawSections = (data.sections || {}) as Record<
      string,
      { content: string; generated_at: string }
    >;
    const parsed: Record<string, string> = {};
    for (const [key, val] of Object.entries(rawSections)) {
      if (val?.content) parsed[key] = val.content;
    }
    const isStale =
      !!data.website_used && data.website_used !== contact.website;
    return { brief: data.brief, sections: parsed, isStale };
  }

  async function saveIntel(
    briefText: string,
    sectionsData: Record<string, string>,
  ) {
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const sectionsJson: Record<
      string,
      { content: string; generated_at: string }
    > = {};
    for (const [key, content] of Object.entries(sectionsData)) {
      sectionsJson[key] = {
        content,
        generated_at: new Date().toISOString(),
      };
    }

    await supabase.from("company_intel").delete().eq("contact_id", contact.id);

    await supabase.from("company_intel").insert({
      user_id: user.id,
      contact_id: contact.id,
      brief: briefText,
      website_used: contact.website,
      sections: sectionsJson,
    });
  }

  async function updateSections(sectionsData: Record<string, string>) {
    const supabase = createBrowserClient();
    const sectionsJson: Record<
      string,
      { content: string; generated_at: string }
    > = {};
    for (const [key, content] of Object.entries(sectionsData)) {
      sectionsJson[key] = {
        content,
        generated_at: new Date().toISOString(),
      };
    }
    await supabase
      .from("company_intel")
      .update({
        sections: sectionsJson,
        updated_at: new Date().toISOString(),
      })
      .eq("contact_id", contact.id);
  }

  /* ---- Edge function (non-streaming) ---- */

  async function callEdgeFunction(
    messages: { role: string; content: string }[],
  ): Promise<string> {
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Cancel any in-flight request before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await fetch(`${supabaseUrl}/functions/v1/Sales-Chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || supabaseAnonKey}`,
        apikey: supabaseAnonKey || "",
      },
      body: JSON.stringify({
        website: contact.website,
        companyName: contact.company,
        contactName: contact.name,
        contactRole: contact.role,
        messages,
        stream: false,
      }),
      signal: controller.signal,
    });

    const data = await res.json();
    if (data?.error) throw new Error(data.error);
    return data?.response || "No response generated.";
  }

  /* ---- Generate brief ---- */

  async function generateBrief() {
    setBriefLoading(true);
    setError(null);
    startThinking();

    try {
      const prompt = `Analyse ${contact.company}'s website (${contact.website}) and provide a brief on who they are, what they do, and how Anvil's services could align with their needs.`;
      const responseText = await callEdgeFunction([
        { role: "user", content: prompt },
      ]);

      if (!cancelledRef.current) {
        setBrief(responseText);
        await saveIntel(responseText, {});
      }
    } catch (err) {
      if (!cancelledRef.current) {
        const isAbort =
          err instanceof DOMException && err.name === "AbortError";
        if (!isAbort) {
          setError(
            err instanceof Error ? err.message : "Failed to generate brief",
          );
        }
      }
    } finally {
      stopThinking();
      if (!cancelledRef.current) setBriefLoading(false);
    }
  }

  /* ---- Generate on-demand section ---- */

  async function generateSection(sectionDef: IntelSectionDef) {
    if (sectionLoading || !brief) return;
    setSectionLoading(sectionDef.key);

    try {
      const messages = [
        {
          role: "user",
          content: `Analyse ${contact.company}'s website (${contact.website}) and provide a brief.`,
        },
        { role: "assistant", content: brief },
        { role: "user", content: sectionDef.prompt },
      ];

      const content = await callEdgeFunction(messages);

      if (!cancelledRef.current) {
        const updated = { ...sections, [sectionDef.key]: content };
        setSections(updated);
        await updateSections(updated);
      }
    } catch (err) {
      console.error("Failed to generate section:", err);
    } finally {
      if (!cancelledRef.current) setSectionLoading(null);
    }
  }

  /* ---- On contact change: load from DB or generate ---- */

  useEffect(() => {
    cancelledRef.current = false;
    setBrief(null);
    setBriefLoading(false);
    setSections({});
    setSectionLoading(null);
    setError(null);
    setIsStale(false);
    stopThinking();

    if (!contact.website) return;

    let cancelled = false;

    async function init() {
      const intel = await loadIntel();
      if (cancelled) return;

      if (intel) {
        setBrief(intel.brief);
        setSections(intel.sections);
        setIsStale(intel.isStale);
      }
      // No cache — don't auto-generate. User can click "Generate".
    }

    init();

    return () => {
      cancelled = true;
      cancelledRef.current = true;
      abortRef.current?.abort();
      stopThinking();
    };
  }, [contact.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Refresh brief ---- */

  async function handleRefresh() {
    if (briefLoading || sectionLoading || !contact.website) return;
    const now = Date.now();
    if (now - lastRefreshRef.current < 500) return;
    lastRefreshRef.current = now;
    setBrief(null);
    setSections({});
    setError(null);
    setIsStale(false);
    await generateBrief();
  }

  const hasWebsite = !!contact.website;

  /* ---- JSX ---- */

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
          {hasWebsite && brief && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={briefLoading || !!sectionLoading}
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

  const mainContent = (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto pt-6 pb-6 min-w-0 overscroll-contain",
        embedded ? "px-5" : "px-7",
      )}
    >
      {!hasWebsite ? (
        /* No website empty state */
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
      ) : (
        <div className="flex flex-col gap-6 min-w-0">
          {/* Brief section */}
          {briefLoading ? (
            <div>
              <BriefSkeleton />
              <div className="flex items-center gap-3 pt-5">
                <div className="thinking-spinner" />
                <span className="text-xs text-white/25 transition-opacity duration-500">
                  {THINKING_PHASES[thinkingPhase]}
                  <span className="thinking-ellipsis" />
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-white/30 mb-3">{error}</p>
              <button
                type="button"
                onClick={handleRefresh}
                className="text-xs text-white/30 hover:text-white/50 transition-colors underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          ) : brief ? (
            <div className="min-w-0 break-words">
              {isStale && (
                <div className="mb-4 rounded-lg border border-amber-500/10 bg-amber-500/[0.04] px-4 py-3">
                  <p className="text-xs text-amber-400/50">
                    Website has changed since this was generated.{" "}
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={briefLoading || !!sectionLoading}
                      className="underline underline-offset-2 hover:text-amber-400/70 transition-colors disabled:opacity-40"
                    >
                      Regenerate
                    </button>
                  </p>
                </div>
              )}
              {renderMarkdown(brief)}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-white/25 mb-1">
                  Generate Company Intel
                </p>
                <p className="text-xs text-white/12 mb-4">
                  Analyse {contact.company || "this company"}&apos;s website
                  with AI
                </p>
                <button
                  type="button"
                  onClick={() => generateBrief()}
                  className="text-xs font-medium text-white/40 hover:text-white/60 transition-colors border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-4 py-2"
                >
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* On-demand sections — only show when brief is loaded */}
          {brief && (
            <>
              <div className="h-px bg-white/[0.05]" />
              <div className="flex flex-col gap-4">
                {INTEL_SECTIONS.map((sectionDef) => {
                  const content = sections[sectionDef.key];
                  const isLoading = sectionLoading === sectionDef.key;

                  if (isLoading) {
                    return (
                      <div
                        key={sectionDef.key}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
                      >
                        <p className="text-xs uppercase tracking-[0.12em] text-white/20 mb-3">
                          {sectionDef.label}
                        </p>
                        <SectionSkeleton />
                        <div className="flex items-center gap-3 pt-2">
                          <div className="thinking-spinner" />
                          <span className="text-xs text-white/25">
                            Generating
                            <span className="thinking-ellipsis" />
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (content) {
                    return (
                      <div
                        key={sectionDef.key}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
                      >
                        <p className="text-xs uppercase tracking-[0.12em] text-white/20 mb-3">
                          {sectionDef.label}
                        </p>
                        <div className="min-w-0 break-words">
                          {renderMarkdown(content)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={sectionDef.key}
                      type="button"
                      onClick={() => generateSection(sectionDef)}
                      disabled={!!sectionLoading}
                      className="w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-all duration-200 hover:border-white/[0.10] hover:bg-white/[0.04] disabled:opacity-40"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white/50">
                            {sectionDef.label}
                          </p>
                          <p className="text-xs text-white/20 mt-1">
                            {sectionDef.description}
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white/15 shrink-0 ml-4"
                        >
                          <path d="M12 3v14" />
                          <path d="m5 10 7 7 7-7" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  /* Embedded mode: bare content for mobile panel */
  if (embedded) {
    return (
      <div className="flex flex-1 flex-col min-h-0">
        {headerContent}
        {mainContent}
      </div>
    );
  }

  /* Desktop mode: fixed side panel */
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
        {mainContent}
      </div>
    </div>
  );
}
