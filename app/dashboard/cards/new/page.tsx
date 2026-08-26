/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Sparkles, ArrowRight, Loader2 } from "lucide-react";

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

      const names = formData.fullName.trim().split(" ");
      const avatarInitials = names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : (names[0] ? names[0].slice(0, 2).toUpperCase() : "IK");

      const newCard = {
        user_id: user.id,
        slug: formData.slug || `card-${Date.now().toString(36)}`,
        is_published: true,
        theme: "apple-light",
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
          { id: "x", name: "X", url: "", active: true },
          { id: "github", name: "GitHub", url: "", active: true },
          { id: "instagram", name: "Instagram", url: "", active: true },
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
    <div className="max-w-lg mx-auto py-6">
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
            Create a New Business Card
          </h1>
          <p className="text-xs text-[#86868B] pt-0.5">
            Add another personal, professional, or side-project card to your account.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreateCard} className="space-y-4 text-xs">
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

          <div>
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
              Custom Card URL Slug *
            </label>
            <div className="flex items-center rounded-xl bg-[#F5F5F7] border border-black/[0.05] px-3 py-1">
              <span className="text-[#86868B] font-mono select-none">/</span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                placeholder="card-slug"
                className="w-full py-2 bg-transparent font-mono focus:outline-none"
              />
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
