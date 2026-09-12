"use client";

import React, { useState } from "react";
import { X, Star, Send, CheckCircle2, MessageSquareQuote } from "lucide-react";

interface LeaveFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function LeaveFeedbackModal({ isOpen, onClose, onSubmitted }: LeaveFeedbackModalProps) {
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) {
      setErrorMsg("Please fill in your name and feedback.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          author: author.trim(),
          quote: quote.trim(),
          rating,
        }),
      });

      const data = await res.json();
      if (!res.ok && data.error) {
        throw new Error(data.error);
      }

      setIsSuccess(true);
      if (onSubmitted) onSubmitted();
      setTimeout(() => {
        setIsSuccess(false);
        setName("");
        setAuthor("");
        setQuote("");
        setRating(5);
        onClose();
      }, 2200);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#0c0c12] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Your shoutout has been submitted for review. It will appear on our live wall once reviewed by our team!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] font-mono text-[11px] font-semibold uppercase tracking-wider">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Community Shoutout</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Share Your IZN Experience
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tell us how your digital smart card or NFC hardware has enhanced your networking.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          (hoverRating || rating) >= star
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-gray-500 font-mono ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Name & Handle Grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
                    Your Name <span className="text-[#10b981]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#10b981] text-xs text-white placeholder-gray-600 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
                    Handle or Role
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. @elena_rostova or VP, Growth"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#10b981] text-xs text-white placeholder-gray-600 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Feedback Quote */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
                    Your Feedback <span className="text-[#10b981]">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-gray-600">
                    {quote.length}/300
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  maxLength={300}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="How does IZN change how you connect? (e.g. Tapped my card at a tech summit and closed 3 clients on the spot...)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#10b981] text-xs text-white placeholder-gray-600 focus:outline-none transition resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !quote.trim()}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#0ea5e9] hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit Shoutout</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveFeedbackModal;
