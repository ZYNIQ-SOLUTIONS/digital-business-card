"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
  Terminal,
  ShoppingBag,
  Plus,
  Truck,
  ShieldCheck,
  Eye,
  ExternalLink
} from "lucide-react";
import { MagicDemoModal } from "@/components/magic-demo-modal";
import { IphoneCardShowcase } from "@/components/iphone-card-showcase";
import { themes, themeList, ThemeCategory } from "@/lib/theme";
import { cardTemplates, templateList, TemplateLayoutId } from "@/lib/templates";
import { DEFAULT_PRODUCTS, ProductDetail } from "@/lib/store/default-products";
import { useCartStore } from "@/lib/store/cart-store";
import { QRCodeSVG } from "qrcode.react";
import { AppleIcon, VerifiedBadgeIcon, LinkedInIcon, WhatsAppIcon, XIcon, GitHubIcon, InstagramIcon } from "@/components/icons";

export default function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Interactive Live Sandbox State
  const [activeThemeId, setActiveThemeId] = useState("apple-dark");
  const [activeTemplateId, setActiveTemplateId] = useState<TemplateLayoutId>("classic-segmented");
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<ThemeCategory>("all");
  const [nfcTapped, setNfcTapped] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Cart store for direct quick adding from the landing page
  const { addItem } = useCartStore();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [storeProducts, setStoreProducts] = useState<ProductDetail[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || 'Dashboard');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadLiveProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setStoreProducts(data.products);
          } else {
            setStoreProducts([]);
          }
        }
      } catch (err) {
        console.error("Error fetching live store products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadLiveProducts();
  }, []);

  const triggerNfcTap = () => {
    setNfcTapped(true);
    setTimeout(() => setNfcTapped(false), 3000);
  };

  const handleQuickAdd = (product: ProductDetail) => {
    addItem(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2500);
  };

  const currentTheme = themes[activeThemeId] || themes["apple-dark"];
  const currentTemplate = cardTemplates[activeTemplateId] || cardTemplates["classic-segmented"];

  const filteredThemes = themeList.filter((th) => {
    if (selectedThemeCategory === "all") return true;
    if (selectedThemeCategory === "dark") return th.isDark;
    if (selectedThemeCategory === "light") return !th.isDark;
    return th.category === selectedThemeCategory;
  });

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
            <a href="#interactive-exhibit" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Live Card Engine</span>
            </a>
            <a href="#hardware-store" className="hover:text-white transition-colors flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span>NFC Hardware</span>
            </a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <Link href="/store" className="hover:text-white transition-colors font-semibold text-[#10b981] flex items-center gap-1">
              <span>Store</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/store" className="text-xs font-semibold text-[#10b981] px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 hover:bg-[#10b981]/20 transition">
              Store
            </Link>
            {userName ? (
              <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition active:scale-95 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#10b981] flex items-center justify-center text-[9px] font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
                <span>{userName.split(' ')[0]}</span>
              </Link>
            ) : (
              <>
                <Link href="/auth" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors hidden sm:block px-3 py-1.5">
                  Sign In
                </Link>
                <Link href="/auth" className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition active:scale-95 flex items-center gap-1.5">
                  <span>Get Free Card</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full pt-32 pb-32 space-y-36">
        
        {/* =========================================================================
            SECTION 1: IMMERSIVE HERO
            ========================================================================= */}
        <section className="max-w-6xl mx-auto px-6 pt-6 md:pt-16 flex flex-col items-center text-center relative">
          
          {/* Top Live Badge Removed */}

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

          {/* Social Proof Bar */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] w-full max-w-4xl grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center sm:justify-between gap-4 sm:gap-6 text-gray-400 text-[11px] sm:text-xs">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#10b981] shrink-0" />
              <span>100% No App Required</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8b5cf6] shrink-0" />
              <span>Instant Contact (.vcf) Sync</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Apple className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0ea5e9] shrink-0" />
              <span>Native Apple Wallet Passes</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span>Aerospace Laser Engraved Metal</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: REAL-TIME CARD ENGINE & AUTONOMOUS iPHONE SHOWCASE
            (Realistic Apple iPhone 16 Pro device with autonomous morphing animation)
            ========================================================================= */}
        <section id="interactive-exhibit" className="max-w-6xl mx-auto px-6">
          <div className="rounded-[44px] bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-white/[0.01] border border-white/[0.08] p-6 sm:p-14 shadow-2xl space-y-10 relative overflow-hidden">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Premium and Personalised Cards templates. <br/>
                <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                  Rendered Live on Device.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                Watch our dynamic theme engine morph seamlessly between executive minimal, modular bento, cyber holographic, and creative hero layouts.
              </p>
            </div>

            {/* REALISTIC TITANIUM iPHONE 16 PRO WITH CONTINUOUS AUTONOMOUS ANIMATION */}
            <IphoneCardShowcase />

          </div>
        </section>

        {/* =========================================================================
            SECTION 3: UPDATED HARDWARE SHOWCASE & STORE INTEGRATION
            (Using our real store products with direct action buttons)
            ========================================================================= */}
        <section id="hardware-store" className="max-w-6xl mx-auto px-6 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Pair your digital card with aerospace metal hardware.
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Handcrafted from solid 316L marine stainless steel, 24K gold plating, and organic bamboo. Tap any phone to transmit your credentials in seconds.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/store"
                className="px-6 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                <span>Visit Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Real Store Products Grid Showcase */}
          {isLoadingProducts ? (
            <div className="text-center text-gray-500 py-10">Loading products...</div>
          ) : storeProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No products available at the moment.</div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeProducts.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="bg-neutral-900/50 rounded-[32px] p-6 border border-white/[0.08] hover:border-white/20 shadow-xl flex flex-col justify-between group transition duration-300"
              >
                <div>
                  <Link href={`/store/product?id=${prod.id}`} className="block relative aspect-square rounded-2xl bg-black/40 overflow-hidden mb-5">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase border border-white/10">
                      {prod.category}
                    </div>
                    {prod.badge && (
                      <div className="absolute top-3 right-3 bg-amber-400 text-black px-2.5 py-1 rounded-full text-[10px] font-bold">
                        {prod.badge}
                      </div>
                    )}
                  </Link>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1">({prod.reviewsCount} reviews)</span>
                    </div>

                    <Link href={`/store/product?id=${prod.id}`}>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#0ea5e9] transition-colors line-clamp-1">
                        {prod.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                </div>

                {/* Pricing & Store Actions */}
                <div className="pt-4 border-t border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase font-semibold block">Price (Free UAE Delivery)</span>
                      <span className="text-lg font-bold text-white">AED {prod.price.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-green-400 font-mono">● In Stock (24h Ship)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/store/product?id=${prod.id}`}
                      className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white text-xs font-semibold text-center border border-white/10 transition flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </Link>

                    <button
                      onClick={() => handleQuickAdd(prod)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1 shadow-sm ${
                        addedProductId === prod.id
                          ? "bg-[#10b981] text-white"
                          : "bg-white text-black hover:bg-neutral-200"
                      }`}
                    >
                      {addedProductId === prod.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Quick Hardware Guarantees Bar */}
          <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-300">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              <span><strong>Free Fiber Laser Engraving</strong>: Customized name, title &amp; company logo vector.</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#38BDF8] shrink-0" />
              <span><strong>Same-Day UAE Dispatch</strong>: Courier tracking across Dubai, Abu Dhabi &amp; UAE.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0" />
              <span><strong>Lifetime Chip Warranty</strong>: Marine stainless &amp; 100% waterproof construction.</span>
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
            
            <div className="space-y-6 flex-1">
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
            SECTION: ABOUT US
            ========================================================================= */}
        <section id="about" className="max-w-6xl mx-auto px-6">
          <div className="rounded-[44px] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] p-10 md:p-16 shadow-xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#a78bfa] text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
                  About IZN
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                  Built for the future of <span className="bg-gradient-to-r from-[#8b5cf6] to-[#10b981] bg-clip-text text-transparent">human connection.</span>
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  IZN was born from a simple belief: the way professionals introduce themselves should be as dynamic and intelligent as the people behind the card. We're building the world's most sophisticated digital networking identity platform — where your card is never out of date, never runs out, and never fails to make a lasting impression.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Created by <span className="text-white font-semibold">ZYNIQ Studio</span>, a Dubai-based design & technology house specializing in smart branding ecosystems for executives, founders, and enterprise teams across the UAE and globally.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">10K+</div>
                    <div className="text-xs text-gray-500 mt-0.5">Smart Cards Created</div>
                  </div>
                  <div className="w-px bg-white/10 self-stretch" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">UAE</div>
                    <div className="text-xs text-gray-500 mt-0.5">Based & Operated</div>
                  </div>
                  <div className="w-px bg-white/10 self-stretch" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">24h</div>
                    <div className="text-xs text-gray-500 mt-0.5">UAE Delivery</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-full aspect-square rounded-[36px] bg-gradient-to-br from-[#8b5cf6]/20 via-[#10b981]/10 to-[#0ea5e9]/20 border border-white/[0.08] flex items-center justify-center shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.15),transparent_60%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.1),transparent_60%)]" />
                  <svg className="w-32 h-32 opacity-30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="14" strokeLinecap="round" />
                    <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="14" fill="#ffffff" />
                  </svg>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                    <p className="text-white font-bold text-sm">ZYNIQ Studio</p>
                    <p className="text-gray-400 text-xs">Dubai, UAE · Est. 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION: OUR FOUNDERS
            ========================================================================= */}
        <section id="founders" className="max-w-5xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#6ee7b7] text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Our Founders
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              The people behind IZN.
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              A team of creatives, technologists, and brand architects who believe in the power of first impressions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Ibrahim",
                role: "Founder & CEO",
                bio: "Visionary entrepreneur and brand architect. Ibrahim founded ZYNIQ Studio with a mission to redefine professional identity in the digital age.",
                initials: "IB",
                gradient: "from-[#8b5cf6] to-[#6d28d9]",
              },
              {
                name: "Zaki",
                role: "Founder & CCO",
                bio: "Product design leader with a passion for human-centered interfaces. Drives the visual language and UX across the IZN platform.",
                initials: "ZA",
                gradient: "from-[#10b981] to-[#047857]",
              },
              {
                name: "Nadjib",
                role: "Founder & CMO",
                bio: "Strategic marketing visionary who scales global adoption. Builds the growth engine that brings IZN to millions of professionals.",
                initials: "NA",
                gradient: "from-[#0ea5e9] to-[#0284c7]",
              },
            ].map((founder, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05] transition-all group space-y-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${founder.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform`}>
                  {founder.initials}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{founder.name}</h3>
                  <p className="text-xs font-semibold text-[#10b981] mt-0.5">{founder.role}</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{founder.bio}</p>
              </div>
            ))}
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
              Ready to own every place you enter.
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
            <Link href="/store" className="hover:text-white transition">Store</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/support" className="hover:text-white transition">Support &amp; Help</Link>
          </div>

          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} IZN Created by <a href="https://zyniq.studio" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white underline transition-colors">ZYNIQ Studio</a>. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Magic Demo Modal */}
      <MagicDemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      
    </div>
  );
}
