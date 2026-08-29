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
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-600/30 selection:text-gray-900 font-sans antialiased overflow-x-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <svg id="logo-light" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
              <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
              <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
              <circle cx="100" cy="100" r="12" fill="#0f172a" />
            </svg>
            <span className="font-semibold text-lg tracking-tight text-gray-900 hidden sm:block">IZN</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#enterprise" className="hover:text-gray-900 transition-colors">Enterprise</a>
            <a href="#about" className="hover:text-gray-900 transition-colors">Our Story</a>
            <Link href="/store" className="hover:text-gray-900 transition-colors flex items-center gap-1.5 font-semibold text-neutral-900">
              Store
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/store" className="md:hidden text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Store
            </Link>
            <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/auth" className="px-4 py-2 rounded-full bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full pt-32 pb-32">
        
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-6 pt-10 md:pt-20 pb-20 flex flex-col items-center text-center">
          
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-bold tracking-tighter leading-[1.05] text-gray-900 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            The last business card you will ever need.
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Instantly share your contact info, social links, and pitch decks right from your Apple or Samsung Wallet. No apps to download. Just tap and connect.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/auth" className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gray-900 text-white font-medium text-[15px] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xl">
              Create Your Free Card <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-gray-900 font-medium text-[15px] hover:bg-gray-100 transition-colors border border-neutral-800 flex items-center justify-center gap-2"
            >
              Watch the Magic
            </button>
          </div>
          
          {/* Social Proof */}
          <div className="mt-20 pt-10 border-t border-gray-100 w-full max-w-3xl animate-in fade-in duration-1000 delay-500">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-6">Trusted by innovative teams</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tighter"><div className="w-6 h-6 rounded bg-white"></div> ACME</div>
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight"><div className="w-6 h-6 rounded-full border-2 border-white"></div> GLOBEX</div>
              <div className="flex items-center gap-2 font-bold text-xl italic"><div className="w-6 h-6 rotate-45 bg-white"></div> SOYUZ</div>
              <div className="flex items-center gap-2 font-bold text-xl tracking-widest"><div className="w-6 h-1 bg-white"></div> INITECH</div>
            </div>
          </div>
        </section>
        
        {/* HERO PRODUCT ASSET */}
        <div className="relative max-w-5xl mx-auto px-6 mt-10 mb-32 hidden md:block">
           <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent blur-3xl -z-10" />
           <div className="relative h-[600px] w-full rounded-3xl border border-gray-200 bg-gray-50 overflow-hidden shadow-2xl shadow-blue-600/10 flex items-end justify-center">
             
             {/* Abstract representation of the phone/wallet pass */}
             <div className="relative w-[340px] h-[700px] bg-gray-900 text-white border-[8px] border-neutral-800 rounded-[3rem] shadow-2xl translate-y-24 group hover:-translate-y-8 transition-transform duration-700 ease-out">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-7 flex justify-center">
                  <div className="w-32 h-6 bg-gray-100 rounded-b-xl"></div>
                </div>
                {/* Pass UI */}
                <div className="absolute top-20 inset-x-4 bottom-4 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900 p-6 border border-gray-200 shadow-inner flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-gray-900 font-bold text-xs">IZN</div>
                    <QrCode className="w-8 h-8 text-gray-900/50" />
                  </div>
                  <div className="space-y-2 mb-8">
                    <div className="text-2xl font-semibold text-gray-900 tracking-tight">Ibrahim Z.</div>
                    <div className="text-gray-500 text-sm">Founder & CEO</div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center px-4 gap-3">
                       <Smartphone className="w-5 h-5 text-blue-600" />
                       <div className="h-2 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center px-4 gap-3">
                       <Bot className="w-5 h-5 text-blue-600" />
                       <div className="h-2 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-center pb-4">
                    <div className="h-1 w-24 bg-gray-200 rounded-full"></div>
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
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-2">
                <Apple className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Lives in your native wallet.</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Your IZN card lives natively in your Apple Wallet and Samsung Wallet. Double-click your side button, and you are ready to network in less than two seconds. No apps for them to download.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" /> Works offline
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" /> Share via tap, QR, or link
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" /> Always up to date
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-white rounded-3xl border border-gray-200 p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent opacity-50" />
               {/* UI Mockup for Wallet */}
               <div className="relative w-64 h-80 bg-gray-100 rounded-2xl border border-gray-200 shadow-2xl p-6 flex flex-col gap-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-600 mb-4" />
                 <div className="h-6 w-3/4 bg-white/90 rounded-md" />
                 <div className="h-4 w-1/2 bg-gray-500 rounded-md mb-8" />
                 <div className="h-32 w-full bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-900/40" />
                 </div>
               </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-2">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">AI paper extraction.</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                They handed you a paper card? Snap a photo through your IZN profile. Our AI instantly extracts the info, categorizes it, and syncs it to your contacts.
              </p>
              <div className="pt-4">
                <Link href="/auth" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                  Try the scanner <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full bg-white rounded-3xl border border-gray-200 p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
               {/* UI Mockup for Scanner */}
               <div className="relative w-72 bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                 <div className="h-48 bg-gray-100 relative flex items-center justify-center">
                    <div className="absolute inset-4 border-2 border-blue-600/50 rounded-lg"></div>
                    <div className="w-32 h-20 bg-white rounded shadow-lg transform rotate-6 flex flex-col justify-center px-4">
                      <div className="h-2 w-16 bg-neutral-300 rounded mb-2" />
                      <div className="h-1 w-20 bg-neutral-200 rounded" />
                    </div>
                    {/* Scanning line animation */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 shadow-[0_0_10px_#8b5cf6] animate-[scan_2s_ease-in-out_infinite]" />
                 </div>
                 <div className="p-5 bg-white space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-900">Extracted Data</span>
                     <span className="text-xs text-blue-600 bg-violet-400/10 px-2 py-1 rounded">100% Match</span>
                   </div>
                   <div className="h-8 bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-500">John Doe</div>
                   <div className="h-8 bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-500">john@example.com</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-2">
                <Send className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Contextual modes & follow-ups.</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Switch to Work Mode to highlight LinkedIn. Toggle Social Mode for Instagram. When you connect, our AI automatically drafts a personalized follow-up email.
              </p>
            </div>
            <div className="flex-1 w-full bg-white rounded-3xl border border-gray-200 p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
               {/* UI Mockup for Modes */}
               <div className="flex flex-col gap-4 w-full max-w-sm">
                 <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200 flex items-center justify-between opacity-50 cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Zap className="w-5 h-5" /></div>
                     <div>
                       <div className="text-sm font-medium text-gray-900">Social Mode</div>
                       <div className="text-xs text-gray-400">Instagram, X, TikTok</div>
                     </div>
                   </div>
                   <div className="w-12 h-6 rounded-full bg-neutral-700"></div>
                 </div>
                 <div className="bg-gray-100 p-4 rounded-2xl border border-blue-600/30 flex items-center justify-between shadow-[0_0_15px_rgba(139,92,246,0.1)] cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><LayoutDashboard className="w-5 h-5" /></div>
                     <div>
                       <div className="text-sm font-medium text-gray-900">Work Mode</div>
                       <div className="text-xs text-gray-500">LinkedIn, Portfolio, Email</div>
                     </div>
                   </div>
                   <div className="w-12 h-6 rounded-full bg-blue-600 flex justify-end items-center p-1">
                     <div className="w-4 h-4 bg-white rounded-full"></div>
                   </div>
                 </div>
                 
                 {/* Email drafting mockup */}
                 <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                   <div className="text-xs font-mono text-gray-400 uppercase">AI Follow-up Draft</div>
                   <div className="h-2 w-full bg-gray-100 rounded"></div>
                   <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                   <div className="h-2 w-4/6 bg-gray-100 rounded"></div>
                   <div className="flex justify-end pt-2">
                     <div className="h-6 w-16 bg-blue-600 rounded text-[10px] flex items-center justify-center text-gray-900 font-medium">Send</div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
        </section>

        {/* ENTERPRISE */}
        <section id="enterprise" className="max-w-6xl mx-auto px-6 py-24">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-gray-200 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent opacity-50" />
            
            <div className="flex-1 space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-xs font-medium text-blue-700">
                <Shield className="w-4 h-4" />
                <span>IZN for Teams</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                Built for professionals.<br/>Scaled for enterprise.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Stop printing thousands of paper cards. With the IZN Team Dashboard, HR can generate branded Apple Wallet passes for 10 or 10,000 employees in one click.
              </p>
              
              <div className="pt-4 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200 text-gray-900 font-mono text-sm">1</div>
                  <div>
                    <h4 className="text-gray-900 font-medium">Instant Onboarding</h4>
                    <p className="text-gray-400 text-sm mt-1">Send wallet passes directly to new hires on day one.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200 text-gray-900 font-mono text-sm">2</div>
                  <div>
                    <h4 className="text-gray-900 font-medium">Centralized Management</h4>
                    <p className="text-gray-400 text-sm mt-1">Update job titles globally, revoke access instantly.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <Link href="/auth" className="inline-flex px-6 py-3.5 rounded-full bg-gray-900 text-white font-medium text-[15px] hover:bg-gray-800 transition-colors">
                  Book a Team Demo
                </Link>
              </div>
            </div>
            
            <div className="flex-1 w-full relative z-10">
              {/* Dashboard Mockup */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-2xl">
                 <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                   <h4 className="font-medium text-gray-900">Team Directory</h4>
                   <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200">Active: 1,248</span>
                 </div>
                 <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-900">{String.fromCharCode(64 + i)}</div>
                          <div>
                            <div className="h-4 w-32 bg-gray-200 rounded mb-1.5" />
                            <div className="h-3 w-20 bg-gray-100 rounded" />
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">Active</div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR STORY */}
        <section id="about" className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="text-blue-600 font-medium text-sm mb-4 uppercase tracking-widest">Our Story</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-8">The Zen of Networking.</h2>
          <div className="space-y-6 text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            <p>
              IZN isn&apos;t just a name; it’s our DNA. Founded by <strong className="text-gray-900">Ibrahim, Zaki, and Nadjib</strong>, we built IZN to solve our own frustrations with modern networking.
            </p>
            <p>
              We realized that making a connection shouldn&apos;t feel like work. It should feel seamless, effortless, and peaceful. That&apos;s why IZN (pronounced Aizen) is designed to bring &quot;Zen&quot; to the way you meet people. We removed the friction, so you can focus on what actually matters: building relationships.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">Ready to own the room?</h2>
           <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
             Join the future of networking today. Ditch the paper, upgrade your digital wallet, and never lose a lead again.
           </p>
           <Link href="/auth" className="inline-flex px-8 py-4 rounded-full bg-gray-900 text-white font-medium text-[15px] hover:bg-gray-800 transition-colors shadow-xl">
             Get Started for Free Today
           </Link>
           <p className="text-sm text-gray-400 mt-6">Takes less than 60 seconds to set up.</p>
        </section>
        
      </main>

      <footer className="w-full border-t border-gray-200 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg id="logo-light" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
              <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
              <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
              <circle cx="100" cy="100" r="12" fill="#0f172a" />
            </svg>
            <span className="font-semibold text-gray-900">IZN</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-gray-900 transition-colors">Support</Link>
          </div>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} IZN. All rights reserved.</p>
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
