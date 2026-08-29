"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Smartphone, Zap, Shield, Bot, Send, ArrowRight, CheckCircle2, ChevronRight, Apple, QrCode, LayoutDashboard } from "lucide-react";
import { MagicDemoModal } from "@/components/magic-demo-modal";

export default function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-[#F5F5F7] selection:bg-[#8b5cf6]/30 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Background Radial Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8b5cf6]/8 blur-[130px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#0ea5e9]/8 blur-[130px]" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#050507]/85 backdrop-blur-md border-b border-white/[0.05] py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <svg id="logo-light" className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
              <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="14" strokeLinecap="round" />
              <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" />
              <circle cx="100" cy="100" r="14" fill="#ffffff" />
            </svg>
            <span className="font-display font-bold text-xl tracking-tight text-white">IZN</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a>
            <a href="#about" className="hover:text-white transition-colors">Our Story</a>
            <Link href="/store" className="hover:text-white transition-colors font-semibold text-[#10b981]">
              Store
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/store" className="md:hidden text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Store
            </Link>
            <Link href="/auth" className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/auth" className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full pt-32 pb-32">
        
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-6 pt-10 md:pt-20 pb-20 flex flex-col items-center text-center">
          
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tight leading-[1.02] text-white max-w-4xl">
            The last <span className="bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#0ea5e9] bg-clip-text text-transparent">business card</span> you will ever need.
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Instantly share your contact info, social links, and pitch decks right from your Apple or Samsung Wallet. No apps to download. Just tap and connect.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/auth" className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#10b981] text-white font-semibold text-[15px] hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(139,92,246,0.3)]">
              Create Your Free Card <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/[0.04] text-white font-medium text-[15px] hover:bg-white/[0.08] transition-colors border border-white/[0.08] flex items-center justify-center gap-2"
            >
              Watch the Magic
            </button>
          </div>
          
          {/* Social Proof */}
          <div className="mt-24 pt-10 border-t border-white/[0.05] w-full max-w-3xl">
            <p className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-6">Trusted by innovative teams</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-35 grayscale hover:grayscale-0 hover:opacity-70 transition-all duration-500">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white"><div className="w-5 h-5 rounded bg-white"></div> ACME</div>
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white"><div className="w-5 h-5 rounded-full border-2 border-white"></div> GLOBEX</div>
              <div className="flex items-center gap-2 font-bold text-xl italic text-white"><div className="w-5 h-5 rotate-45 bg-white"></div> SOYUZ</div>
              <div className="flex items-center gap-2 font-bold text-xl tracking-widest text-white"><div className="w-5 h-1 bg-white"></div> INITECH</div>
            </div>
          </div>
        </section>
        
        {/* HERO PRODUCT ASSET */}
        <div className="relative max-w-5xl mx-auto px-6 mt-10 mb-32 hidden md:block">
           <div className="absolute inset-0 bg-gradient-to-b from-[#8b5cf6]/10 to-transparent blur-3xl -z-10" />
           <div className="relative h-[600px] w-full rounded-3xl border border-white/[0.06] bg-neutral-900/30 backdrop-blur-md overflow-hidden shadow-2xl flex items-end justify-center">
             
             {/* Abstract representation of the phone/wallet pass */}
             <div className="relative w-[340px] h-[700px] bg-[#0c0c0e] text-white border-[8px] border-neutral-800 rounded-[3rem] shadow-2xl translate-y-24 group hover:-translate-y-8 transition-transform duration-700 ease-out">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-20">
                  <div className="w-32 h-5 bg-black rounded-b-xl"></div>
                </div>
                {/* Pass UI */}
                <div className="absolute top-14 inset-x-4 bottom-4 rounded-[2rem] bg-gradient-to-b from-neutral-900 to-black p-6 border border-white/[0.08] shadow-inner flex flex-col">
                  <div className="flex items-center justify-between mb-8 mt-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                        <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeLinecap="round" />
                        <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#10b981" strokeWidth="16" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="16" fill="#ffffff" />
                      </svg>
                      <span className="font-bold text-sm tracking-tight text-white">IZN</span>
                    </div>
                    <QrCode className="w-7 h-7 text-white/40" />
                  </div>
                  <div className="space-y-1 mb-8">
                    <div className="text-xl font-semibold text-white tracking-tight">Ibrahim Z.</div>
                    <div className="text-[#10b981] text-xs font-mono font-medium">Founder & CEO</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-11 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center px-4 gap-3">
                       <Smartphone className="w-4 h-4 text-[#8b5cf6]" />
                       <div className="h-1.5 w-24 bg-white/20 rounded"></div>
                    </div>
                    <div className="h-11 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center px-4 gap-3">
                       <Bot className="w-4 h-4 text-[#10b981]" />
                       <div className="h-1.5 w-32 bg-white/20 rounded"></div>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-center pb-2">
                    <div className="h-1 w-20 bg-white/20 rounded-full"></div>
                  </div>
                </div>
             </div>
           </div>
        </div>

        {/* FEATURES: Alternating Rows */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-24 space-y-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#8b5cf6]/10 text-[#8b5cf6] mb-2 border border-[#8b5cf6]/20">
                <Apple className="w-5 h-5" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">Lives in your native wallet.</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Your IZN card lives natively in your Apple Wallet and Samsung Wallet. Double-click your side button, and you are ready to network in less than two seconds. No apps for them to download.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" /> Works offline
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" /> Share via tap, QR, or link
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" /> Always up to date
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-neutral-900/20 rounded-3xl border border-white/[0.05] p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8b5cf6]/10 via-transparent to-transparent opacity-60" />
               {/* UI Mockup for Wallet */}
               <div className="relative w-64 h-80 bg-[#121214] rounded-2xl border border-white/[0.08] shadow-2xl p-6 flex flex-col gap-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#10b981] mb-4" />
                 <div className="h-4 w-3/4 bg-white/10 rounded-md" />
                 <div className="h-3 w-1/2 bg-gray-500 rounded-md mb-8" />
                 <div className="h-32 w-full bg-white/[0.02] rounded-xl border border-white/[0.06] flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-white/30" />
                 </div>
               </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9] mb-2 border border-[#0ea5e9]/20">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">AI paper extraction.</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                They handed you a paper card? Snap a photo through your IZN profile. Our AI instantly extracts the info, categorizes it, and syncs it to your contacts.
              </p>
              <div className="pt-4">
                <Link href="/auth" className="inline-flex items-center gap-2 text-[#0ea5e9] font-medium hover:text-[#0ea5e9]/80 transition-colors">
                  Try the scanner <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full bg-neutral-900/20 rounded-3xl border border-white/[0.05] p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
               {/* UI Mockup for Scanner */}
               <div className="relative w-72 bg-[#121214] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                 <div className="h-48 bg-white/[0.02] relative flex items-center justify-center">
                    <div className="absolute inset-4 border-2 border-[#0ea5e9]/40 rounded-lg"></div>
                    <div className="w-32 h-20 bg-neutral-800 rounded shadow-lg transform rotate-6 flex flex-col justify-center px-4 border border-white/[0.08]">
                      <div className="h-2 w-16 bg-neutral-600 rounded mb-2" />
                      <div className="h-1.5 w-20 bg-neutral-700 rounded" />
                    </div>
                    {/* Scanning line animation */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-[#0ea5e9] shadow-[0_0_12px_#0ea5e9] animate-[scan_2.5s_ease-in-out_infinite]" />
                 </div>
                 <div className="p-5 bg-black/60 space-y-3 border-t border-white/[0.05]">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-semibold text-white">Extracted Data</span>
                     <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded">100% Match</span>
                   </div>
                   <div className="h-8 bg-white/[0.02] rounded border border-white/[0.05] flex items-center px-3 text-xs text-gray-400">John Doe</div>
                   <div className="h-8 bg-white/[0.02] rounded border border-white/[0.05] flex items-center px-3 text-xs text-gray-400">john@example.com</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#10b981]/10 text-[#10b981] mb-2 border border-[#10b981]/20">
                <Send className="w-5 h-5" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">Contextual modes & follow-ups.</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Switch to Work Mode to highlight LinkedIn. Toggle Social Mode for Instagram. When you connect, our AI automatically drafts a personalized follow-up email.
              </p>
            </div>
            <div className="flex-1 w-full bg-neutral-900/20 rounded-3xl border border-white/[0.05] p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
               {/* UI Mockup for Modes */}
               <div className="flex flex-col gap-4 w-full max-w-sm">
                 <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05] flex items-center justify-between opacity-40 cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]"><Zap className="w-5 h-5" /></div>
                     <div>
                       <div className="text-sm font-medium text-white">Social Mode</div>
                       <div className="text-xs text-gray-500">Instagram, X, TikTok</div>
                     </div>
                   </div>
                   <div className="w-10 h-5 rounded-full bg-neutral-800"></div>
                 </div>
                 <div className="bg-white/[0.04] p-4 rounded-2xl border border-[#8b5cf6]/35 flex items-center justify-between shadow-[0_0_20px_rgba(139,92,246,0.1)] cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6]"><LayoutDashboard className="w-5 h-5" /></div>
                     <div>
                       <div className="text-sm font-medium text-white">Work Mode</div>
                       <div className="text-xs text-gray-400">LinkedIn, Portfolio, Email</div>
                     </div>
                   </div>
                   <div className="w-10 h-5 rounded-full bg-[#8b5cf6] flex justify-end items-center p-0.5">
                     <div className="w-4 h-4 bg-white rounded-full"></div>
                   </div>
                 </div>
                 
                 {/* Email drafting mockup */}
                 <div className="mt-2 bg-black/40 p-4 rounded-2xl border border-white/[0.05] space-y-3">
                   <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">AI Follow-up Draft</div>
                   <div className="h-1.5 w-full bg-white/10 rounded"></div>
                   <div className="h-1.5 w-5/6 bg-white/10 rounded"></div>
                   <div className="h-1.5 w-4/6 bg-white/10 rounded"></div>
                   <div className="flex justify-end pt-1">
                     <div className="h-7 w-16 bg-gradient-to-r from-[#8b5cf6] to-[#10b981] rounded-lg text-[10px] flex items-center justify-center text-white font-semibold shadow-md">Send</div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
        </section>

        {/* ENTERPRISE */}
        <section id="enterprise" className="max-w-6xl mx-auto px-6 py-24">
          <div className="bg-neutral-900/30 rounded-[2.5rem] p-10 md:p-16 border border-white/[0.06] flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0ea5e9]/5 via-transparent to-transparent opacity-60" />
            
            <div className="flex-1 space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0ea5e9]/20 bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-semibold">
                <Shield className="w-4 h-4" />
                <span>IZN for Teams</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight">
                Built for professionals.<br/>Scaled for enterprise.
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Stop printing thousands of paper cards. With the IZN Team Dashboard, HR can generate branded Apple Wallet passes for 10 or 10,000 employees in one click.
              </p>
              
              <div className="pt-2 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center shrink-0 border border-white/[0.08] text-[#0ea5e9] font-mono text-sm font-semibold">1</div>
                  <div>
                    <h4 className="text-white font-semibold">Instant Onboarding</h4>
                    <p className="text-gray-400 text-sm mt-1">Send wallet passes directly to new hires on day one.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center shrink-0 border border-white/[0.08] text-[#0ea5e9] font-mono text-sm font-semibold">2</div>
                  <div>
                    <h4 className="text-white font-semibold">Centralized Management</h4>
                    <p className="text-gray-400 text-sm mt-1">Update job titles globally, revoke access instantly.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Link href="/auth" className="inline-flex px-7 py-3.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#0ea5e9] text-white font-semibold text-[15px] hover:opacity-95 shadow-[0_10px_25px_rgba(16,185,129,0.2)]">
                  Book a Team Demo
                </Link>
              </div>
            </div>
            
            <div className="flex-1 w-full relative z-10">
              {/* Dashboard Mockup */}
              <div className="bg-[#121214] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
                 <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-4">
                   <h4 className="font-semibold text-white">Team Directory</h4>
                   <span className="text-[10px] font-mono bg-[#0ea5e9]/10 text-[#0ea5e9] px-2 py-0.5 rounded border border-[#0ea5e9]/20">Active: 1,248</span>
                 </div>
                 <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-850 border border-white/[0.08] flex items-center justify-center text-xs font-semibold text-white">{String.fromCharCode(64 + i)}</div>
                          <div>
                            <div className="h-3 w-28 bg-white/10 rounded mb-2" />
                            <div className="h-2 w-20 bg-white/5 rounded" />
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-[#10b981]">Active</div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR STORY */}
        <section id="about" className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="text-[#8b5cf6] font-mono font-semibold text-xs mb-4 uppercase tracking-widest">Our Story</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white mb-8">The Zen of Networking.</h2>
          <div className="space-y-6 text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            <p>
              IZN isn&apos;t just a name; it’s our DNA. Founded by <strong className="text-white">Ibrahim, Zaki, and Nadjib</strong>, we built IZN to solve our own frustrations with modern networking.
            </p>
            <p>
              We realized that making a connection shouldn&apos;t feel like work. It should feel seamless, effortless, and peaceful. That&apos;s why IZN (pronounced Aizen) is designed to bring &quot;Zen&quot; to the way you meet people. We removed the friction, so you can focus on what actually matters: building relationships.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
           <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6">Ready to own the room?</h2>
           <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
             Join the future of networking today. Ditch the paper, upgrade your digital wallet, and never lose a lead again.
           </p>
           <Link href="/auth" className="inline-flex px-8 py-4 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#0ea5e9] text-white font-semibold text-[15px] hover:opacity-95 shadow-[0_15px_30px_rgba(139,92,246,0.3)]">
             Get Started for Free Today
           </Link>
           <p className="text-xs text-gray-500 mt-6 font-mono">Takes less than 60 seconds to set up.</p>
        </section>
        
      </main>

      <footer className="w-full border-t border-white/[0.05] py-12 bg-[#050507]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <svg id="logo-light" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
              <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeLinecap="round" />
              <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#10b981" strokeWidth="16" strokeLinecap="round" />
              <circle cx="100" cy="100" r="16" fill="#ffffff" />
            </svg>
            <span className="font-bold text-white tracking-tight">IZN</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} IZN. All rights reserved.</p>
        </div>
      </footer>

      {/* Magic Demo Modal */}
      <MagicDemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: 100%; }
        }
      `}} />
    </div>
  );
}
