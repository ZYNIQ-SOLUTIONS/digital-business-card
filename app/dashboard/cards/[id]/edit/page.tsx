/* eslint-disable */
"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Sparkles, 
  Upload, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Check, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  Share2,
  Calendar
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { 
  AppleIcon,
  SocialIcon
} from "@/components/icons";
import { PhoneInput } from "@/components/phone-input";
import { AiBioModal } from "@/components/ai-bio-modal";
import { themes, themeList } from "@/lib/theme";

const ALL_AVAILABLE_SOCIALS = [
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
];

interface CardEditPageProps {
  params: Promise<{ id: string }>;
}

export default function CardEditPage({ params }: CardEditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBioAiOpen, setIsBioAiOpen] = useState(false);

  // Card Form State
  const [card, setCard] = useState<any>({
    full_name: "",
    slug: "",
    title: "",
    company: "",
    tagline: "",
    bio: "",
    avatar_initials: "",
    theme: "apple-light",
    phone_primary: "",
    phone_secondary: "",
    email_work: "",
    website_primary: "",
    portfolio_url: "",
    booking_url: "",
    skills: [] as string[],
    years_experience: "",
    industry: "",
    work_location: "",
    is_published: true,
    office_address: {
      street: "",
      city: "",
      region: "",
      postalCode: "",
      country: "",
    },
    socials: ALL_AVAILABLE_SOCIALS,
  });

  const [activeTab, setActiveTab] = useState<"card" | "about" | "contact">("card");

  useEffect(() => {
    fetchCard();
  }, [id]);

  const fetchCard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      // Ensure defaults if fields are empty
      setCard({
        ...data,
        office_address: data.office_address || {
          street: "",
          city: "",
          region: "",
          postalCode: "",
          country: "",
        },
        socials: ALL_AVAILABLE_SOCIALS.map((defSocial) => {
          const found = Array.isArray(data.socials)
            ? data.socials.find((s: any) => s.id?.toLowerCase() === defSocial.id?.toLowerCase())
            : null;
          return found ? { ...defSocial, ...found, active: found.active ?? true } : defSocial;
        }),
      });
    } else {
      setErrorMsg("Card not found or access denied.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);

    // Compute initials
    const names = (card.full_name || "").trim().split(" ");
    const initials = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : (names[0] ? names[0].slice(0, 2).toUpperCase() : "IK");

    const payload = {
      ...card,
      avatar_initials: initials,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("cards")
      .update(payload)
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        setErrorMsg("This URL slug is already in use by another card.");
      } else {
        setErrorMsg(error.message);
      }
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  };

  const updateSocialUrl = (socialId: string, url: string) => {
    setCard((prev: any) => ({
      ...prev,
      socials: prev.socials.map((s: any) =>
        s.id === socialId ? { ...s, url, active: !!url } : s
      ),
    }));
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin" />
        <p className="text-xs text-[#86868B]">Loading card editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/${card.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-2xl bg-white border border-black/[0.08] text-xs font-semibold text-[#1D1D1F] hover:bg-neutral-50 flex items-center gap-1 shadow-xs transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Live</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-green-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Split-Screen Layout: Editor (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EDIT FORM ACCORDIONS */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Section 1: Basic Identity */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#1D1D1F] border-b pb-2">
              1. Profile Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={card.full_name}
                  onChange={(e) => setCard({ ...card, full_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">URL Slug</label>
                <input
                  type="text"
                  value={card.slug}
                  onChange={(e) => setCard({ ...card, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs font-mono focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">Job Title</label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => setCard({ ...card, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">Company</label>
                <input
                  type="text"
                  value={card.company}
                  onChange={(e) => setCard({ ...card, company: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">Tagline</label>
              <input
                type="text"
                value={card.tagline}
                onChange={(e) => setCard({ ...card, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase">Executive Bio</label>
                <button
                  type="button"
                  onClick={() => setIsBioAiOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-[11px] font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Enhance with AI</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={card.bio}
                onChange={(e) => setCard({ ...card, bio: e.target.value })}
                placeholder="Brief executive summary highlighting your role, expertise, and leadership focus..."
                className="w-full p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition"
              />
            </div>
          </div>

          {/* Section 2: Card Theme & Aesthetic */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-semibold text-[#1D1D1F]">
                2. Visual Theme &amp; Color Palette
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                {themeList.find(t => t.id === card.theme)?.name || "Apple Light"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {themeList.map((th) => {
                const isSelected = (card.theme || "apple-light") === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setCard({ ...card, theme: th.id })}
                    className={`p-3 rounded-2xl text-left border transition-all relative flex flex-col justify-between min-h-[90px] ${
                      isSelected
                        ? "border-[#0071E3] ring-2 ring-[#0071E3]/20 bg-blue-50/20 shadow-xs"
                        : "border-black/[0.06] hover:border-black/[0.15] bg-[#FBFBFD]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-black/10 shadow-2xs shrink-0"
                          style={{ backgroundColor: th.previewBg }}
                        />
                        <div
                          className="w-3 h-3 rounded-full shadow-2xs shrink-0"
                          style={{ backgroundColor: th.previewAccent }}
                        />
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#0071E3] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <span className="block text-[11px] font-semibold text-[#1D1D1F] leading-tight">
                        {th.name}
                      </span>
                      <span className="block text-[9px] text-[#86868B] truncate mt-0.5">
                        {th.isDark ? "Dark OLED" : "Light Frost"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Contact Information */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#1D1D1F] border-b pb-2">
              3. Contact &amp; Links
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <PhoneInput
                  label="Primary Phone"
                  value={card.phone_primary}
                  onChange={(val) => setCard({ ...card, phone_primary: val })}
                  placeholder="555 019 2834"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Work Email</label>
                <input
                  type="email"
                  value={card.email_work}
                  onChange={(e) => setCard({ ...card, email_work: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Website URL</label>
                <input
                  type="text"
                  value={card.website_primary}
                  onChange={(e) => setCard({ ...card, website_primary: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Booking / Meeting Link</label>
                <input
                  type="text"
                  value={card.booking_url || ""}
                  onChange={(e) => setCard({ ...card, booking_url: e.target.value })}
                  placeholder="https://calendly.com/..."
                  className="w-full p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social Media Links */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-semibold text-[#1D1D1F]">
                4. Connected Social Networks
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                {card.socials.filter((s: any) => s.url).length} connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {card.socials.map((social: any) => (
                <div key={social.id} className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-700">
                    <span className="w-4 h-4 text-neutral-600 flex items-center justify-center">
                      <SocialIcon id={social.id} className="w-3.5 h-3.5" />
                    </span>
                    <span>{social.name}</span>
                  </label>
                  <input
                    type="text"
                    value={social.url || ""}
                    onChange={(e) => updateSocialUrl(social.id, e.target.value)}
                    placeholder={`https://${social.id}.com/...`}
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME APPLE LIVE PREVIEW */}
        {(() => {
          const pt = themes[card.theme || "apple-light"] || themes["apple-light"];
          return (
            <div className="lg:col-span-5 sticky top-20">
              <div className="text-center pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Real-Time Mobile Card Preview ({pt.name})
                </span>
              </div>

              {/* Device Mockup Wrapper */}
              <div className={`w-full max-w-sm mx-auto ${pt.cardBg} border ${pt.border} rounded-[32px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col items-center space-y-5 transition-all duration-300`}>
                
                {/* Avatar Initials */}
                <div className={`w-20 h-20 rounded-full ${pt.avatarBg} border-2 ${pt.avatarBorder} shadow-md flex items-center justify-center relative overflow-hidden`}>
                  <span className={`text-2xl font-semibold tracking-tighter ${pt.textMain}`}>
                    {card.avatar_initials || "IK"}
                  </span>
                  <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${pt.accentBg} text-white flex items-center justify-center shadow-xs border ${pt.avatarBorder}`}>
                    <Sparkles className="w-3 h-3 fill-white" />
                  </div>
                </div>

                {/* Name & Title */}
                <div className="text-center space-y-0.5">
                  <div className="flex items-center justify-center gap-1">
                    <h3 className={`text-xl font-bold tracking-tight ${pt.textMain}`}>
                      {card.full_name || "Your Name"}
                    </h3>
                    <ShieldCheck className={`w-4 h-4 ${pt.accent}`} />
                  </div>
                  <p className={`text-xs font-semibold ${pt.accent}`}>
                    {card.title || "Job Title"}
                  </p>
                  <p className={`text-[11px] ${pt.textSecondary}`}>
                    {card.company || "Company Name"}
                  </p>
                </div>

                {/* Quick Actions 4-Grid */}
                <div className="w-full grid grid-cols-4 gap-1.5">
                  <div className={`flex flex-col items-center p-2 rounded-xl ${pt.pillBg} text-center border ${pt.pillBorder}`}>
                    <div className={`w-7 h-7 rounded-full ${pt.iconCircleBg} flex items-center justify-center mb-1 shadow-2xs`}>
                      <Phone className="w-3.5 h-3.5 text-[#34C759]" />
                    </div>
                    <span className={`text-[10px] font-medium ${pt.textMain}`}>Call</span>
                  </div>
                  <div className={`flex flex-col items-center p-2 rounded-xl ${pt.pillBg} text-center border ${pt.pillBorder}`}>
                    <div className={`w-7 h-7 rounded-full ${pt.iconCircleBg} flex items-center justify-center mb-1 shadow-2xs`}>
                      <Mail className={`w-3.5 h-3.5 ${pt.accent}`} />
                    </div>
                    <span className={`text-[10px] font-medium ${pt.textMain}`}>Email</span>
                  </div>
                  <div className={`flex flex-col items-center p-2 rounded-xl ${pt.pillBg} text-center border ${pt.pillBorder}`}>
                    <div className={`w-7 h-7 rounded-full ${pt.iconCircleBg} flex items-center justify-center mb-1 shadow-2xs`}>
                      <Globe className="w-3.5 h-3.5 text-[#5856D6]" />
                    </div>
                    <span className={`text-[10px] font-medium ${pt.textMain}`}>Web</span>
                  </div>
                  <div className={`flex flex-col items-center p-2 rounded-xl ${pt.pillBg} text-center border ${pt.pillBorder}`}>
                    <div className={`w-7 h-7 rounded-full ${pt.iconCircleBg} flex items-center justify-center mb-1 shadow-2xs`}>
                      <Calendar className="w-3.5 h-3.5 text-[#FF9500]" />
                    </div>
                    <span className={`text-[10px] font-medium ${pt.textMain}`}>Meet</span>
                  </div>
                </div>

                {/* QR Mockup */}
                <div className={`w-full ${pt.qrContainerBg} rounded-2xl p-3 flex flex-col items-center border ${pt.pillBorder}`}>
                  <div className="bg-white p-2 rounded-xl shadow-xs">
                    <QRCodeSVG
                      value={`https://card.app/${card.slug || "demo"}`}
                      size={120}
                      level="Q"
                      className="w-28 h-28"
                    />
                  </div>
                  <span className={`text-[10px] ${pt.textSecondary} pt-2 font-mono`}>
                    /{card.slug || "slug"}
                  </span>
                </div>

                {/* CTA Pill Buttons */}
                <div className="w-full space-y-2">
                  <div className="w-full py-2.5 px-3 rounded-xl bg-black text-white text-[11px] font-medium flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AppleIcon className="w-3.5 h-3.5 fill-white" />
                      <span>Add to Apple Wallet</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                  <div className={`w-full py-2.5 px-3 rounded-xl ${pt.accentBg} text-white text-[11px] font-medium text-center shadow-xs`}>
                    Save Contact Card (.vcf)
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

      </div>

      {/* AI Bio Enhancement Modal */}
      <AiBioModal
        isOpen={isBioAiOpen}
        onClose={() => setIsBioAiOpen(false)}
        onApply={(enhancedBio) => setCard({ ...card, bio: enhancedBio })}
        context={{
          fullName: card.full_name,
          title: card.title,
          company: card.company,
          tagline: card.tagline,
          bio: card.bio,
          skills: card.skills,
        }}
      />
    </div>
  );
}
