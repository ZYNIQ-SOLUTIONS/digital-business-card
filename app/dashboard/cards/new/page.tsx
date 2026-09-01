/* eslint-disable */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

/** Generates a URL-safe slug from a name */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Appends a 4-char random suffix to ensure uniqueness */
function withSuffix(base: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${suffix}` : `card-${suffix}`;
}

export default function NewCardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Ensure profile exists (satisfies FK constraint)
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email || "",
          full_name: fullName || user.user_metadata?.full_name || "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      const names = fullName.trim().split(" ");
      const avatarInitials =
        names.length > 1
          ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
          : names[0]
          ? names[0].slice(0, 2).toUpperCase()
          : "IK";

      // Generate a unique slug: name-based + 4-char random suffix
      const slug = withSuffix(nameToSlug(fullName));

      const newCard = {
        user_id: user.id,
        slug,
        is_published: true,
        // Default theme & layout — user can change later in the editor
        theme: "apple-light",
        template_layout: "classic-segmented",
        full_name: fullName,
        avatar_initials: avatarInitials,
        title,
        company,
        tagline: "",
        phone_primary: "",
        email_work: user.email || "",
        website_primary: "https://",
        socials: [
          { id: "linkedin", name: "LinkedIn", url: "", active: true },
          { id: "whatsapp", name: "WhatsApp", url: "", active: true },
          { id: "telegram", name: "Telegram", url: "", active: true },
          { id: "x", name: "X (Twitter)", url: "", active: true },
          { id: "github", name: "GitHub", url: "", active: true },
          { id: "instagram", name: "Instagram", url: "", active: true },
          { id: "tiktok", name: "TikTok", url: "", active: true },
          { id: "threads", name: "Threads", url: "", active: true },
          { id: "facebook", name: "Facebook", url: "", active: false },
          { id: "spotify", name: "Spotify", url: "", active: false },
          { id: "youtube", name: "YouTube", url: "", active: true },
          { id: "discord", name: "Discord", url: "", active: true },
          { id: "calendly", name: "Calendly", url: "", active: true },
          { id: "medium", name: "Medium", url: "", active: true },
          { id: "behance", name: "Behance", url: "", active: false },
          { id: "dribbble", name: "Dribbble", url: "", active: false },
          { id: "substack", name: "Substack", url: "", active: false },
          { id: "signal", name: "Signal", url: "", active: false },
          { id: "pinterest", name: "Pinterest", url: "", active: false },
          { id: "reddit", name: "Reddit", url: "", active: false },
        ],
        skills: ["Leadership", "Strategy"],
      };

      let { data, error } = await supabase
        .from("cards")
        .insert(newCard)
        .select()
        .single();

      // Fallback: retry without template_layout if column missing from schema cache
      if (
        error &&
        (error.message?.includes("template_layout") || error.code === "PGRST204")
      ) {
        const { template_layout: _tpl, ...cardWithoutTemplate } = newCard;
        const retryResult = await supabase
          .from("cards")
          .insert(cardWithoutTemplate)
          .select()
          .single();
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        if (error.code === "23505") {
          // Extremely unlikely with a suffix, but handle gracefully
          throw new Error(
            "A card with a similar name already exists. Please try again."
          );
        }
        throw new Error(error.message);
      }

      router.push(`/dashboard/cards/${data.id}/edit`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create card.";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] font-medium mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#0071E3]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
              Create Your Card
            </h1>
          </div>
          <p className="text-xs text-[#86868B] pl-10">
            Fill in the basics — you can customize everything else in the editor.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreateCard} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ibrahim El Khalil"
              className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05] focus:outline-none focus:bg-white text-sm transition"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Founder & AI Architect"
              className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05] focus:outline-none focus:bg-white text-sm transition"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
              Company *
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. ZYNIQ"
              className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05] focus:outline-none focus:bg-white text-sm transition"
            />
          </div>

          {/* Hint about slug */}
          <p className="text-[10px] text-[#86868B] bg-[#F5F5F7] rounded-xl px-3 py-2 border border-black/[0.04]">
            🔗 A unique public URL will be auto-generated from your name. You can change it anytime in the editor.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Card...</span>
              </>
            ) : (
              <>
                <span>Create & Open Editor</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
