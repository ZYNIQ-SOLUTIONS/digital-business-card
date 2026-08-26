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
  LinkedInIcon, 
  WhatsAppIcon, 
  TelegramIcon, 
  InstagramIcon, 
  XIcon, 
  GitHubIcon, 
  YouTubeIcon, 
  DiscordIcon, 
  CalendlyIcon, 
  MediumIcon 
} from "@/components/icons";

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

  // Card Form State
  const [card, setCard] = useState<any>({
    full_name: "",
    slug: "",
    title: "",
    company: "",
    tagline: "",
    bio: "",
    avatar_initials: "",
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
    socials: [
      { id: "linkedin", name: "LinkedIn", url: "", active: true },
      { id: "whatsapp", name: "WhatsApp", url: "", active: true },
      { id: "telegram", name: "Telegram", url: "", active: true },
      { id: "x", name: "X", url: "", active: true },
      { id: "github", name: "GitHub", url: "", active: true },
      { id: "instagram", name: "Instagram", url: "", active: true },
      { id: "youtube", name: "YouTube", url: "", active: true },
      { id: "discord", name: "Discord", url: "", active: true },
      { id: "calendly", name: "Calendly", url: "", active: true },
      { id: "medium", name: "Medium", url: "", active: true },
    ],
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
        socials: Array.isArray(data.socials) && data.socials.length > 0
          ? data.socials
          : [
              { id: "linkedin", name: "LinkedIn", url: "", active: true },
              { id: "whatsapp", name: "WhatsApp", url: "", active: true },
              { id: "telegram", name: "Telegram", url: "", active: true },
              { id: "x", name: "X", url: "", active: true },
              { id: "github", name: "GitHub", url: "", active: true },
              { id: "instagram", name: "Instagram", url: "", active: true },
              { id: "youtube", name: "YouTube", url: "", active: true },
              { id: "discord", name: "Discord", url: "", active: true },
              { id: "calendly", name: "Calendly", url: "", active: true },
              { id: "medium", name: "Medium", url: "", active: true },
            ],
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
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">Executive Bio</label>
              <textarea
                rows={3}
                value={card.bio}
                onChange={(e) => setCard({ ...card, bio: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#1D1D1F] border-b pb-2">
              2. Contact &amp; Links
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={card.phone_primary}
                  onChange={(e) => setCard({ ...card, phone_primary: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">Work Email</label>
                <input
                  type="email"
                  value={card.email_work}
                  onChange={(e) => setCard({ ...card, email_work: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">Website URL</label>
                <input
                  type="text"
                  value={card.website_primary}
                  onChange={(e) => setCard({ ...card, website_primary: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">Booking / Meeting Link</label>
                <input
                  type="text"
                  value={card.booking_url || ""}
                  onChange={(e) => setCard({ ...card, booking_url: e.target.value })}
                  placeholder="https://calendly.com/..."
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social Media Links */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#1D1D1F] border-b pb-2">
              3. Connected Social Networks
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {card.socials.map((social: any) => (
                <div key={social.id}>
                  <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                    {social.name} URL / Username
                  </label>
                  <input
                    type="text"
                    value={social.url || ""}
                    onChange={(e) => updateSocialUrl(social.id, e.target.value)}
                    placeholder={`https://${social.id}.com/...`}
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME APPLE LIVE PREVIEW */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="text-center pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
              Real-Time Mobile Card Preview
            </span>
          </div>

          {/* Device Mockup Wrapper */}
          <div className="w-full max-w-sm mx-auto bg-white/90 backdrop-blur-2xl border border-black/[0.08] rounded-[32px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col items-center space-y-5">
            
            {/* Avatar Initials */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-neutral-100 to-neutral-200 border-2 border-white shadow-md flex items-center justify-center relative overflow-hidden">
              <span className="text-2xl font-semibold tracking-tighter text-[#1D1D1F]">
                {card.avatar_initials || "IK"}
              </span>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0071E3] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-3 h-3 fill-white" />
              </div>
            </div>

            {/* Name & Title */}
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1">
                <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                  {card.full_name || "Your Name"}
                </h3>
                <ShieldCheck className="w-4 h-4 text-[#0071E3]" />
              </div>
              <p className="text-xs font-semibold text-[#0071E3]">
                {card.title || "Job Title"}
              </p>
              <p className="text-[11px] text-[#86868B]">
                {card.company || "Company Name"}
              </p>
            </div>

            {/* Quick Actions 4-Grid */}
            <div className="w-full grid grid-cols-4 gap-1.5">
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#F5F5F7] text-center">
                <Phone className="w-3.5 h-3.5 text-[#34C759] mb-1" />
                <span className="text-[10px] font-medium">Call</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#F5F5F7] text-center">
                <Mail className="w-3.5 h-3.5 text-[#0071E3] mb-1" />
                <span className="text-[10px] font-medium">Email</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#F5F5F7] text-center">
                <Globe className="w-3.5 h-3.5 text-[#5856D6] mb-1" />
                <span className="text-[10px] font-medium">Web</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#F5F5F7] text-center">
                <Calendar className="w-3.5 h-3.5 text-[#FF9500] mb-1" />
                <span className="text-[10px] font-medium">Meet</span>
              </div>
            </div>

            {/* QR Mockup */}
            <div className="w-full bg-[#F5F5F7] rounded-2xl p-3 flex flex-col items-center border border-black/[0.04]">
              <div className="bg-white p-2 rounded-xl shadow-xs">
                <QRCodeSVG
                  value={`https://card.app/${card.slug || "demo"}`}
                  size={120}
                  level="Q"
                  className="w-28 h-28"
                />
              </div>
              <span className="text-[10px] text-[#86868B] pt-2 font-mono">
                /{card.slug || "slug"}
              </span>
            </div>

            {/* CTA Pill Buttons */}
            <div className="w-full space-y-2">
              <div className="w-full py-2.5 px-3 rounded-xl bg-black text-white text-[11px] font-medium flex items-center justify-between">
                <span> Add to Apple Wallet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="w-full py-2.5 px-3 rounded-xl bg-[#0071E3] text-white text-[11px] font-medium text-center">
                Save Contact Card (.vcf)
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
