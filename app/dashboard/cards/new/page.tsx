/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Sparkles, ArrowRight, Loader2, Check } from "lucide-react";
import { themeList } from "@/lib/theme";
import { templateList } from "@/lib/templates";

export default function NewCardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    company: "",
    slug: "",
    theme: "apple-light",
    template_layout: "classic-segmented",
    phonePrimary: "",
    emailWork: "",
    websitePrimary: "https://",
    tagline: "",
  });

  const handleNameChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      fullName: name,
      slug: prev.slug === "" || prev.slug.startsWith(generatedSlug.slice(0, 3)) ? generatedSlug : prev.slug,
    }));
  };

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

      // Proactively ensure profile exists to satisfy foreign key constraint
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email || "",
          full_name: formData.fullName || user.user_metadata?.full_name || "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      const names = formData.fullName.trim().split(" ");
      const avatarInitials = names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : (names[0] ? names[0].slice(0, 2).toUpperCase() : "IK");

      const newCard = {
        user_id: user.id,
        slug: formData.slug || `card-${Date.now().toString(36)}`,
        is_published: true,
        theme: formData.theme || "apple-light",
        template_layout: formData.template_layout || "classic-segmented",
        full_name: formData.fullName,
        avatar_initials: avatarInitials,
        title: formData.title,
        company: formData.company,
        tagline: formData.tagline || "",
        phone_primary: formData.phonePrimary || "",
        email_work: formData.emailWork || user.email || "",
        website_primary: formData.websitePrimary || "https://",
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

      const { data, error } = await supabase
        .from("cards")
        .insert(newCard)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("This custom URL slug is already taken. Please choose another slug.");
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
    <div className="max-w-xl mx-auto py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] font-medium mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
            Create a New Smart Business Card
          </h1>
          <p className="text-xs text-[#86868B] pt-0.5">
            Choose your profile details, layout architecture, and color palette.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreateCard} className="space-y-5 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Ibrahim El Khalil"
              className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Founder & AI Architect"
                className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05] focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                Company *
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. ZYNIQ"
                className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05] focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Template Layout Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1.5">
              Select UI Layout Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templateList.map((tpl) => {
                const isSelected = formData.template_layout === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, template_layout: tpl.id })}
                    className={`p-3 rounded-2xl text-left border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "border-[#0071E3] ring-2 ring-[#0071E3]/20 bg-blue-50/30"
                        : "border-black/[0.06] hover:border-black/[0.15] bg-[#F8F9FA]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700">
                        {tpl.badge}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0071E3]" />}
                    </div>
                    <div className="mt-1.5">
                      <span className="block text-xs font-bold text-[#1D1D1F]">{tpl.name}</span>
                      <span className="block text-[10px] text-[#86868B] line-clamp-1">{tpl.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Theme Palette Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1.5">
              Choose Color Theme ({themeList.length} Palettes)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {themeList.map((th) => {
                const isSelected = formData.theme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: th.id })}
                    className={`p-2.5 rounded-xl text-left border transition-all relative flex flex-col justify-between min-h-[64px] ${
                      isSelected
                        ? "border-[#0071E3] ring-2 ring-[#0071E3]/20 bg-blue-50/30"
                        : "border-black/[0.05] hover:border-black/[0.12] bg-[#F5F5F7]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs shrink-0"
                          style={{ backgroundColor: th.previewBg }}
                        />
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-2xs shrink-0"
                          style={{ backgroundColor: th.previewAccent }}
                        />
                        {th.previewSecondary && (
                          <div
                            className="w-2 h-2 rounded-full shadow-2xs shrink-0"
                            style={{ backgroundColor: th.previewSecondary }}
                          />
                        )}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0071E3]" />}
                    </div>
                    <span className="block text-[11px] font-semibold text-[#1D1D1F] truncate mt-1">
                      {th.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

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
                <span>Create &amp; Open Editor</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
