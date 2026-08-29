"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Smartphone, 
  Zap, 
  Shield, 
  Bot, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Apple, 
  QrCode, 
  LayoutDashboard,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Star,
  Check,
  CreditCard,
  Building2,
  Calendar,
  Share2,
  Lock,
  Layers,
  Palette,
  Terminal
} from "lucide-react";
import { MagicDemoModal } from "@/components/magic-demo-modal";
import { themes, themeList } from "@/lib/theme";
import { cardTemplates, templateList } from "@/lib/templates";
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Interactive Live Sandbox State
  const [activeThemeId, setActiveThemeId] = useState("apple-dark");
  const [activeTemplateId, setActiveTemplateId] = useState<string>("classic-segmented");
  const [activeMode, setActiveMode] = useState<"work" | "social">("work");
  const [nfcTapped, setNfcTapped] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerNfcTap = () => {
    setNfcTapped(true);
    setTimeout(() => setNfcTapped(false), 3000);
  };

  const currentTheme = themes[activeThemeId] || themes["apple-dark"];

  return (
    <div className="min-h-screen bg-[#050507] text-[#F5F5F7] selection:bg-[#8b5cf6]/30 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Background Radial Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#8b5cf6]/10 blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#10b981]/10 blur-[150px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-[#0ea5e9]/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#050507]/90 backdrop-blur-xl border-b border-white/[0.06] py-3.5" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <svg id="logo-light" className="w-8 h-8 filter drop-shadow-[0_0_10px_rgba(139,92,246,0.4)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
              <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="14" strokeLinecap="round" />
              <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" />
              <circle cx="100" cy="100" r="14" fill="#ffffff" />
            </svg>
            <span className="font-bold text-xl tracking-tight text-white">IZN</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#interactive-exhibit" className="hover:text-white transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Live Card Sandbox</span>
            </a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#hardware-store" className="hover:text-white transition-colors">Physical NFC Cards</a>
            <a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a>
            <Link href="/store" className="hover:text-white transition-colors font-semibold text-[#10b981] flex items-center gap-1">
              <span>Hardware Store</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/store" className="md:hidden text-xs font-semibold text-[#10b981] px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
              Store
            </Link>
            <Link href="/auth" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors hidden sm:block px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/auth" className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition active:scale-95 flex items-center gap-1.5">
              <span>Get Free Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full pt-32 pb-32 space-y-36">
        
        {/* =========================================================================
            SECTION 1: IMMERSIVE HERO
            ========================================================================= */}
        <section className="max-w-6xl mx-auto px-6 pt-6 md:pt-16 flex flex-col items-center text-center relative">
          
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs font-semibold text-white mb-6 backdrop-blur-md shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-gray-300 font-normal">Next-Gen Digital Networking:</span>
            <span className="text-white font-bold">22 Themes &amp; 5 UI Templates Live</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.04] text-white max-w-4xl">
            The last <span className="bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#0ea5e9] bg-clip-text text-transparent">business card</span> you will ever carry.
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Instantly share your contact credentials, portfolio, and booking links right from Apple Wallet, Samsung Wallet, or luxury physical laser-engraved NFC metal.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/auth" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#10b981] hover:brightness-110 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(139,92,246,0.35)] active:scale-95">
              <span>Create Your Free Smart Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={triggerNfcTap}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-sm transition border border-white/[0.12] flex items-center justify-center gap-2 backdrop-blur-md active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-[#0ea5e9]" />
              <span>Simulate NFC Tap</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-20 pt-8 border-t border-white/[0.06] w-full max-w-4xl flex flex-wrap items-center justify-between gap-6 text-gray-500 text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#10b981]" />
              <span>100% No App Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#8b5cf6]" />
              <span>Instant Contact (.vcf) Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <Apple className="w-4 h-4 text-[#0ea5e9]" />
              <span>Native Apple Wallet Passes</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Aerospace Laser Engraved Metal</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: INTERACTIVE LIVE CARD & THEME SANDBOX EXHIBIT
            ========================================================================= */}
        <section id="interactive-exhibit" className="max-w-6xl mx-auto px-6">
          <div className="rounded-[40px] bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] p-8 sm:p-14 shadow-2xl space-y-10 relative overflow-hidden">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 text-xs font-bold uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5" />
                <span>Interactive Exhibit</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Experience the Card Engine Live.
              </h2>
              <p className="text-sm text-gray-400">
                Click any layout architecture or color palette below to see the business card transform in real-time.
              </p>
            </div>

            {/* Template Architecture Selector Bar */}
            <div className="flex flex-wrap justify-center gap-2">
              {templateList.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setActiveTemplateId(tpl.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTemplateId === tpl.id
                      ? "bg-white text-black shadow-lg scale-105"
                      : "bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                  }`}
                >
                  <span>{tpl.name}</span>
                </button>
              ))}
            </div>

            {/* Theme Swatches Picker */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {themeList.slice(0, 10).map((th) => (
                <button
                  key={th.id}
                  onClick={() => setActiveThemeId(th.id)}
                  className={`p-2 rounded-2xl flex items-center gap-2 transition border ${
                    activeThemeId === th.id
                      ? "border-white bg-white/10 ring-2 ring-white/20 shadow-md scale-105"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: th.previewBg }} />
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: th.previewAccent }} />
                  <span className="text-[11px] font-semibold text-white pr-1">{th.name}</span>
                </button>
              ))}
            </div>

            {/* Live Interactive Card Display */}
            <div className="flex justify-center pt-4">
              <div className={`w-full max-w-sm ${currentTheme.cardBg} border ${currentTheme.border} rounded-[36px] p-6 shadow-2xl flex flex-col items-center space-y-4 transition-all duration-500 relative`}>
                
                {/* Simulated NFC Beacon Ripple if tapped */}
                {nfcTapped && (
                  <div className="absolute inset-0 bg-[#0ea5e9]/20 backdrop-blur-xs rounded-[36px] flex flex-col items-center justify-center z-30 animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl animate-bounce mb-2">
                      <Zap className="w-8 h-8 text-[#0071E3]" />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">NFC Signal Transmitted!</span>
                    <span className="text-xs text-gray-200">Contact card synced instantly.</span>
                  </div>
                )}

                {/* Avatar */}
                <div className={`w-20 h-20 rounded-[1.8rem] ${currentTheme.avatarBg} border-2 ${currentTheme.avatarBorder} shadow-md flex items-center justify-center relative overflow-hidden`}>
                  <span className={`text-2xl font-bold tracking-tighter ${currentTheme.textMain}`}>
                    IK
                  </span>
                  <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${currentTheme.accentBg} text-white flex items-center justify-center shadow-xs border ${currentTheme.avatarBorder}`}>
                    <Sparkles className="w-3 h-3 fill-white" />
                  </div>
                </div>

                {/* Identity */}
                <div className="text-center space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className={`text-lg font-bold tracking-tight ${currentTheme.textMain}`}>
                      Ibrahim El Khalil
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <p className={`text-xs font-semibold ${currentTheme.accent}`}>
                    Founder &amp; AI Architect
                  </p>
                  <p className={`text-[11px] ${currentTheme.textSecondary}`}>
                    ZYNIQ Solutions • Dubai &amp; Global
                  </p>
                </div>

                {/* Quick Action Matrix */}
                <div className="w-full grid grid-cols-4 gap-1.5">
                  <div className={`flex flex-col items-center p-2 rounded-xl ${currentTheme.pillBg} text-center border ${currentTheme.pillBorder}`}>
                    <Phone className="w-3.5 h-3.5 text-[#34C759] mb-1" />
                    <span className={`text-[9px] font-medium ${currentTheme.textMain}`}>Call</span>
                  </div>
                  <div className={`flex flex-col items-center p-2 rounded-xl ${currentTheme.pillBg} text-center border ${currentTheme.pillBorder}`}>
                    <Mail className={`w-3.5 h-3.5 ${currentTheme.accent} mb-1`} />
                    <span className={`text-[9px] font-medium ${currentTheme.textMain}`}>Email</span>
                  </div>
                  <div className={`flex flex-col items-center p-2 rounded-xl ${currentTheme.pillBg} text-center border ${currentTheme.pillBorder}`}>
                    <Globe className="w-3.5 h-3.5 text-[#5856D6] mb-1" />
                    <span className={`text-[9px] font-medium ${currentTheme.textMain}`}>Web</span>
                  </div>
                  <div className={`flex flex-col items-center p-2 rounded-xl ${currentTheme.pillBg} text-center border ${currentTheme.pillBorder}`}>
                    <Calendar className="w-3.5 h-3.5 text-[#FF9500] mb-1" />
                    <span className={`text-[9px] font-medium ${currentTheme.textMain}`}>Meet</span>
                  </div>
                </div>

                {/* QR Code Pass */}
                <div className={`w-full ${currentTheme.qrContainerBg} rounded-2xl p-3 flex flex-col items-center border ${currentTheme.pillBorder}`}>
                  <div className="bg-white p-2 rounded-xl shadow-xs">
                    <QRCodeSVG
                      value="https://card.app/ibrahim"
                      size={100}
                      level="Q"
                      className="w-20 h-20"
                    />
                  </div>
                  <span className={`text-[9px] ${currentTheme.textSecondary} pt-1 font-mono`}>
                    card.app/ibrahim
                  </span>
                </div>

                {/* Primary Action Button */}
                <Link
                  href="/auth"
                  className={`w-full py-2.5 px-3 rounded-xl ${currentTheme.accentBg} text-white text-xs font-bold text-center shadow-md transition hover:brightness-110 flex items-center justify-center gap-1.5`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Contact to Phone (.vcf)</span>
                </Link>

              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 3: PHYSICAL HARDWARE SPOTLIGHT & STORE LINK
            ========================================================================= */}
        <section id="hardware-store" className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-r from-neutral-900 via-black to-neutral-950 rounded-[40px] p-8 sm:p-14 border border-white/[0.08] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12">
            
            <div className="space-y-6 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Physical Laser NFC Collection</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Pair your digital card with aerospace metal hardware.
              </h2>

              <p className="text-sm text-gray-400 leading-relaxed">
                Handcrafted from solid 316L stainless steel, 24K gold plating, and certified sustainable bamboo. Tap any phone to instantly transmit your card with zero apps.
              </p>

              <div className="space-y-2 pt-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span>Complimentary Fiber Laser Name &amp; Logo Engraving</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span>Same-Day UAE Delivery (Dubai &amp; Abu Dhabi)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span>IP68 Waterproof &amp; Lifetime Hardware Warranty</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  href="/store"
                  className="px-7 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
                >
                  <span>Explore Hardware Store</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/store/product?id=prod-obsidian-metal"
                  className="text-xs font-semibold text-gray-400 hover:text-white transition underline underline-offset-4"
                >
                  View Obsidian Metal
                </Link>
              </div>
            </div>

            {/* Hardware Visual Array */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <Link href="/store/product?id=prod-obsidian-metal" className="group rounded-3xl bg-neutral-900/60 p-4 border border-white/[0.08] hover:border-white/20 transition flex flex-col">
                <div className="aspect-square rounded-2xl bg-black overflow-hidden mb-3">
                  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" alt="Obsidian Metal" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-[#0071E3] transition">Matte Obsidian Steel</span>
                <span className="text-[11px] text-gray-400">AED 249.00</span>
              </Link>

              <Link href="/store/product?id=prod-24k-gold" className="group rounded-3xl bg-neutral-900/60 p-4 border border-white/[0.08] hover:border-white/20 transition flex flex-col">
                <div className="aspect-square rounded-2xl bg-black overflow-hidden mb-3">
                  <img src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80" alt="24K Gold" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-[#0071E3] transition">24K Gold Plated</span>
                <span className="text-[11px] text-gray-400">AED 399.00</span>
              </Link>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 4: CORE FEATURES SHOWCASE
            ========================================================================= */}
        <section id="features" className="max-w-6xl mx-auto px-6 space-y-24">
          
          {/* Feature 1: Apple Wallet Native Pass */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20">
                <Apple className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Lives natively in your Apple Wallet.
              </h2>
              <p className="text-base text-gray-400 leading-relaxed">
                Double-click your iPhone side button or raise your Apple Watch, and your digital business pass is ready to transmit in under 1 second. Works 100% offline at conferences and flights.
              </p>
              <ul className="space-y-3 pt-2 text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  <span>Instant push updates when you change titles or phone numbers</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  <span>Dynamic QR code sync on lock screen</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  <span>Zero apps required for the receiver</span>
                </li>
              </ul>
            </div>

            <div className="flex-1 w-full bg-neutral-900/30 rounded-[32px] border border-white/[0.08] p-8 min-h-[380px] flex items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="w-72 bg-[#121214] rounded-[28px] border border-white/[0.12] p-6 shadow-2xl space-y-4 transform hover:scale-105 transition duration-500">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <span className="text-xs font-bold text-white">Apple Wallet Pass</span>
                  <Apple className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white block">Ibrahim El Khalil</span>
                  <span className="text-xs text-[#10b981] font-mono block">AI Architect • ZYNIQ</span>
                </div>
                <div className="bg-white p-3 rounded-2xl flex items-center justify-center">
                  <QRCodeSVG value="https://card.app/ibrahim" size={110} level="Q" className="w-24 h-24" />
                </div>
                <span className="text-[10px] text-gray-400 font-mono text-center block">NFC / QR Sync Active</span>
              </div>
            </div>
          </div>

          {/* Feature 2: AI Paper Card Scanner */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                AI camera paper card extraction.
              </h2>
              <p className="text-base text-gray-400 leading-relaxed">
                Someone handed you an old paper card? Snap a photo in your dashboard. Our multimodal neural vision extracts their name, email, phone, job title, and social URLs with 100% accuracy.
              </p>
              <div className="pt-2">
                <Link href="/auth" className="inline-flex items-center gap-2 text-[#0ea5e9] font-bold text-sm hover:underline">
                  <span>Try AI Vision Scanner</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="flex-1 w-full bg-neutral-900/30 rounded-[32px] border border-white/[0.08] p-8 min-h-[380px] flex items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="w-72 bg-[#121214] rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden">
                <div className="h-44 bg-neutral-950 relative flex items-center justify-center p-4">
                  <div className="w-40 h-24 rounded-lg bg-neutral-800 border border-white/20 p-3 flex flex-col justify-center space-y-1.5 shadow-md">
                    <div className="h-2 w-20 bg-white/40 rounded" />
                    <div className="h-1.5 w-28 bg-white/20 rounded" />
                  </div>
                  {/* Laser Scan line */}
                  <div className="absolute inset-x-0 top-1/2 h-1 bg-[#0ea5e9] shadow-[0_0_15px_#0ea5e9] animate-pulse" />
                </div>
                <div className="p-4 bg-black/80 space-y-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">AI Vision OCR</span>
                    <span className="text-[9px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded">99.8% Confidence</span>
                  </div>
                  <div className="h-6 bg-white/[0.04] rounded px-2 text-[10px] text-gray-300 flex items-center">Sarah Jenkins • Partner</div>
                  <div className="h-6 bg-white/[0.04] rounded px-2 text-[10px] text-gray-300 flex items-center">sarah@apexventures.com</div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* =========================================================================
            SECTION 5: ENTERPRISE FLEET MANAGEMENT
            ========================================================================= */}
        <section id="enterprise" className="max-w-6xl mx-auto px-6">
          <div className="rounded-[40px] bg-gradient-to-br from-neutral-950 to-neutral-900 border border-white/[0.08] p-8 sm:p-14 shadow-2xl flex flex-col lg:flex-row items-center gap-12">
            
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Enterprise Fleet Control</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Scales effortlessly from 10 to 10,000 employees.
              </h2>

              <p className="text-sm text-gray-400 leading-relaxed">
                Centralized HR directory dashboard to generate, update, and manage branded Apple Wallet passes and physical smart cards across global teams in seconds.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-base font-bold text-white block">1-Click Provisioning</span>
                  <span className="text-gray-400">Bulk upload employees via CSV / Excel.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-base font-bold text-white block">Instant Revocation</span>
                  <span className="text-gray-400">Revoke passes when team members leave.</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/enterprise"
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#0ea5e9] text-white font-bold text-xs shadow-md transition hover:brightness-110 inline-flex items-center gap-2"
                >
                  <span>Launch Enterprise Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Enterprise Directory Preview */}
            <div className="flex-1 w-full bg-[#121214] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs font-bold text-white">Global Team Directory</span>
                <span className="text-[10px] font-mono text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-0.5 rounded">Active: 1,420 Passes</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Ibrahim El Khalil", role: "Chief Executive Officer", status: "Active" },
                  { name: "Elena Rostova", role: "VP of Global Partnerships", status: "Active" },
                  { name: "Marcus Vance", role: "Director of Enterprise Sales", status: "Active" },
                ].map((member, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{member.name}</span>
                      <span className="text-[11px] text-gray-400">{member.role}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded">
                      ● {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 6: FREQUENTLY ASKED QUESTIONS (ACCORDION)
            ========================================================================= */}
        <section className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-400">
              Everything you need to know about our smart digital passes &amp; hardware.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { q: "Does the recipient need any app installed?", a: "No! When you tap your IZN card or show your Apple Wallet pass, the contact profile opens instantly in their native web browser. They can tap 'Save Contact' to download your .vcf directly into their iOS or Android address book." },
              { q: "How do I update my contact details?", a: "Log into your IZN dashboard anytime. All updates (new phone number, job title, theme, booking calendar link) sync immediately to your live cloud URL and physical cards with zero re-printing." },
              { q: "How fast is shipping for physical NFC metal cards?", a: "Orders across the UAE (Dubai, Abu Dhabi, Sharjah) are delivered in 24–48 hours. Worldwide express delivery arrives in 3–5 business days with full tracking." },
              { q: "Can I customize the laser engraving with my company logo?", a: "Yes! Every physical card includes complimentary precision fiber laser engraving with your custom name, title, and logo vector." },
            ].map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${activeFaq === idx ? 'rotate-90 text-white' : ''}`} />
                </div>
                {activeFaq === idx && (
                  <p className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-white/[0.04]">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: FINAL CALL TO ACTION
            ========================================================================= */}
        <section className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="p-10 md:p-16 rounded-[40px] bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.08] shadow-2xl space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Ready to own every room you enter?
            </h2>
            <p className="text-base text-gray-400 max-w-xl mx-auto">
              Join thousands of executives, founders, and professionals upgrading to smart digital networking today.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#0ea5e9] hover:brightness-110 text-white font-bold text-sm shadow-[0_15px_30px_rgba(139,92,246,0.35)] transition active:scale-95"
              >
                Get Started for Free Today
              </Link>
              <Link
                href="/store"
                className="px-8 py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white font-bold text-sm transition active:scale-95"
              >
                Shop Physical Cards
              </Link>
            </div>
            <p className="text-[11px] text-gray-500 font-mono pt-2">Free digital card creation • 60-second setup</p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] py-12 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <svg id="logo-light" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
              <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeLinecap="round" />
              <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#10b981" strokeWidth="16" strokeLinecap="round" />
              <circle cx="100" cy="100" r="16" fill="#ffffff" />
            </svg>
            <span className="font-bold text-white tracking-tight">IZN Smart Business Cards</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/store" className="hover:text-white transition">Hardware Store</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/support" className="hover:text-white transition">Support &amp; Help</Link>
          </div>

          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} IZN. All rights reserved.</p>
        </div>
      </footer>

      {/* Magic Demo Modal */}
      <MagicDemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      
    </div>
  );
}
