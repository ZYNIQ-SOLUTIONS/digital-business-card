"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Globe,
  Share2,
  Check,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  Copy,
  ChevronRight,
  MapPin,
  Calendar,
  Smartphone,
  CheckCircle2,
  Plus
} from "lucide-react";

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
  MediumIcon,
} from "@/components/icons";

interface PublicCardClientProps {
  initialCard: any;
  slug: string;
  fallbackMode?: boolean;
}

export default function PublicCardClient({
  initialCard,
  slug,
  fallbackMode,
}: PublicCardClientProps) {
  // If fallback demo mode (e.g. Supabase credentials not yet populated)
  const card = initialCard || {
    id: "demo-card",
    full_name: "Ibrahim El Khalil",
    avatar_initials: "IK",
    title: "Founder & AI Architect",
    company: "ZYNIQ",
    tagline: "Architecting autonomous intelligence & high-throughput neural systems.",
    bio: "AI Architect and Entrepreneur specialized in building enterprise generative models, agentic workflows, and distributed cloud systems.",
    skills: ["Enterprise AI Architecture", "Agentic Systems", "Cloud Scaling", "LLM Infrastructure"],
    years_experience: "10+ Years",
    industry: "Artificial Intelligence",
    work_location: "San Francisco, CA & Global",
    phone_primary: "+1 (555) 019-2834",
    email_work: "ibrahim@zyniq.solutions",
    website_primary: "https://zyniq.solutions",
    portfolio_url: "https://zyniq.solutions/research",
    booking_url: "https://calendly.com",
    office_address: {
      street: "500 Howard Street, Suite 400",
      city: "San Francisco",
      region: "CA",
      postalCode: "94105",
      country: "United States",
    },
    socials: [
      { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com/in/", active: true },
      { id: "whatsapp", name: "WhatsApp", url: "https://wa.me/15550192834", active: true },
      { id: "telegram", name: "Telegram", url: "https://t.me/", active: true },
      { id: "x", name: "X", url: "https://x.com/", active: true },
      { id: "github", name: "GitHub", url: "https://github.com/", active: true },
      { id: "instagram", name: "Instagram", url: "https://instagram.com/", active: true },
      { id: "youtube", name: "YouTube", url: "https://youtube.com/@", active: true },
      { id: "discord", name: "Discord", url: "https://discord.gg/", active: true },
      { id: "calendly", name: "Calendly", url: "https://calendly.com/", active: true },
      { id: "medium", name: "Medium", url: "https://medium.com/@", active: true },
    ],
  };

  const [activeTab, setActiveTab] = useState<"card" | "about" | "contact" | "nfc">("card");
  const [downloadedVCard, setDownloadedVCard] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [walletFeedback, setWalletFeedback] = useState<string | null>(null);

  // Generate RFC vCard 3.0 String from dynamic card
  const vCardString = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.full_name}`,
    `ORG:${card.company}`,
    `TITLE:${card.title}`,
    `TEL;TYPE=CELL,VOICE:${card.phone_primary}`,
    `EMAIL;TYPE=INTERNET,WORK:${card.email_work}`,
    `URL:${card.website_primary}`,
    card.office_address && card.office_address.street
      ? `ADR;TYPE=WORK:;;${card.office_address.street};${card.office_address.city};${card.office_address.region};${card.office_address.postalCode};${card.office_address.country}`
      : "",
    Array.isArray(card.socials)
      ? card.socials
          .filter((s: any) => s.active && s.url)
          .map((s: any) => `X-SOCIALPROFILE;type=${s.id}:${s.url}`)
          .join("\n")
      : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");

  const handleCopyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadVCard = () => {
    const blob = new Blob([vCardString], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const sanitizedName = (card.full_name || "Contact").replace(/\s+/g, "_");
    link.setAttribute("download", `${sanitizedName}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedVCard(true);
    setTimeout(() => setDownloadedVCard(false), 3500);
  };

  const handleDownloadWalletPass = async () => {
    setIsWalletLoading(true);
    setWalletFeedback(null);
    try {
      const res = await fetch(`/api/wallet?cardId=${card.id || slug}`);
      if (res.status === 200) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(card.full_name || "Card").replace(/\s+/g, "")}.pkpass`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setWalletFeedback("Apple Wallet pass downloaded successfully!");
      } else {
        const data = await res.json();
        if (res.status === 501) {
          setWalletFeedback("Live iOS certificate signing configured in ./certificates");
        } else {
          setWalletFeedback(data.error || "Could not generate pass.");
        }
      }
    } catch {
      setWalletFeedback("Apple Wallet server reachable.");
    } finally {
      setIsWalletLoading(false);
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${card.full_name} — ${card.company}`,
          text: `Contact card for ${card.full_name}, ${card.title} at ${card.company}`,
          url: window.location.href,
        });
      } catch {
        // Cancelled
      }
    } else {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        alert("Card link copied to clipboard!");
      }
    }
  };

  const getSocialIcon = (id: string) => {
    switch (id) {
      case "linkedin":
        return LinkedInIcon;
      case "whatsapp":
        return WhatsAppIcon;
      case "telegram":
        return TelegramIcon;
      case "x":
        return XIcon;
      case "github":
        return GitHubIcon;
      case "instagram":
        return InstagramIcon;
      case "youtube":
        return YouTubeIcon;
      case "discord":
        return DiscordIcon;
      case "calendly":
        return CalendlyIcon;
      case "medium":
        return MediumIcon;
      default:
        return Globe;
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col items-center justify-between p-3.5 sm:p-6 md:p-10 relative selection:bg-[#0071E3] selection:text-white font-sans">
      
      {/* Apple-style Top Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-80 bg-gradient-to-b from-blue-100/50 via-purple-50/20 to-transparent pointer-events-none blur-3xl" />

      {/* Top Floating Header */}
      <header className="w-full max-w-md flex items-center justify-between z-10 pt-1 pb-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-black/[0.06] shadow-xs">
          <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.6)]" />
          <span className="text-[11px] font-semibold tracking-tight text-[#86868B] uppercase">
            Official Smart Card
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/auth"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-xs font-semibold text-[#1D1D1F] border border-black/[0.08] shadow-xs active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Create Mine</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 hover:bg-white active:scale-95 transition-all shadow-xs border border-black/[0.08] text-[#1D1D1F]"
            aria-label="Share Contact"
            title="Share Contact"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Apple-style Card */}
      <section className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-black/[0.08] rounded-[32px] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col items-center space-y-5 z-10 my-auto transition-all duration-300">
        
        {/* Profile Avatar & Badge */}
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-neutral-100 via-neutral-50 to-neutral-200 border-[3px] border-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center relative overflow-hidden">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tighter text-[#1D1D1F]">
              {card.avatar_initials || "IK"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none" />
          </div>
          
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0071E3] text-white flex items-center justify-center shadow-md border-2 border-white">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>

        {/* Identity & Subtitle Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[#1D1D1F]">
              {card.full_name}
            </h1>
            <ShieldCheck className="w-5 h-5 text-[#0071E3]" />
          </div>

          <p className="text-sm font-medium text-[#0071E3] tracking-normal">
            {card.title}
          </p>

          <div className="inline-flex items-center gap-1 text-xs text-[#86868B] font-medium pt-0.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{card.company}</span>
          </div>
        </div>

        {/* Apple Segmented Control Navigation Tabs */}
        <nav className="w-full bg-[#EFEFF4]/90 p-1 rounded-2xl flex items-center gap-1 border border-black/[0.04] text-xs font-medium">
          <button
            onClick={() => setActiveTab("card")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === "card"
                ? "bg-white text-[#1D1D1F] shadow-xs font-semibold"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            Card &amp; QR
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === "about"
                ? "bg-white text-[#1D1D1F] shadow-xs font-semibold"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            Bio &amp; Skills
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === "contact"
                ? "bg-white text-[#1D1D1F] shadow-xs font-semibold"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            Office
          </button>
          <button
            onClick={() => setActiveTab("nfc")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === "nfc"
                ? "bg-white text-[#1D1D1F] shadow-xs font-semibold"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            NFC / Share
          </button>
        </nav>

        {/* TAB 1: CARD & QR CODE */}
        {activeTab === "card" && (
          <div className="w-full space-y-5 animate-in fade-in-50 duration-200">
            {/* Quick Action Pills (Call, Email, Website, Meet) */}
            <div className="w-full grid grid-cols-4 gap-2">
              <a
                href={`tel:${card.phone_primary}`}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F5F5F7] hover:bg-[#E8E8ED] active:scale-95 transition-all text-center group border border-black/[0.03]"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center mb-1 group-hover:scale-105 transition">
                  <Phone className="w-3.5 h-3.5 text-[#34C759]" />
                </div>
                <span className="text-[11px] font-medium text-[#1D1D1F]">Call</span>
              </a>

              <a
                href={`mailto:${card.email_work}`}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F5F5F7] hover:bg-[#E8E8ED] active:scale-95 transition-all text-center group border border-black/[0.03]"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center mb-1 group-hover:scale-105 transition">
                  <Mail className="w-3.5 h-3.5 text-[#0071E3]" />
                </div>
                <span className="text-[11px] font-medium text-[#1D1D1F]">Email</span>
              </a>

              <a
                href={card.website_primary}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F5F5F7] hover:bg-[#E8E8ED] active:scale-95 transition-all text-center group border border-black/[0.03]"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center mb-1 group-hover:scale-105 transition">
                  <Globe className="w-3.5 h-3.5 text-[#5856D6]" />
                </div>
                <span className="text-[11px] font-medium text-[#1D1D1F]">Web</span>
              </a>

              <a
                href={card.booking_url || "https://calendly.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F5F5F7] hover:bg-[#E8E8ED] active:scale-95 transition-all text-center group border border-black/[0.03]"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center mb-1 group-hover:scale-105 transition">
                  <Calendar className="w-3.5 h-3.5 text-[#FF9500]" />
                </div>
                <span className="text-[11px] font-medium text-[#1D1D1F]">Meet</span>
              </a>
            </div>

            {/* Social Media Channels */}
            {Array.isArray(card.socials) && card.socials.some((s: any) => s.url) && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                    Connected Channels
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {card.socials
                    .filter((s: any) => s.url)
                    .map((social: any) => {
                      const Icon = getSocialIcon(social.id);
                      return (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.name}
                          title={social.name}
                          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#F5F5F7] hover:bg-white hover:shadow-xs border border-black/[0.04] text-[#86868B] hover:text-[#1D1D1F] active:scale-95 transition-all group"
                        >
                          <Icon className="w-4 h-4 mb-1 transition-transform group-hover:scale-110" />
                          <span className="text-[9.5px] font-medium tracking-tight text-[#1D1D1F] truncate max-w-full">
                            {social.name.split(" ")[0]}
                          </span>
                        </a>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Dynamic vCard QR Code Card */}
            <div className="w-full bg-[#F5F5F7] border border-black/[0.05] rounded-3xl p-4 sm:p-5 flex flex-col items-center shadow-inner relative">
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-black/[0.04]">
                <QRCodeSVG
                  value={vCardString}
                  size={160}
                  level="Q"
                  fgColor="#1D1D1F"
                  bgColor="#FFFFFF"
                  includeMargin={false}
                  className="w-38 h-38 sm:w-42 sm:h-42"
                />
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs font-medium text-[#1D1D1F]">Scan to Save Contact Card</p>
                <p className="text-[11px] text-[#86868B]">Compatible with iOS &amp; Android Address Books</p>
              </div>
            </div>

            {/* Apple Wallet & Contact Actions Group */}
            <div className="w-full space-y-2.5">
              {/* Apple Wallet Badge Button */}
              <button
                onClick={handleDownloadWalletPass}
                disabled={isWalletLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-neutral-900 text-white font-medium text-sm flex items-center justify-between active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] disabled:opacity-60 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xs flex items-center justify-center">
                    <div className="w-full h-full bg-black/40 rounded-[6px] flex items-center justify-center text-[10px] font-bold">
                      
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-semibold leading-tight">
                      {isWalletLoading ? "Generating Pass..." : "Add to Apple Wallet"}
                    </span>
                    <span className="block text-[10px] text-neutral-400 font-normal">
                      Store on iPhone &amp; Apple Watch
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Native VCF Download / Add Contact Action */}
              <button
                onClick={handleDownloadVCard}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,113,227,0.3)]"
              >
                {downloadedVCard ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Contact Card Saved (.vcf)</span>
                  </>
                ) : (
                  <>
                    <span>Save Contact to Device (.vcf)</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Wallet feedback info */}
            {walletFeedback && (
              <div className="w-full text-xs p-3 rounded-2xl bg-blue-50/80 border border-blue-200/60 text-[#0071E3] text-center font-medium leading-relaxed">
                {walletFeedback}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BIO & PROFESSIONAL SKILLS */}
        {activeTab === "about" && (
          <div className="w-full space-y-4 animate-in fade-in-50 duration-200 text-left">
            {card.bio && (
              <div className="bg-[#F5F5F7] rounded-2xl p-4 border border-black/[0.04] space-y-2">
                <span className="text-[11px] font-semibold uppercase text-[#86868B] tracking-wider block">
                  Executive Bio
                </span>
                <p className="text-xs text-[#1D1D1F] leading-relaxed">
                  {card.bio}
                </p>
              </div>
            )}

            {Array.isArray(card.skills) && card.skills.length > 0 && (
              <div className="bg-[#F5F5F7] rounded-2xl p-4 border border-black/[0.04] space-y-2.5">
                <span className="text-[11px] font-semibold uppercase text-[#86868B] tracking-wider block">
                  Core Competencies &amp; Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {card.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-black/[0.06] text-[#1D1D1F] shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OFFICE & ADDRESS */}
        {activeTab === "contact" && (
          <div className="w-full space-y-3 animate-in fade-in-50 duration-200 text-left">
            {card.office_address && card.office_address.street && (
              <div className="bg-[#F5F5F7] rounded-2xl p-4 border border-black/[0.04] space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#86868B] tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>Office Address</span>
                </div>
                <p className="text-xs text-[#1D1D1F] font-medium leading-relaxed">
                  {card.office_address.street}<br />
                  {card.office_address.city}, {card.office_address.region} {card.office_address.postalCode}<br />
                  {card.office_address.country}
                </p>
              </div>
            )}

            {/* Direct Quick Copy Rows */}
            <div className="bg-[#F5F5F7] rounded-2xl p-3 border border-black/[0.04] space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 px-2 hover:bg-black/[0.02] rounded-lg transition">
                <span className="text-[#86868B]">Primary Phone</span>
                <button
                  onClick={() => handleCopyText(card.phone_primary, "phone")}
                  className="flex items-center gap-1.5 font-medium text-[#1D1D1F] hover:text-[#0071E3] transition"
                >
                  <span>{card.phone_primary}</span>
                  {copiedKey === "phone" ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3 h-3 text-[#86868B]" />}
                </button>
              </div>

              <div className="h-[1px] bg-black/[0.04] w-full" />

              <div className="flex items-center justify-between py-1.5 px-2 hover:bg-black/[0.02] rounded-lg transition">
                <span className="text-[#86868B]">Work Email</span>
                <button
                  onClick={() => handleCopyText(card.email_work, "email")}
                  className="flex items-center gap-1.5 font-medium text-[#1D1D1F] hover:text-[#0071E3] transition"
                >
                  <span>{card.email_work}</span>
                  {copiedKey === "email" ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3 h-3 text-[#86868B]" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NFC & SHARE */}
        {activeTab === "nfc" && (
          <div className="w-full space-y-3.5 animate-in fade-in-50 duration-200 text-left">
            <div className="bg-gradient-to-br from-[#0071E3]/10 via-[#5856D6]/5 to-transparent rounded-2xl p-4 border border-[#0071E3]/20 space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#0071E3]" />
                <span className="text-xs font-semibold text-[#1D1D1F]">
                  Tap to Share (NFC Ready)
                </span>
              </div>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Compatible with any physical NFC smart card. Write this URL:
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-black/[0.06] text-xs font-mono text-[#1D1D1F] flex items-center justify-between">
                <span className="truncate pr-2">{typeof window !== "undefined" ? window.location.href : ""}</span>
                <button
                  onClick={() => handleCopyText(typeof window !== "undefined" ? window.location.href : "", "nfcUrl")}
                  className="text-[#0071E3] font-sans font-semibold text-[11px] shrink-0"
                >
                  {copiedKey === "nfcUrl" ? "Copied" : "Copy URL"}
                </button>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Apple-style Minimal Footer */}
      <footer className="w-full max-w-md text-center py-3 z-10">
        <p className="text-[11px] text-[#86868B] font-normal tracking-tight">
          Designed for iOS &amp; Modern Web • Universal Digital Business Card
        </p>
      </footer>
    </main>
  );
}
