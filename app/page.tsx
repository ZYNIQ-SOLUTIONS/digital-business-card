"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  QrCode, 
  Share2, 
  CreditCard, 
  Zap, 
  CheckCircle2,
  ExternalLink,
  Layers,
  Globe
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans selection:bg-[#0071E3] selection:text-white">
      {/* Top Ambient Light Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-blue-100/60 via-purple-50/20 to-transparent pointer-events-none blur-3xl" />

      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0071E3] to-[#5856D6] p-0.5 shadow-xs flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#0071E3]" />
              </div>
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#1D1D1F]">
              CardStudio
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] transition"
            >
              Sign In
            </Link>

            <Link
              href="/auth"
              className="px-3.5 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white text-xs font-semibold shadow-xs transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 text-center space-y-8 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-xs">
          <span className="flex h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
          <span className="text-xs font-medium text-[#1D1D1F]">
            Universal Multi-User Digital Smart Cards
          </span>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D1D1F] leading-[1.1]">
            Your Identity. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071E3] via-[#5856D6] to-[#E4405F]">
              Reimagined with Apple Elegance.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#86868B] max-w-xl mx-auto leading-relaxed">
            Create high-contrast digital business cards with dynamic vCard QR codes, Apple Wallet passes, and physical NFC compatibility. Zero cost.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/auth"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-black hover:bg-neutral-900 active:scale-95 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition"
          >
            <span>Create Your Free Card</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/demo"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-neutral-50 active:scale-95 text-[#1D1D1F] text-sm font-semibold border border-black/[0.08] shadow-xs transition"
          >
            View Live Interactive Demo
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-12 text-left">
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1D1D1F]">Native vCard QR</h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Scanning your card with any smartphone camera prompts users directly to save your complete contact details into their address book.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#5856D6] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1D1D1F]">Apple Wallet Pass</h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Generate genuine `.pkpass` passes for Apple Wallet with a single tap, synchronizing to iPhone and Apple Watch for offline sharing.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-[#34C759] flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1D1D1F]">NFC &amp; PWA Ready</h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Program your link into physical NFC cards or tap Safari &quot;Add to Home Screen&quot; to carry an installable standalone app.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/[0.06] bg-white/60 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-[#86868B] space-y-1">
          <p>© 2026 CardStudio • Powered by Supabase &amp; Next.js</p>
          <p className="text-[11px] text-neutral-400">100% Free &amp; Open Architecture for Multi-User Digital Cards</p>
        </div>
      </footer>
    </main>
  );
}
