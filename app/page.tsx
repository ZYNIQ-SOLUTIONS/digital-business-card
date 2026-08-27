"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Smartphone, Zap, Shield, Bot, LayoutDashboard, Send } from "lucide-react";
import { MagicDemoModal } from "@/components/magic-demo-modal";

export default function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-indigo-500 selection:text-white font-sans overflow-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-600/20 blur-[140px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 group">
          <div className="logo-sync-container relative">
            <svg width="32" height="32" viewBox="0 0 200 200" className="logo-sync">
              <path className="half half-top" d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeLinecap="round"/>
              <path className="half half-bot" d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#ec4899" strokeWidth="12" strokeLinecap="round"/>
              <circle className="core-node" cx="100" cy="100" r="15" fill="#ffffff"/>
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-wide text-white">IZN</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#enterprise" className="hover:text-white transition">Enterprise</a>
          <a href="#about" className="hover:text-white transition">Our Story</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm font-medium text-neutral-300 hover:text-white transition hidden sm:block">
            Sign In
          </Link>
          <Link href="/auth" className="px-5 py-2.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-white font-semibold text-sm hover:bg-white/20 transition active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-32 space-y-32">
        
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-[5rem] font-bold tracking-tight leading-[1.05] font-display">
            The Last Business Card <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-sky-400">
              You Will Ever Need.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
            Instantly share your contact info, social links, and pitch decks right from your Apple or Samsung Wallet. No apps to download. No paper to print. Just tap, connect, and let AI do the rest.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-[15px] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Create Your IZN Card (Free)
            </Link>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#121216]/60 backdrop-blur-xl text-white font-bold text-[15px] hover:bg-white/10 active:scale-95 transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:border-violet-500/40"
            >
              <Smartphone className="w-5 h-5 text-violet-400" /> Watch the Magic
            </button>
          </div>
        </section>

        {/* BENTO GRID: HOW IT WORKS + FEATURES */}
        <section id="features" className="space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">An Intelligent Networking Pass.</h2>
            <p className="text-neutral-400 text-lg">Networking has never been this effortless.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[300px]">
            
            {/* Bento Box 1: Native Wallet */}
            <div className="md:col-span-2 md:row-span-1 rounded-[32px] p-8 md:p-12 relative overflow-hidden group bg-[#121216]/60 backdrop-blur-2xl border border-white/10 hover:border-violet-500/50 transition-colors shadow-2xl flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Smartphone className="w-10 h-10 text-violet-400 mb-6 relative z-10" />
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-semibold mb-3">Lives in Your Native Wallet</h3>
                <p className="text-neutral-400 leading-relaxed text-lg max-w-xl">Your IZN card lives natively in your Apple Wallet and Samsung Wallet. Double-click your side button, and you are ready to network in less than two seconds.</p>
              </div>
            </div>

            {/* Bento Box 2: Build Pass */}
            <div className="md:col-span-1 md:row-span-1 rounded-[32px] p-8 md:p-10 relative overflow-hidden group bg-[#121216]/60 backdrop-blur-2xl border border-white/10 hover:border-sky-500/50 transition-colors shadow-2xl flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-bl from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <LayoutDashboard className="w-10 h-10 text-sky-400 mb-6 relative z-10" />
              <div className="relative z-10">
                <h3 className="text-2xl font-display font-semibold mb-3">Build Your Pass</h3>
                <p className="text-neutral-400 text-sm">Customize your digital card in seconds and add it directly to your native smartphone wallet.</p>
              </div>
            </div>

            {/* Bento Box 3: AI Capture */}
            <div className="md:col-span-1 md:row-span-1 rounded-[32px] p-8 md:p-10 relative overflow-hidden group bg-[#121216]/60 backdrop-blur-2xl border border-white/10 hover:border-pink-500/50 transition-colors shadow-2xl flex flex-col justify-end">
               <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <Bot className="w-10 h-10 text-pink-400 mb-6 relative z-10" />
               <div className="relative z-10">
                 <h3 className="text-2xl font-display font-semibold mb-3">AI Paper Extraction</h3>
                 <p className="text-neutral-400 text-sm">They have a paper card? Snap a photo through your IZN profile. Our AI instantly extracts the info to your contacts.</p>
               </div>
            </div>

            {/* Bento Box 4: Contextual Modes */}
            <div className="md:col-span-1 md:row-span-1 rounded-[32px] p-8 md:p-10 relative overflow-hidden group bg-[#121216]/60 backdrop-blur-2xl border border-white/10 hover:border-emerald-500/50 transition-colors shadow-2xl flex flex-col justify-end">
               <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <Zap className="w-10 h-10 text-emerald-400 mb-6 relative z-10" />
               <div className="relative z-10">
                 <h3 className="text-2xl font-display font-semibold mb-3">Contextual Modes</h3>
                 <p className="text-neutral-400 text-sm">Switch to Work Mode to highlight LinkedIn. Toggle Social Mode for Instagram. Your pass adapts to you.</p>
               </div>
            </div>

            {/* Bento Box 5: AI Follow-ups */}
            <div className="md:col-span-1 md:row-span-1 rounded-[32px] p-8 md:p-10 relative overflow-hidden group bg-[#121216]/60 backdrop-blur-2xl border border-white/10 hover:border-indigo-500/50 transition-colors shadow-2xl flex flex-col justify-end">
               <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <Send className="w-10 h-10 text-indigo-400 mb-6 relative z-10" />
               <div className="relative z-10">
                 <h3 className="text-2xl font-display font-semibold mb-3">AI Follow-ups</h3>
                 <p className="text-neutral-400 text-sm">When you connect, our AI will automatically draft a personalized follow-up email. Just click &quot;Send&quot;.</p>
               </div>
            </div>

          </div>
        </section>

        {/* ENTERPRISE */}
        <section id="enterprise" className="py-20">
          <div className="bg-[#121216]/60 backdrop-blur-3xl rounded-[40px] p-10 md:p-16 border border-white/10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />
            <div className="flex-1 space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono uppercase tracking-widest text-emerald-400">
                <Shield className="w-4 h-4" />
                <span>IZN for Teams</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold">Built for Professionals.<br/>Scaled for Enterprise.</h2>
              <p className="text-lg text-neutral-300 leading-relaxed font-light">
                Say goodbye to printing thousands of paper cards every time you hire someone new. With the IZN Team Dashboard, HR managers can generate perfectly branded Apple Wallet passes for 10 or 10,000 employees in one click.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"/>
                  </div>
                  <span className="text-neutral-300"><strong>Instant Onboarding:</strong> Send wallet passes directly to new hires.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"/>
                  </div>
                  <span className="text-neutral-300"><strong>Instant Updates:</strong> Did someone get a promotion? Update their job title, and their wallet pass changes instantly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"/>
                  </div>
                  <span className="text-neutral-300"><strong>Secure Offboarding:</strong> Revoke access with a single click when an employee leaves.</span>
                </li>
              </ul>
              
              <div className="pt-6">
                <Link href="/auth" className="inline-flex px-8 py-4 rounded-full bg-white text-black font-bold text-[15px] hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                  Book a Team Demo
                </Link>
              </div>
            </div>
            
            <div className="flex-1 w-full relative z-10">
              <div className="relative bg-[#1A1A20]/80 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                   <h4 className="font-semibold font-display">IZN Team Directory</h4>
                   <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">10 Active</span>
                 </div>
                 <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 shadow-lg shadow-violet-500/20" />
                        <div>
                          <div className="h-4 w-32 bg-white/20 rounded mb-1.5" />
                          <div className="h-3 w-20 bg-white/10 rounded" />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT US */}
        <section id="about" className="text-center max-w-3xl mx-auto space-y-8 py-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold">The Power of Three. <br/>The Zen of Networking.</h2>
          <p className="text-lg text-neutral-400 leading-relaxed font-light">
            IZN isn&apos;t just a name; it’s our DNA. Founded by <strong className="text-white">Ibrahim, Zaki, and Nadjib</strong>, we built IZN to solve our own frustrations with modern networking.
          </p>
          <p className="text-lg text-neutral-400 leading-relaxed font-light">
            We realized that making a connection shouldn&apos;t feel like work. It should feel seamless, effortless, and peaceful. That&apos;s why IZN (pronounced Aizen) is designed to bring &quot;Zen&quot; to the way you meet people. We removed the friction, so you can focus on what actually matters: building relationships.
          </p>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden rounded-[40px] p-16 text-center border border-white/10 bg-[#121216]/60 backdrop-blur-3xl shadow-2xl">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-gradient-to-r from-violet-500/30 to-pink-500/30 blur-[120px] pointer-events-none" />
           <div className="relative z-10 space-y-8">
             <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight">Ready to Own the Room?</h2>
             <p className="text-xl text-neutral-400 max-w-xl mx-auto font-light">
               Join the future of networking today. Ditch the paper, upgrade your digital wallet, and never lose a lead again.
             </p>
             <div>
               <Link href="/auth" className="inline-flex px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                 Get Started for Free Today
               </Link>
               <p className="text-sm font-mono text-neutral-500 mt-6 tracking-widest uppercase">Takes less than 60 seconds to set up.</p>
             </div>
           </div>
        </section>
        
      </main>

      <footer className="w-full border-t border-white/10 py-10 text-center text-neutral-500 text-sm font-mono uppercase tracking-widest bg-black/20">
        <p>© {new Date().getFullYear()} IZN. The Zen of Networking. All rights reserved.</p>
      </footer>

      {/* Magic Demo Modal */}
      <MagicDemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
