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
  ChevronDown,
  ShieldCheck,
  Building2,
  Share2,
  Calendar,
  Camera,
  X,
  Plus,
  Search,
  LayoutGrid,
  Palette,
  Terminal,
  Layers,
  Award,
  Zap,
  CreditCard
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { 
  AppleIcon,
  SocialIcon,
  VerifiedBadgeIcon
} from "@/components/icons";
import { PhoneInput } from "@/components/phone-input";
import { AiBioModal } from "@/components/ai-bio-modal";
import { VerifyModal } from "@/components/verify-modal";
import { themes, themeList, ThemeCategory, ThemeTokens } from "@/lib/theme";
import { cardTemplates, templateList, TemplateLayoutId } from "@/lib/templates";

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
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Theme filtering and search state
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<ThemeCategory>("all");
  const [themeSearchQuery, setThemeSearchQuery] = useState("");

  // Expanded sections state (collapsed by default)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: false,
    2: true, // Expand theme & layout by default so user easily explores new themes
    3: false,
    4: false,
    5: false,
  });

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingAvatar(true);
      setErrorMsg(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        const newAvatarUrl = publicUrlData.publicUrl;
        setCard((prev: any) => ({ ...prev, avatar_url: newAvatarUrl }));
      } catch (err: any) {
        console.error("Avatar upload error:", err);
        setErrorMsg("Avatar upload failed: " + err.message);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  // Card Form State
  const [card, setCard] = useState<any>({
    full_name: "",
    slug: "",
    title: "",
    company: "",
    tagline: "",
    bio: "",
    avatar_url: "",
    avatar_initials: "",
    theme: "apple-light",
    template_layout: "classic-segmented",
    is_verified: false,
    phone_primary: "",
    phone_secondary: "",
    email_work: "",
    website_primary: "",
    portfolio_url: "",
    booking_url: "",
    booking_enabled: true,
    booking_title: "30-Min Strategy Consultation",
    booking_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    booking_start_time: "09:00",
    booking_end_time: "17:00",
    booking_slot_duration: 30,
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
      setCard({
        ...data,
        template_layout: data.template_layout || "classic-segmented",
        theme: data.theme || "apple-light",
        skills: data.skills || [],
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

    const names = (card.full_name || "").trim().split(" ");
    const initials = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : (names[0] ? names[0].slice(0, 2).toUpperCase() : "IK");

    const getPayload = (includeTemplate: boolean) => {
      const {
        id: _id,
        user_id: _uid,
        created_at: _created,
        views_count: _views,
        vcard_downloads_count: _vcards,
        wallet_downloads_count: _wallets,
        template_layout: _tpl,
        ...rest
      } = card;

      const p: any = {
        ...rest,
        avatar_initials: initials,
        theme: card.theme || "apple-light",
        updated_at: new Date().toISOString(),
      };

      if (includeTemplate) {
        p.template_layout = card.template_layout || "classic-segmented";
      }

      return p;
    };

    let payload = getPayload(true);

    let { error } = await supabase
      .from("cards")
      .update(payload)
      .eq("id", id);

    // Fallback: If template_layout column doesn't exist in Supabase schema cache, retry without it
    if (error && (error.message?.includes("template_layout") || error.code === "PGRST204")) {
      console.warn("Retrying card update without template_layout column:", error.message);
      payload = getPayload(false);
      const retryResult = await supabase
        .from("cards")
        .update(payload)
        .eq("id", id);
      error = retryResult.error;
    }

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

  const filteredThemes = themeList.filter((th) => {
    const matchesCategory = 
      selectedThemeCategory === "all" ||
      th.category === selectedThemeCategory ||
      (selectedThemeCategory === "dark" && th.isDark) ||
      (selectedThemeCategory === "light" && !th.isDark);

    const matchesSearch = 
      !themeSearchQuery ||
      th.name.toLowerCase().includes(themeSearchQuery.toLowerCase()) ||
      th.description.toLowerCase().includes(themeSearchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin" />
        <p className="text-xs text-[#86868B]">Loading card editor...</p>
      </div>
    );
  }

  const activeThemeTokens = themes[card.theme || "apple-light"] || themes["apple-light"];
  const activeTemplateDef = cardTemplates[card.template_layout as TemplateLayoutId] || cardTemplates["classic-segmented"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-black/[0.08] hover:bg-black/[0.03] transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#1D1D1F]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
              Edit Smart Card
            </h1>
            <p className="text-xs text-[#86868B]">
              Customize design, layout templates, colors, and live integrations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/${card.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-semibold text-[#1D1D1F] hover:bg-black/[0.03] flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Public Preview</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Form Sections (Left 7 cols) & Live Preview Mockup (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EDIT FORM SECTIONS */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Section 1: Profile Identity */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <div 
              className="flex items-center justify-between border-b pb-2 cursor-pointer select-none"
              onClick={() => toggleSection(1)}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  {expandedSections[1] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
                <h2 className="text-sm font-semibold text-[#1D1D1F]">
                  1. Profile Identity &amp; Bio
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {card.full_name || "Untitled"}
              </span>
            </div>

            {expandedSections[1] && (
              <>
                {/* Profile Photo Upload */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04]">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-black/10 overflow-hidden flex items-center justify-center shadow-xs">
                      {card.avatar_url ? (
                        <img src={card.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-[#1D1D1F]">{card.avatar_initials || "IK"}</span>
                      )}
                    </div>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <span className="block text-xs font-semibold text-[#1D1D1F]">Profile Photo</span>
                    <span className="block text-[11px] text-[#86868B] mb-2">Upload your custom picture for digital &amp; NFC cards.</span>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-white border border-black/[0.1] text-[11px] font-medium text-[#1D1D1F] hover:bg-neutral-50 cursor-pointer shadow-2xs flex items-center gap-1.5 transition">
                        <Upload className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span>{uploadingAvatar ? "Uploading..." : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                      </label>
                      {card.avatar_url && (
                        <button
                          type="button"
                          onClick={() => setCard((prev: any) => ({ ...prev, avatar_url: "" }))}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] text-red-500 hover:bg-red-50 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={card.full_name}
                      onChange={(e) => setCard({ ...card, full_name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                      Custom URL Slug *
                    </label>
                    <div className="flex items-center rounded-xl bg-[#F5F5F7] border border-black/[0.05] px-2.5">
                      <span className="text-xs text-[#86868B] font-mono">card.app/</span>
                      <input
                        type="text"
                        value={card.slug}
                        onChange={(e) => setCard({ ...card, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "") })}
                        className="w-full p-2.5 bg-transparent text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => setCard({ ...card, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={card.company}
                      onChange={(e) => setCard({ ...card, company: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase">
                      Executive Bio
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsBioAiOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0071E3] hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate AI Bio</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={card.bio}
                    onChange={(e) => setCard({ ...card, bio: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Section 2: Card Theme & Modern Layout Templates */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-6">
            <div 
              className="flex items-center justify-between border-b pb-2 cursor-pointer select-none"
              onClick={() => toggleSection(2)}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  {expandedSections[2] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0071E3]" />
                  <h2 className="text-sm font-semibold text-[#1D1D1F]">
                    2. Card UI Layout &amp; Visual Theme
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-medium">
                  {activeTemplateDef.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-[#0071E3] font-medium">
                  {activeThemeTokens.name}
                </span>
              </div>
            </div>

            {expandedSections[2] && (
              <div className="space-y-6">
                
                {/* SUB-SECTION A: 5 MODERN CARD UI LAYOUT TEMPLATES */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-[#1D1D1F]">
                        A. Choose Modern Card UI Architecture
                      </span>
                      <span className="block text-[11px] text-[#86868B]">
                        Select the card layout and interaction model that fits your profile.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templateList.map((tpl) => {
                      const isSelected = (card.template_layout || "classic-segmented") === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => setCard({ ...card, template_layout: tpl.id })}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? "border-[#0071E3] ring-2 ring-[#0071E3]/20 bg-blue-50/20 shadow-xs"
                              : "border-black/[0.08] hover:border-black/[0.18] bg-[#FBFBFD]"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-neutral-200/70 text-neutral-700 mb-1">
                                {tpl.badge}
                              </span>
                              <h3 className="text-xs font-bold text-[#1D1D1F]">
                                {tpl.name}
                              </h3>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#0071E3] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <p className="text-[11px] text-[#86868B] my-2 leading-relaxed">
                            {tpl.description}
                          </p>

                          <div className="pt-2 border-t border-black/[0.05] flex flex-wrap gap-1">
                            {tpl.features.slice(0, 2).map((f) => (
                              <span key={f} className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-white border border-black/5 text-neutral-600">
                                ✓ {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-[1px] bg-black/[0.06] w-full" />

                {/* SUB-SECTION B: 22 COLOR PALETTES & THEMES */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-[#1D1D1F]">
                        B. Select Color Palette ({themeList.length} Handcrafted Themes)
                      </span>
                      <span className="block text-[11px] text-[#86868B]">
                        Each theme features distinct glassmorphism, accent glows, and contrast tokens.
                      </span>
                    </div>

                    {/* Search themes */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search palettes..."
                        value={themeSearchQuery}
                        onChange={(e) => setThemeSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-[11px] focus:outline-none focus:bg-white w-full sm:w-44"
                      />
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {([
                      { id: "all", label: "All Themes (22)" },
                      { id: "dark", label: "Dark OLED" },
                      { id: "light", label: "Light & Frost" },
                      { id: "luxury", label: "Luxury" },
                      { id: "cyber", label: "Cyber & Tech" },
                      { id: "editorial", label: "Editorial" },
                      { id: "creative", label: "Creative" },
                    ] as const).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedThemeCategory(cat.id as ThemeCategory)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-medium transition ${
                          selectedThemeCategory === cat.id
                            ? "bg-[#1D1D1F] text-white shadow-xs"
                            : "bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E8E8ED]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Theme Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {filteredThemes.map((th) => {
                      const isSelected = (card.theme || "apple-light") === th.id;
                      return (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setCard({ ...card, theme: th.id })}
                          className={`p-3 rounded-2xl text-left border transition-all relative flex flex-col justify-between min-h-[95px] ${
                            isSelected
                              ? "border-[#0071E3] ring-2 ring-[#0071E3]/25 bg-blue-50/20 shadow-xs"
                              : "border-black/[0.06] hover:border-black/[0.15] bg-[#FBFBFD]"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-5 h-5 rounded-full border border-black/10 shadow-xs shrink-0"
                                style={{ backgroundColor: th.previewBg }}
                              />
                              <div
                                className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0"
                                style={{ backgroundColor: th.previewAccent }}
                              />
                              {th.previewSecondary && (
                                <div
                                  className="w-2.5 h-2.5 rounded-full shadow-2xs shrink-0"
                                  style={{ backgroundColor: th.previewSecondary }}
                                />
                              )}
                            </div>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-[#0071E3] text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>

                          <div className="mt-2.5">
                            <span className="block text-[11px] font-semibold text-[#1D1D1F] leading-tight truncate">
                              {th.name}
                            </span>
                            <span className="block text-[9px] text-[#86868B] truncate mt-0.5 capitalize">
                              {th.isDark ? "Dark" : "Light"} • {th.category}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Section 3: Contact Information */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <div 
              className="flex items-center justify-between border-b pb-2 cursor-pointer select-none"
              onClick={() => toggleSection(3)}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  {expandedSections[3] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
                <h2 className="text-sm font-semibold text-[#1D1D1F]">
                  3. Contact &amp; Physical Office
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {card.email_work || "No email"}
              </span>
            </div>

            {expandedSections[3] && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                      Primary Phone
                    </label>
                    <PhoneInput
                      value={card.phone_primary}
                      onChange={(val) => setCard({ ...card, phone_primary: val })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={card.email_work}
                      onChange={(e) => setCard({ ...card, email_work: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                      Primary Website
                    </label>
                    <input
                      type="url"
                      value={card.website_primary}
                      onChange={(e) => setCard({ ...card, website_primary: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                      Portfolio / Case Studies
                    </label>
                    <input
                      type="url"
                      value={card.portfolio_url}
                      onChange={(e) => setCard({ ...card, portfolio_url: e.target.value })}
                      placeholder="https://dribbble.com/..."
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Office Street Address */}
                <div className="pt-2 space-y-2">
                  <span className="block text-[11px] font-semibold text-[#86868B] uppercase">
                    Office / Headquarters Address
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={card.office_address?.street || ""}
                      onChange={(e) => setCard({
                        ...card,
                        office_address: { ...card.office_address, street: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                    />
                    <input
                      type="text"
                      placeholder="City & Country"
                      value={card.office_address?.city || ""}
                      onChange={(e) => setCard({
                        ...card,
                        office_address: { ...card.office_address, city: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Section 4: Calendar Meeting Integration */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <div 
              className="flex items-center justify-between border-b pb-2 cursor-pointer select-none"
              onClick={() => toggleSection(4)}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  {expandedSections[4] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
                <h2 className="text-sm font-semibold text-[#1D1D1F]">
                  4. Calendar &amp; Instant Booking
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {card.booking_enabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {expandedSections[4] && (
              <>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FBFBFD] border border-black/[0.04]">
                  <div>
                    <span className="block text-xs font-semibold text-[#1D1D1F]">Enable 1-Tap Booking</span>
                    <span className="block text-[11px] text-[#86868B]">Let clients book appointments directly through your smart card.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={card.booking_enabled}
                    onChange={(e) => setCard({ ...card, booking_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0071E3]"
                  />
                </div>

                {card.booking_enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                        Meeting Title
                      </label>
                      <input
                        type="text"
                        value={card.booking_title}
                        onChange={(e) => setCard({ ...card, booking_title: e.target.value })}
                        placeholder="30-Min Strategy Consultation"
                        className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        value={card.booking_slot_duration}
                        onChange={(e) => setCard({ ...card, booking_slot_duration: parseInt(e.target.value) || 30 })}
                        className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section 5: Connected Social Channels */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <div 
              className="flex items-center justify-between border-b pb-2 cursor-pointer select-none"
              onClick={() => toggleSection(5)}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  {expandedSections[5] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
                <h2 className="text-sm font-semibold text-[#1D1D1F]">
                  5. Connected Social Networks &amp; Links
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {card.socials?.filter((s:any)=>s.url)?.length || 0} Connected
              </span>
            </div>

            {expandedSections[5] && (
              <div className="space-y-3 pt-1">
                {card.socials.map((social: any) => (
                  <div key={social.id} className="flex items-center gap-2">
                    <div className="w-24 shrink-0">
                      <span className="text-xs font-semibold text-[#1D1D1F]">{social.name}</span>
                    </div>
                    <input
                      type="url"
                      placeholder={`https://${social.id}.com/...`}
                      value={social.url || ""}
                      onChange={(e) => updateSocialUrl(social.id, e.target.value)}
                      className="flex-1 p-2 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: REAL-TIME MOBILE CARD PREVIEW */}
        {(() => {
          const pt = activeThemeTokens;
          const template = card.template_layout || "classic-segmented";

          return (
            <div className="lg:col-span-5 sticky top-20">
              <div className="text-center pb-2 flex items-center justify-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Live Preview: {activeTemplateDef.name} ({pt.name})
                </span>
              </div>

              {/* Device Mockup Canvas */}
              <div className={`w-full max-w-sm mx-auto ${pt.cardBg} border ${pt.border} rounded-[36px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.14)] flex flex-col items-center space-y-4 transition-all duration-300 relative overflow-hidden`}>
                
                {/* Template 1 & Default: Classic Apple Mockup */}
                {template === "classic-segmented" && (
                  <>
                    <div className={`w-20 h-20 rounded-[1.8rem] ${pt.avatarBg} border-2 ${pt.avatarBorder} shadow-md flex items-center justify-center relative overflow-hidden`}>
                      {card.avatar_url ? (
                        <img src={card.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className={`text-2xl font-bold tracking-tighter ${pt.textMain}`}>
                          {card.avatar_initials || "IK"}
                        </span>
                      )}
                      <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${pt.accentBg} text-white flex items-center justify-center shadow-xs border ${pt.avatarBorder}`}>
                        <Sparkles className="w-3 h-3 fill-white" />
                      </div>
                    </div>

                    <div className="text-center space-y-0.5">
                      <div className="flex items-center justify-center gap-1">
                        <h3 className={`text-lg font-bold tracking-tight ${pt.textMain}`}>
                          {card.full_name || "Your Full Name"}
                        </h3>
                        {card.is_verified && <VerifiedBadgeIcon className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className={`text-xs font-semibold ${pt.accent}`}>
                        {card.title || "Job Title"}
                      </p>
                      <p className={`text-[11px] ${pt.textSecondary}`}>
                        {card.company || "Company Name"}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="w-full grid grid-cols-4 gap-1.5">
                      <div className={`flex flex-col items-center p-2 rounded-xl ${pt.pillBg} text-center border ${pt.pillBorder}`}>
                        <Phone className="w-3.5 h-3.5 text-[#34C759] mb-1" />
                        <span className={`text-[9px] font-medium ${pt.textMain}`}>Call</span>
                      </div>
                      <div className={`flex flex-col items-center p-2 rounded-xl ${pt.pillBg} text-center border ${pt.pillBorder}`}>
                        <Mail className={`w-3.5 h-3.5 ${pt.accent} mb-1`} />
                        <span className={`text-[9px] font-medium ${pt.textMain}`}>Email</span>
                      </div>
                      <div className={`flex flex-col items-center p-2 rounded-xl ${pt.pillBg} text-center border ${pt.pillBorder}`}>
                        <Globe className="w-3.5 h-3.5 text-[#5856D6] mb-1" />
                        <span className={`text-[9px] font-medium ${pt.textMain}`}>Web</span>
                      </div>
                      <div className={`flex flex-col items-center p-2 rounded-xl ${pt.pillBg} text-center border ${pt.pillBorder}`}>
                        <Calendar className="w-3.5 h-3.5 text-[#FF9500] mb-1" />
                        <span className={`text-[9px] font-medium ${pt.textMain}`}>Meet</span>
                      </div>
                    </div>

                    {/* QR Mockup */}
                    <div className={`w-full ${pt.qrContainerBg} rounded-2xl p-3 flex flex-col items-center border ${pt.pillBorder}`}>
                      <div className="bg-white p-2 rounded-xl shadow-xs">
                        <QRCodeSVG
                          value={`https://card.app/${card.slug || "demo"}`}
                          size={110}
                          level="Q"
                          className="w-24 h-24"
                        />
                      </div>
                      <span className={`text-[9px] ${pt.textSecondary} pt-1 font-mono`}>
                        /{card.slug || "slug"}
                      </span>
                    </div>

                    {/* CTA Actions */}
                    <div className="w-full space-y-1.5">
                      <div className="w-full py-2 px-3 rounded-xl bg-black text-white text-[11px] font-medium flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <AppleIcon className="w-3.5 h-3.5 fill-white" />
                          <span>Add to Apple Wallet</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                      <div className={`w-full py-2 px-3 rounded-xl ${pt.accentBg} text-white text-[11px] font-medium text-center shadow-xs`}>
                        Save Contact Card (.vcf)
                      </div>
                    </div>
                  </>
                )}

                {/* Template 2: Bento Grid Mockup */}
                {template === "bento-grid" && (
                  <div className="w-full space-y-3">
                    <div className={`p-3.5 rounded-2xl ${pt.pillBg} border ${pt.pillBorder} flex items-center gap-3`}>
                      <div className={`w-12 h-12 rounded-xl ${pt.avatarBg} border ${pt.avatarBorder} overflow-hidden shrink-0 flex items-center justify-center`}>
                        {card.avatar_url ? (
                          <img src={card.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className={`text-lg font-bold ${pt.textMain}`}>{card.avatar_initials || "IK"}</span>
                        )}
                      </div>
                      <div className="truncate flex-1">
                        <span className={`block text-xs font-bold ${pt.textMain} truncate`}>{card.full_name || "Name"}</span>
                        <span className={`block text-[10px] font-semibold ${pt.accent} truncate`}>{card.title || "Title"}</span>
                        <span className={`block text-[9px] ${pt.textSecondary} truncate`}>{card.company || "Company"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2.5 rounded-xl ${pt.pillBg} border ${pt.pillBorder} text-center flex flex-col items-center justify-center`}>
                        <div className="bg-white p-1.5 rounded-lg shadow-2xs mb-1">
                          <QRCodeSVG value={`https://card.app/${card.slug}`} size={56} level="Q" className="w-14 h-14" />
                        </div>
                        <span className={`text-[8px] font-mono ${pt.textSecondary}`}>Instant Scan</span>
                      </div>
                      <div className={`p-2.5 rounded-xl ${pt.pillBg} border ${pt.pillBorder} flex flex-col justify-between`}>
                        <div className="space-y-0.5">
                          <span className={`block text-[10px] font-bold ${pt.textMain}`}>Bento Matrix</span>
                          <span className={`block text-[8px] ${pt.textSecondary}`}>NFC pass &amp; vCard</span>
                        </div>
                        <div className={`py-1.5 px-2 rounded-lg ${pt.accentBg} text-white text-[9px] font-bold text-center`}>
                          Sync Pass
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <div className={`p-1.5 rounded-lg ${pt.pillBg} text-center text-[9px] font-medium ${pt.textMain}`}>Call</div>
                      <div className={`p-1.5 rounded-lg ${pt.pillBg} text-center text-[9px] font-medium ${pt.textMain}`}>Email</div>
                      <div className={`p-1.5 rounded-lg ${pt.pillBg} text-center text-[9px] font-medium ${pt.textMain}`}>Web</div>
                      <div className={`p-1.5 rounded-lg ${pt.pillBg} text-center text-[9px] font-medium ${pt.textMain}`}>Meet</div>
                    </div>
                  </div>
                )}

                {/* Template 3: Executive Minimal Mockup */}
                {template === "executive-minimal" && (
                  <div className="w-full space-y-3 text-left">
                    <div className="border-b pb-2 border-black/10 dark:border-white/10 flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${pt.avatarBg} border ${pt.avatarBorder} overflow-hidden shrink-0 flex items-center justify-center`}>
                        {card.avatar_url ? (
                          <img src={card.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className={`text-base font-serif font-bold ${pt.textMain}`}>{card.avatar_initials || "IK"}</span>
                        )}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold font-serif ${pt.textMain}`}>{card.full_name || "Name"}</h4>
                        <span className={`text-[10px] uppercase font-semibold ${pt.accent}`}>{card.title || "Title"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className={`p-2 rounded-lg ${pt.pillBg} border ${pt.pillBorder} text-[10px] font-semibold ${pt.textMain} flex items-center justify-between`}>
                        <span>Direct Call</span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className={`p-2 rounded-lg ${pt.pillBg} border ${pt.pillBorder} text-[10px] font-semibold ${pt.textMain} flex items-center justify-between`}>
                        <span>Official Email</span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className={`p-2 rounded-lg ${pt.pillBg} border ${pt.pillBorder} text-[10px] font-semibold ${pt.textMain} flex items-center justify-between`}>
                        <span>Corporate Portal</span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>

                    <div className={`w-full py-2 rounded-xl ${pt.accentBg} text-white text-[10px] font-bold text-center`}>
                      Save Executive vCard
                    </div>
                  </div>
                )}

                {/* Template 4: Cyber HUD Mockup */}
                {template === "cyber-holo" && (
                  <div className="w-full space-y-3 font-mono text-center">
                    <div className="text-[9px] text-cyan-400 font-bold tracking-widest">[NODE:ONLINE // ENC:256]</div>
                    <div className="w-16 h-16 mx-auto rounded-xl border-2 border-cyan-400 p-0.5 overflow-hidden">
                      {card.avatar_url ? (
                        <img src={card.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full bg-cyan-950 flex items-center justify-center text-cyan-300 font-bold text-lg">
                          {card.avatar_initials || "IK"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{card.full_name || "Name"}</h4>
                      <p className="text-[9px] text-cyan-400">// {card.title || "TITLE"}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/50 border border-cyan-500/40">
                      <QRCodeSVG value={`https://card.app/${card.slug}`} size={70} level="Q" className="w-16 h-16 mx-auto" />
                    </div>
                    <div className="w-full py-1.5 rounded-lg bg-cyan-500 text-black text-[9px] font-bold">
                      EXTRACT VCARD STREAM
                    </div>
                  </div>
                )}

                {/* Template 5: Creative Hero Mockup */}
                {template === "creative-hero" && (
                  <div className="w-full rounded-2xl overflow-hidden text-left -mt-2">
                    <div className={`w-full h-16 bg-gradient-to-r ${pt.gradient} p-2 flex items-end`}>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-black/40 text-white font-bold">Visual Pass</span>
                    </div>
                    <div className="p-3 pt-0">
                      <div className="flex items-end justify-between -mt-6 mb-2">
                        <div className={`w-12 h-12 rounded-xl ${pt.avatarBg} border-2 ${pt.avatarBorder} overflow-hidden flex items-center justify-center shadow-md`}>
                          {card.avatar_url ? (
                            <img src={card.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className={`text-sm font-bold ${pt.textMain}`}>{card.avatar_initials || "IK"}</span>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${pt.accentBg} text-white`}>Connect</span>
                      </div>
                      <h4 className={`text-xs font-bold ${pt.textMain}`}>{card.full_name || "Name"}</h4>
                      <p className={`text-[10px] font-semibold ${pt.accent}`}>{card.title || "Title"}</p>
                      
                      <div className="grid grid-cols-4 gap-1 mt-3">
                        <div className={`p-1 rounded-md ${pt.pillBg} ${pt.textMain} border ${pt.pillBorder} text-[8px] font-bold text-center`}>Call</div>
                        <div className={`p-1 rounded-md ${pt.pillBg} ${pt.textMain} border ${pt.pillBorder} text-[8px] font-bold text-center`}>Email</div>
                        <div className={`p-1 rounded-md ${pt.pillBg} ${pt.textMain} border ${pt.pillBorder} text-[8px] font-bold text-center`}>Web</div>
                        <div className={`p-1 rounded-md ${pt.pillBg} ${pt.textMain} border ${pt.pillBorder} text-[8px] font-bold text-center`}>Meet</div>
                      </div>
                    </div>
                  </div>
                )}

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

      {/* AI Identity Camera Verification Modal */}
      <VerifyModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onVerified={(result) => {
          setCard({ ...card, is_verified: result.verified });
        }}
        cardId={id}
        fullName={card.full_name}
      />
    </div>
  );
}
