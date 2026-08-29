/* eslint-disable */
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
  Plus,
  Camera,
  QrCode,
  CreditCard
} from "lucide-react";
import { themes } from "@/lib/theme";
import { ExchangeModal } from "@/components/exchange-modal";
import { BookingModal } from "@/components/booking-modal";

import {
  AppleIcon,
  AppleWalletIcon,
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
  TikTokIcon,
  ThreadsIcon,
  FacebookIcon,
  SnapchatIcon,
  SpotifyIcon,
  TwitchIcon,
  BehanceIcon,
  DribbbleIcon,
  SubstackIcon,
  PinterestIcon,
  RedditIcon,
  SignalIcon,
  VerifiedBadgeIcon,
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

  const activeTheme = card.theme || "apple-light";
  const t = themes[activeTheme] || themes["apple-light"];

  const mode = card.active_mode || "all";
  
  const professionalLinks = ["linkedin", "calendly", "github", "twitter", "x", "website", "email"];
  const socialLinks = ["instagram", "whatsapp", "telegram", "youtube", "discord", "snapchat", "tiktok"];
  
  const filteredLinks = card.social_links ? card.social_links.filter((link: any) => {
    if (mode === "all") return true;
    const platform = (link.platform || "").toLowerCase();
    if (mode === "work") {
      return professionalLinks.includes(platform) || !socialLinks.includes(platform);
    }
    if (mode === "social") {
      return socialLinks.includes(platform) || !professionalLinks.includes(platform);
    }
    return true;
  }) : [];


  const [activeTab, setActiveTab] = useState<"card" | "about" | "contact" | "nfc">("card");
  const [downloadedVCard, setDownloadedVCard] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [walletFeedback, setWalletFeedback] = useState<string | null>(null);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(true);

  React.useEffect(() => {
    setIsAppleDevice(/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent));
  }, []);

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
    switch (id?.toLowerCase()) {
      case "linkedin":
        return LinkedInIcon;
      case "whatsapp":
        return WhatsAppIcon;
      case "telegram":
        return TelegramIcon;
      case "x":
      case "twitter":
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
      case "tiktok":
        return TikTokIcon;
      case "threads":
        return ThreadsIcon;
      case "facebook":
        return FacebookIcon;
      case "snapchat":
        return SnapchatIcon;
      case "spotify":
        return SpotifyIcon;
      case "twitch":
        return TwitchIcon;
      case "behance":
        return BehanceIcon;
      case "dribbble":
        return DribbbleIcon;
      case "substack":
        return SubstackIcon;
      case "pinterest":
        return PinterestIcon;
      case "reddit":
        return RedditIcon;
      case "signal":
        return SignalIcon;
      default:
        return Globe; // generic fallback for custom links
    }
  };

  return (
    <div className={`min-h-screen ${t.bg} selection:bg-black selection:text-white flex flex-col font-sans relative`}>
      <div className={`fixed inset-0 ${t.gradient} opacity-50 pointer-events-none`} />
      <div className={`fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay`} />

      <header className="w-full max-w-md mx-auto h-8 z-20 sticky top-4" />

      {/* Main Apple-style Card */}

      <section className={`w-full max-w-md ${t.cardBg} backdrop-blur-2xl border ${t.border} rounded-[32px] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col items-center space-y-5 z-10 my-auto transition-all duration-300`}>
        
        {/* Profile Avatar & Badge */}
        <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-500 ease-out mt-2">
          <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-[2.5rem] ${t.avatarBg} border-4 ${t.avatarBorder} shadow-[0_16px_40px_rgba(0,0,0,0.15)] flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]`}>
            {card.profile_image_url ? (
              <img src={card.profile_image_url} alt={card.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className={`text-4xl sm:text-5xl font-bold tracking-tighter ${t.textMain}`}>
                {card.avatar_initials || "IK"}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl ${t.accentBg} text-white flex items-center justify-center shadow-lg border-4 ${t.cardBg} group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
            <Sparkles className="w-4 h-4 fill-white animate-pulse" />
          </div>
        </div>

        {/* Identity & Subtitle Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className={`text-2xl sm:text-[28px] font-semibold tracking-tight ${t.textMain}`}>
              {card.full_name}
            </h1>
            {card.is_verified ? (
              <span title="AI Verified Identity • 100% Authentic Profile">
                <VerifiedBadgeIcon className="w-5 h-5 text-green-500 shrink-0 drop-shadow-2xs" />
              </span>
            ) : (
              <ShieldCheck className={`w-5 h-5 ${t.accent}`} />
            )}
          </div>

          <p className={`text-sm font-medium ${t.accent} tracking-normal`}>
            {card.title}
          </p>

          <div className={`inline-flex items-center gap-1 text-xs ${t.textSecondary} font-medium pt-0.5`}>
            <Building2 className="w-3.5 h-3.5" />
            <span>{card.company}</span>
          </div>
        </div>

        {/* Apple Segmented Control Navigation Tabs */}
        <nav className={`w-full ${t.tabBg} p-1.5 rounded-2xl flex items-center gap-1 text-[13px] font-medium border ${t.pillBorder} relative shadow-inner z-10`}>
          {([
            { id: "card", label: "Card & QR" },
            { id: "about", label: "Bio & Skills" },
            { id: "contact", label: "Office" },
            { id: "nfc", label: "Share" }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-h-[44px] rounded-xl relative transition-all duration-300 ease-out flex items-center justify-center ${
                activeTab === tab.id
                  ? `${t.tabActiveBg} ${t.tabActiveText} scale-100 shadow-sm`
                  : `${t.tabInactiveText} hover:bg-black/5 dark:hover:bg-white/5 scale-95 hover:scale-100`
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* TAB 1: CARD & QR CODE */}
        {activeTab === "card" && (
          <div className="w-full space-y-5 animate-in fade-in-50 duration-200">
            {/* Quick Action Pills (Call, Email, Website, Meet) */}
            <div className="w-full grid grid-cols-4 gap-2">
              <a
                href={`tel:${card.phone_primary}`}
                className={`flex flex-col items-center justify-center p-3 min-h-[64px] rounded-2xl ${t.pillBg} ${t.pillHover} active:scale-95 transition-all text-center group border ${t.pillBorder}`}
              >
                <div className={`w-10 h-10 rounded-full ${t.iconCircleBg} shadow-sm flex items-center justify-center mb-1 group-hover:scale-105 transition`}>
                  <Phone className="w-4 h-4 text-[#34C759]" />
                </div>
                <span className={`text-xs font-medium ${t.textMain}`}>Call</span>
              </a>

              <a
                href={`mailto:${card.email_work}`}
                className={`flex flex-col items-center justify-center p-3 min-h-[64px] rounded-2xl ${t.pillBg} ${t.pillHover} active:scale-95 transition-all text-center group border ${t.pillBorder}`}
              >
                <div className={`w-10 h-10 rounded-full ${t.iconCircleBg} shadow-sm flex items-center justify-center mb-1 group-hover:scale-105 transition`}>
                  <Mail className={`w-4 h-4 ${t.accent}`} />
                </div>
                <span className={`text-xs font-medium ${t.textMain}`}>Email</span>
              </a>

              <a
                href={card.website_primary}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center p-3 min-h-[64px] rounded-2xl ${t.pillBg} ${t.pillHover} active:scale-95 transition-all text-center group border ${t.pillBorder}`}
              >
                <div className={`w-10 h-10 rounded-full ${t.iconCircleBg} shadow-sm flex items-center justify-center mb-1 group-hover:scale-105 transition`}>
                  <Globe className="w-4 h-4 text-[#5856D6]" />
                </div>
                <span className={`text-xs font-medium ${t.textMain}`}>Web</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (card.booking_enabled !== false) {
                    setIsBookingModalOpen(true);
                  } else if (card.booking_url) {
                    window.open(card.booking_url, "_blank");
                  } else {
                    setIsBookingModalOpen(true);
                  }
                }}
                className={`flex flex-col items-center justify-center p-3 min-h-[64px] rounded-2xl ${t.pillBg} ${t.pillHover} active:scale-95 transition-all text-center group border ${t.pillBorder} cursor-pointer`}
              >
                <div className={`w-10 h-10 rounded-full ${t.iconCircleBg} shadow-sm flex items-center justify-center mb-1 group-hover:scale-105 transition`}>
                  <Calendar className="w-4 h-4 text-[#FF9500]" />
                </div>
                <span className={`text-xs font-medium ${t.textMain}`}>Meet</span>
              </button>
            </div>

            {/* Social Media Channels */}
            {Array.isArray(card.socials) && card.socials.some((s: any) => s.url) && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className={`text-[13px] font-semibold ${t.textSecondary} uppercase tracking-wider`}>
                    Connected Channels
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                          className={`flex flex-col items-center justify-center p-3 min-h-[56px] rounded-2xl ${t.pillBg} ${t.pillHover} border ${t.pillBorder} ${t.textSecondary} hover:${t.textMain} active:scale-95 transition-all group`}
                        >
                          <Icon className="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110" />
                          <span className={`text-[11px] font-medium tracking-tight ${t.textMain} truncate max-w-full`}>
                            {social.name.split(" ")[0]}
                          </span>
                        </a>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Dynamic Card URL QR Code Card */}
            <div className={`w-full ${t.qrContainerBg} border ${t.pillBorder} rounded-[32px] p-5 sm:p-6 flex flex-col items-center shadow-inner relative`}>
              <div className="bg-white p-4 rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-black/[0.05]">
                <QRCodeSVG
                  value={typeof window !== "undefined" ? `${window.location.origin}/${card.slug}` : `/${card.slug}`}
                  size={180}
                  level="Q"
                  fgColor="#1D1D1F"
                  bgColor="#FFFFFF"
                  includeMargin={false}
                  className="w-40 h-40 sm:w-44 sm:h-44"
                />
              </div>

              <div className="mt-4 text-center">
                <p className={`text-[15px] font-semibold ${t.textMain}`}>Scan to Open Digital Card</p>
                <p className={`text-[13px] ${t.textSecondary} mt-1`}>Instant web card on iOS &amp; Android</p>
              </div>
            </div>

            {/* Apple Wallet & Contact Actions Group */}
            <div className="w-full space-y-3">
              {/* Apple Wallet Badge Button */}
              <button
                onClick={handleDownloadWalletPass}
                disabled={isWalletLoading}
                className="w-full py-4 px-5 min-h-[60px] rounded-[24px] bg-black/90 hover:bg-black text-white font-medium flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] disabled:opacity-60 group border border-white/10 relative overflow-hidden"
              >
                {/* subtle shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-10 h-10 rounded-2xl ${isAppleDevice ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : 'bg-neutral-800'} p-[1px] shadow-sm flex items-center justify-center group-hover:rotate-3 transition-transform duration-300`}>
                    <div className="w-full h-full bg-black/40 rounded-[15px] flex items-center justify-center backdrop-blur-sm">
                      {isAppleDevice ? <AppleIcon className="w-4.5 h-4.5 fill-white drop-shadow-sm" /> : <CreditCard className="w-4.5 h-4.5 text-white drop-shadow-sm" />}
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="block text-[15px] font-semibold leading-tight tracking-wide">
                      {isWalletLoading ? "Generating Pass..." : (isAppleDevice ? "Add to Apple Wallet" : "Add to Wallet")}
                    </span>
                    <span className="block text-[12px] text-neutral-400 font-medium mt-0.5 tracking-wide">
                      {isAppleDevice ? "Store on iPhone & Watch" : "Save as digital pass"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 group-hover:text-white transition-all relative z-10" />
              </button>

              {/* Native VCF Download / Add Contact Action */}
              <button
                onClick={handleDownloadVCard}
                className={`w-full py-4 px-5 min-h-[56px] rounded-[20px] ${t.accentBg} ${t.accentHover} text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,113,227,0.3)]`}
              >
                {downloadedVCard ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span className="text-[15px] font-semibold">Contact Card Saved (.vcf)</span>
                  </>
                ) : (
                  <>
                    <span className="text-[15px] font-semibold">Save Contact to Device (.vcf)</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Wallet feedback info */}
            {walletFeedback && (
              <div className={`w-full text-xs p-3 rounded-2xl bg-blue-50/80 border border-blue-200/60 ${t.accent} text-center font-medium leading-relaxed`}>
                {walletFeedback}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BIO & PROFESSIONAL SKILLS */}
        {activeTab === "about" && (
          <div className="w-full space-y-4 animate-in fade-in-50 duration-200 text-left">
            {card.bio && (
              <div className={`${t.pillBg} rounded-2xl p-4 border ${t.pillBorder} space-y-2`}>
                <span className={`text-[11px] font-semibold uppercase ${t.textSecondary} tracking-wider block`}>
                  Executive Bio
                </span>
                <p className={`text-xs ${t.textMain} leading-relaxed`}>
                  {card.bio}
                </p>
              </div>
            )}

            {Array.isArray(card.skills) && card.skills.length > 0 && (
              <div className={`${t.pillBg} rounded-2xl p-4 border ${t.pillBorder} space-y-2.5`}>
                <span className={`text-[11px] font-semibold uppercase ${t.textSecondary} tracking-wider block`}>
                  Core Competencies &amp; Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {card.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg ${t.iconCircleBg} border ${t.pillBorder} ${t.textMain} shadow-2xs`}
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
              <div className={`${t.pillBg} rounded-2xl p-4 border ${t.pillBorder} space-y-2`}>
                <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase ${t.textSecondary} tracking-wider`}>
                  <MapPin className={`w-3.5 h-3.5 ${t.accent}`} />
                  <span>Office Address</span>
                </div>
                <p className={`text-xs ${t.textMain} font-medium leading-relaxed`}>
                  {card.office_address.street}<br />
                  {card.office_address.city}, {card.office_address.region} {card.office_address.postalCode}<br />
                  {card.office_address.country}
                </p>
              </div>
            )}

            {/* Direct Quick Copy Rows */}
            <div className={`${t.pillBg} rounded-2xl p-3 border ${t.pillBorder} space-y-2 text-xs`}>
              <div className={`flex items-center justify-between py-1.5 px-2 ${t.pillHover} rounded-lg transition`}>
                <span className={`${t.textSecondary}`}>Primary Phone</span>
                <button
                  onClick={() => handleCopyText(card.phone_primary, "phone")}
                  className={`flex items-center gap-1.5 font-medium ${t.textMain} hover:${t.accent} transition`}
                >
                  <span>{card.phone_primary}</span>
                  {copiedKey === "phone" ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className={`w-3 h-3 ${t.textSecondary}`} />}
                </button>
              </div>

              <div className={`h-[1px] ${t.divider} w-full`} />

              <div className={`flex items-center justify-between py-1.5 px-2 ${t.pillHover} rounded-lg transition`}>
                <span className={`${t.textSecondary}`}>Work Email</span>
                <button
                  onClick={() => handleCopyText(card.email_work, "email")}
                  className={`flex items-center gap-1.5 font-medium ${t.textMain} hover:${t.accent} transition`}
                >
                  <span>{card.email_work}</span>
                  {copiedKey === "email" ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className={`w-3 h-3 ${t.textSecondary}`} />}
                </button>
              </div>

              <div className={`h-[1px] ${t.divider} w-full`} />

              {/* Direct Booking Schedule Trigger */}
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className={`w-full py-2 px-2 ${t.pillHover} rounded-lg flex items-center justify-between transition cursor-pointer text-left`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF9500]" />
                  <div>
                    <span className={`font-semibold ${t.textMain} block leading-tight`}>{card.booking_title || "Schedule Consultation"}</span>
                    <span className={`text-[10px] ${t.textSecondary}`}>{card.booking_slot_duration || 30} mins • Pick a date &amp; time</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${t.textSecondary}`} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: NFC & SHARE */}
        {activeTab === "nfc" && (
          <div className="w-full space-y-3.5 animate-in fade-in-50 duration-200 text-left">
            <div className={`bg-gradient-to-br ${t.gradient} to-transparent rounded-2xl p-4 border ${t.pillBorder} space-y-2`}>
              <div className="flex items-center gap-2">
                <Smartphone className={`w-4 h-4 ${t.accent}`} />
                <span className={`text-xs font-semibold ${t.textMain}`}>
                  Tap to Share (NFC Ready)
                </span>
              </div>
              <p className={`text-xs ${t.textSecondary} leading-relaxed`}>
                Compatible with any physical NFC smart card. Write this URL:
              </p>
              <div className={`${t.pillBg} p-2.5 rounded-xl border ${t.pillBorder} text-xs font-mono ${t.textMain} flex items-center justify-between`}>
                <span className="truncate pr-2">{typeof window !== "undefined" ? window.location.href : ""}</span>
                <button
                  onClick={() => handleCopyText(typeof window !== "undefined" ? window.location.href : "", "nfcUrl")}
                  className={`${t.accent} font-sans font-semibold text-[11px] shrink-0 hover:underline`}
                >
                  {copiedKey === "nfcUrl" ? "Copied" : "Copy URL"}
                </button>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Share Info Back Floating CTA */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsExchangeModalOpen(true)}
          className={`w-16 h-16 rounded-full ${t.accentBg} ${t.accentHover} text-white shadow-2xl active:scale-[0.98] hover:scale-105 transition-all flex items-center justify-center`}
          title="Share Your Info Back"
        >
          <QrCode className="w-7 h-7" />
        </button>
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 pb-8 pt-6 z-20">
        <Link
          href="/auth"
          className={`w-full max-w-[90%] py-4 rounded-2xl ${t.pillBg} ${t.pillHover} text-[15px] font-semibold ${t.textMain} border ${t.pillBorder} shadow-sm active:scale-95 transition text-center flex items-center justify-center gap-2`}
        >
          <Plus className={`w-4 h-4 ${t.accent}`} />
          <span>Create My Smart Card</span>
        </Link>
        <button
          onClick={handleShare}
          className={`w-full max-w-[90%] py-4 rounded-2xl ${t.pillBg} ${t.pillHover} text-[15px] font-semibold ${t.textMain} border ${t.pillBorder} shadow-sm active:scale-95 transition text-center flex items-center justify-center gap-2`}
        >
          <Share2 className="w-4 h-4" />
          <span>Share This Contact</span>
        </button>
      </div>
      <ExchangeModal 
        isOpen={isExchangeModalOpen} 
        onClose={() => setIsExchangeModalOpen(false)} 
        cardOwnerName={card.full_name} 
        cardId={card.id || slug} 
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        card={card}
      />

      {/* Apple-style Minimal Footer */}
      <footer className="w-full max-w-md text-center py-3 z-10">
        <p className={`text-[11px] ${t.textSecondary} font-normal tracking-tight`}>
          Designed for iOS &amp; Modern Web • Universal Digital Business Card
        </p>
      </footer>
    </div>
  );
}
