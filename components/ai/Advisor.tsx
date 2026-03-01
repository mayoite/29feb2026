"use client";

import { useState, useRef, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Bot, X, Send, Loader2, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

interface Recommendation {
  productId: string;
  productName: string;
  category: string;
  why: string;
  budgetEstimate: string;
}

interface AdvisorResult {
  recommendations: Recommendation[];
  totalBudget: string;
  summary: string;
}

const SAMPLE_QUERIES = [
  "Ergonomic seating for Bihar government project, 50 people",
  "Modular workstations for a 20-person tech startup in Patna",
  "Conference room furniture for corporate head office",
  "Complete office setup for 100-seat BPO centre",
];

export function AIAdvisor() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    if (open) {
      focusTimeoutRef.current = setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, [open]);

  async function handleSubmit(e?: React.FormEvent, prefill?: string) {
    e?.preventDefault();
    const q = prefill ?? query;
    if (!q.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai-advisor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      setResult(data);
      if (prefill) setQuery(prefill);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to get recommendations";
      toast.error(msg, {
        duration: 4000,
        style: {
          background: "#1a1a1a",
          color: "#fff",
          borderLeft: "4px solid #ef4444",
          borderRadius: "4px",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  const categorySlug: Record<string, string> = {
    "oando-workstations": "oando-workstations",
    "oando-seating": "oando-seating",
    "oando-tables": "oando-tables",
    "oando-storage": "oando-storage",
    "oando-soft-seating": "oando-soft-seating",
    "oando-educational": "oando-educational",
    "oando-collaborative": "oando-collaborative",
  };

  return (
    <>
      <Toaster position="bottom-right" />

      {/* Floating trigger button */}
      <button
        id="ai-advisor-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open AI Workspace Advisor"
        className={`fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-neutral-900 text-white px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-full shadow-2xl shadow-black/30 hover:bg-primary transition-all duration-300 group ${
          open
            ? "opacity-0 pointer-events-none scale-90"
            : "opacity-100 scale-100"
        }`}
      >
        <Sparkles className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
        <span className="hidden sm:inline text-sm font-bold tracking-wide">
          AI Advisor
        </span>
        <span className="sm:hidden text-xs font-bold tracking-wide">AI</span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="AI Workspace Advisor"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full sm:w-[480px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-neutral-900 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 text-sm leading-none">
                    AI Workspace Consultant
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Powered by One &amp; Only × GPT-4o
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                aria-label="Close advisor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {!result && !loading && (
                <>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Describe your workspace project — team size, industry,
                    location, and budget — and I&apos;ll engineer a curated
                    system recommendation from our live catalog.
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-bold tracking-widest uppercase text-neutral-400">
                      Try a sample
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_QUERIES.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSubmit(undefined, q)}
                          className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-neutral-500">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm">
                    Analysing catalog and engineering your recommendations…
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">
                      Consultant Summary
                    </p>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {result.summary}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-neutral-400">
                        Estimated project total:
                      </span>
                      <span className="text-sm font-bold text-neutral-900">
                        {result.totalBudget}
                      </span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold tracking-widest uppercase text-neutral-400">
                      Recommended Systems ({result.recommendations?.length ?? 0}
                      )
                    </p>
                    {result.recommendations?.map((rec, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-400 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-neutral-900 text-sm leading-tight">
                            {rec.productName}
                          </h4>
                          <Link
                            href={`/products/${categorySlug[rec.category] ?? rec.category}`}
                            className="shrink-0 w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors"
                            aria-label={`View ${rec.productName}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                          {rec.why}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-neutral-100 rounded-full text-neutral-600 font-medium">
                            {rec.category
                              ?.replace("oando-", "")
                              .replace(/-/g, " ")}
                          </span>
                          <span className="text-xs text-primary font-semibold">
                            {rec.budgetEstimate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setResult(null);
                      setQuery("");
                    }}
                    className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors underline"
                  >
                    Start a new query
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            {!result && (
              <form
                onSubmit={handleSubmit}
                className="px-6 py-4 border-t border-neutral-100 bg-white"
              >
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    id="ai-advisor-input"
                    rows={2}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="e.g. Ergonomic seating for Bihar government project, 50 people…"
                    className="flex-1 resize-none text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 bg-neutral-50"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    id="ai-advisor-submit"
                    className="w-11 h-11 bg-neutral-900 rounded-xl flex items-center justify-center text-white hover:bg-primary transition-colors disabled:opacity-40 shrink-0"
                    aria-label="Send query"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
