"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Star, 
  Trash2, 
  Plus, 
  Eye, 
  MessageSquareQuote, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface Testimonial {
  id: string;
  name: string;
  author: string;
  quote: string;
  avatar_url?: string;
  rating?: number;
  is_approved: boolean;
  is_featured?: boolean;
  created_at?: string;
}

export function TestimonialsManager({
  initialDbTestimonials,
  curatedTestimonials,
}: {
  initialDbTestimonials: Testimonial[];
  curatedTestimonials: any[];
}) {
  const [items, setItems] = useState<Testimonial[]>(initialDbTestimonials);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Stats
  const approvedCount = items.filter((t) => t.is_approved).length;
  const pendingCount = items.filter((t) => !t.is_approved).length;

  const handleToggleApproved = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          is_approved: !currentStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setItems((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_approved: !currentStatus } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update testimonial status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete testimonial");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredItems = items.filter((t) => {
    if (filter === "approved") return t.is_approved;
    if (filter === "pending") return !t.is_approved;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0d0d16] border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#6366f1]" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
            Total Submissions
          </p>
          <p className="text-3xl font-bold text-white tabular-nums">{items.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">From user feedback form</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d0d16] border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#10b981]" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
            Live on Landing Page
          </p>
          <p className="text-3xl font-bold text-emerald-400 tabular-nums">{approvedCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Approved for public ticker</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d0d16] border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
            Pending Review
          </p>
          <p className="text-3xl font-bold text-amber-400 tabular-nums">{pendingCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Awaiting admin decision</p>
        </div>
      </div>

      {/* ── Actions & Filters Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "all"
                ? "bg-white/10 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filter === "approved"
                ? "bg-[#10b981]/20 text-emerald-400 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live ({approvedCount})</span>
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filter === "pending"
                ? "bg-amber-400/20 text-amber-300 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Pending ({pendingCount})</span>
          </button>
        </div>

        <Link
          href="/#testimonials"
          target="_blank"
          className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition"
        >
          <Eye className="w-3.5 h-3.5 text-[#10b981]" />
          <span>View Live Landing Page Ticker</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* ── Submissions Table ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d16] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-gray-500 uppercase tracking-wider font-mono text-[10px]">
                <th className="px-5 py-3.5">Author / User</th>
                <th className="px-5 py-3.5">Quote / Feedback</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Submitted</th>
                <th className="px-5 py-3.5 text-center">Live on Landing</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.015] transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          item.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            item.name
                          )}&background=10b981&color=fff&size=88`
                        }
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover border border-white/[0.08] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{item.name}</p>
                        <p className="text-[11px] font-mono text-[#10b981] truncate">
                          {item.author}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-sm">
                    <p className="text-gray-300 leading-relaxed italic line-clamp-2">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 font-mono text-[11px]">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "Recent"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggleApproved(item.id, item.is_approved)}
                      disabled={loadingId === item.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition ${
                        item.is_approved
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                          : "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      {item.is_approved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loadingId === item.id}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    <MessageSquareQuote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold text-gray-400">No testimonials found</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {filter !== "all"
                        ? `There are currently no ${filter} submissions.`
                        : "User feedback submitted via the landing page will appear here for your review."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Curated Fallbacks Reference Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Default Curated Shoutouts Active</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          The landing page ticker automatically shows {curatedTestimonials.length} verified executive and founder reviews by default. When you approve new community submissions above, they are automatically placed into the live ticker alongside the curated list!
        </p>
      </div>
    </div>
  );
}

export default TestimonialsManager;
