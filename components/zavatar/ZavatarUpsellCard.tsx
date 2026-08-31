"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowUpRight, User, Wand2 } from "lucide-react";

export interface ZavatarUpsellCardProps {
  avatarId?: string | null;
  className?: string;
}

export function ZavatarUpsellCard({
  avatarId,
  className = "",
}: ZavatarUpsellCardProps) {
  // Requirement R7: Rendered only when avatar_id is absent/falsy on profile
  if (avatarId) {
    return null;
  }

  return (
    <aside
      data-testid="zavatar-upsell-card"
      aria-label="Create Your Zavatar"
      className={`relative overflow-hidden rounded-[28px] p-5 border border-indigo-500/20 dark:border-indigo-400/20 bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white/90 dark:from-[#13111C]/90 dark:via-[#1A162B]/80 dark:to-[#0F0D17]/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(99,102,241,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(99,102,241,0.15)] group ${className}`}
    >
      {/* Subtle decorative background glow */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700"
      />

      <div className="flex items-center gap-4 relative z-10">
        {/* Avatar Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 group-hover:rotate-6 transition-transform duration-300">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
              Create Your Zavatar
            </h2>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50 uppercase tracking-wide">
              New
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug mt-0.5">
            Turn your headshot into a living 3D avatar
          </p>
        </div>

        {/* CTA Link Button */}
        <Link
          href="/zavatar/studio"
          className="shrink-0 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all duration-200 flex items-center gap-1 active:scale-95 group-hover:shadow-indigo-500/25"
        >
          <span>Studio</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </Link>
      </div>
    </aside>
  );
}

export default ZavatarUpsellCard;
