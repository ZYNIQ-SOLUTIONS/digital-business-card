"use client";

import React, { useState } from "react";
import { Sparkles, X, Check, Loader2, RefreshCw, ArrowRight } from "lucide-react";

interface BioVariation {
  tone: string;
  text: string;
}

interface AiBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (enhancedText: string) => void;
  context: {
    fullName?: string;
    title?: string;
    company?: string;
    bio?: string;
    skills?: string[];
    tagline?: string;
  };
}

export function AiBioModal({ isOpen, onClose, onApply, context }: AiBioModalProps) {
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<BioVariation[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch AI enhancements
  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/ai/enhance-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });

      const data = await res.json();
      if (data.variations && data.variations.length > 0) {
        setVariations(data.variations);
      } else {
        throw new Error(data.error || "No variations returned.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate AI bio.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger generation on open if list is empty
  React.useEffect(() => {
    if (isOpen && variations.length === 0) {
      handleGenerate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xl transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#14141A] border border-black/[0.08] dark:border-white/15 rounded-[28px] shadow-2xl overflow-hidden z-10 text-neutral-900 dark:text-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-transparent dark:from-violet-500/10 dark:via-transparent dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display tracking-tight">
                AI Executive Bio Enhancer
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Powered by Gemini • Tailored for executive networking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                Synthesizing executive bio variations...
              </p>
              <p className="text-xs text-neutral-400">
                Analyzing role, skills, and industry impact
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
              {errorMsg}
              <button
                onClick={handleGenerate}
                className="mt-3 block mx-auto px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-500/20 text-xs font-semibold hover:bg-red-200 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {variations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1C1C24] border border-black/[0.06] dark:border-white/10 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100/80 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/30">
                      {v.tone}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      ~{v.text.split(" ").length} words
                    </span>
                  </div>

                  <p className="text-[14px] leading-relaxed text-neutral-800 dark:text-neutral-200 font-normal">
                    {v.text}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(v.text);
                        setCopiedIdx(idx);
                        setTimeout(() => setCopiedIdx(null), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-white/10 transition"
                    >
                      {copiedIdx === idx ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3.5 h-3.5" /> Copied
                        </span>
                      ) : (
                        "Copy"
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onApply(v.text);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>Apply to Bio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/10 bg-neutral-50/50 dark:bg-white/5 flex items-center justify-between text-xs text-neutral-500">
          <span>Click &quot;Apply to Bio&quot; to update your card</span>
          <button
            disabled={loading}
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Generate New Variations</span>
          </button>
        </div>

      </div>
    </div>
  );
}
