import Link from "next/link";
import { ArrowRight, Smartphone, Sparkles, Zap, QrCode, Shield, Bot, LayoutDashboard, Send } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500 selection:text-white font-sans overflow-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[120px]" />
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
          <span className="font-display font-bold text-xl tracking-wide text-white">SyncSphere</span>
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
          <Link href="/auth" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-32 space-y-32">
        
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-neutral-200">SyncSphere (Sync Sphere) — The Zen of Networking.</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            The Last Business Card <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
              You Will Ever Need.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Instantly share your contact info, social links, and pitch decks right from your Apple or Samsung Wallet. No apps to download. No paper to print. Just tap, connect, and let AI do the rest.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-[15px] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Create Your SyncSphere Card (Free)
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 text-white font-bold text-[15px] hover:bg-white/20 active:scale-95 transition-all border border-white/10 flex items-center justify-center gap-2">
              <Smartphone className="w-5 h-5" /> Watch the Magic
            </button>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-16 py-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Networking has never been this effortless.</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Step 1: Build Your Pass</h3>
              <p className="text-neutral-400 leading-relaxed">Customize your digital card in seconds and add it directly to your native smartphone wallet.</p>
            </div>
            
            <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Step 2: Tap or Scan</h3>
              <p className="text-neutral-400 leading-relaxed">Meet someone new? Just hold your phone near theirs or let them scan your QR code. They don’t need an app to receive it.</p>
            </div>
            
            <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Step 3: Capture Everything</h3>
              <p className="text-neutral-400 leading-relaxed">They save your info instantly, and our AI helps you capture theirs. Connection made.</p>
            </div>
          </div>
        </section>

        {/* CORE FEATURES */}
        <section id="features" className="space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold">Beyond a Business Card. <br/>An Intelligent Networking Pass.</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-10 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 group hover:border-indigo-500/50 transition-colors">
              <Smartphone className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Lives in Your Native Wallet</h3>
              <p className="text-neutral-400 leading-relaxed text-lg">Why open a clunky app? Your SyncSphere card lives natively in your Apple Wallet and Samsung Wallet. Double-click your side button, and you are ready to network in less than two seconds.</p>
            </div>

            <div className="p-10 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 group hover:border-purple-500/50 transition-colors">
              <QrCode className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">They Have a Paper Card? We Have AI.</h3>
              <p className="text-neutral-400 leading-relaxed text-lg">Bridging the gap between the past and the future. If the person you meet hands you a paper business card, simply snap a photo of it through your SyncSphere profile. Our AI instantly extracts their name, email, and company, saving it directly to your contacts. No typing required.</p>
            </div>

            <div className="p-10 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 group hover:border-emerald-500/50 transition-colors">
              <LayoutDashboard className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Contextual "Modes" for Every Scenario</h3>
              <p className="text-neutral-400 leading-relaxed text-lg">At a tech conference? Switch to Work Mode to highlight your LinkedIn and Calendly. At a casual meetup? Toggle Social Mode to share your Instagram. Your Apple Wallet pass updates dynamically based on where you are.</p>
            </div>

            <div className="p-10 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 group hover:border-blue-500/50 transition-colors">
              <Send className="w-10 h-10 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">AI-Powered Follow-Ups</h3>
              <p className="text-neutral-400 leading-relaxed text-lg">People collect contacts and never talk to them again. Not with SyncSphere. When you connect, we log the time and location. Later, our AI will automatically draft a personalized follow-up email for you. Just click "Send" and watch your network grow.</p>
            </div>
          </div>
        </section>

        {/* ENTERPRISE */}
        <section id="enterprise" className="py-20">
          <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-black rounded-[40px] p-10 md:p-16 border border-white/10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>SyncSphere for Teams</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">Built for Professionals. Scaled for Enterprise.</h2>
              <p className="text-lg text-neutral-300 leading-relaxed">
                Say goodbye to printing thousands of paper cards every time you hire someone new. With the SyncSphere Team Dashboard, HR managers can generate perfectly branded Apple Wallet passes for 10 or 10,000 employees in one click.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"/>
                  </div>
                  <span className="text-neutral-300"><strong>Instant Onboarding:</strong> Send wallet passes directly to new hires.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"/>
                  </div>
                  <span className="text-neutral-300"><strong>Instant Updates:</strong> Did someone get a promotion? Update their job title, and their wallet pass changes instantly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"/>
                  </div>
                  <span className="text-neutral-300"><strong>Secure Offboarding:</strong> Revoke access with a single click when an employee leaves.</span>
                </li>
              </ul>
              
              <div className="pt-6">
                <Link href="/auth" className="inline-flex px-8 py-4 rounded-full bg-indigo-500 text-white font-bold text-[15px] hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30">
                  Book a Team Demo
                </Link>
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-[80px]" />
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                   <h4 className="font-semibold">SyncSphere Team Directory</h4>
                   <span className="text-xs bg-white/10 px-2 py-1 rounded">10 Active</span>
                 </div>
                 <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                        <div>
                          <div className="h-4 w-32 bg-white/20 rounded mb-1" />
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
          <h2 className="text-3xl md:text-5xl font-bold">The Power of Three. <br/>The Zen of Networking.</h2>
          <p className="text-lg text-neutral-400 leading-relaxed">
            SyncSphere isn’t just a name; it’s our DNA. Founded by <strong className="text-white">Ibrahim, Zaki, and Nadjib</strong>, we built SyncSphere to solve our own frustrations with modern networking.
          </p>
          <p className="text-lg text-neutral-400 leading-relaxed">
            We realized that making a connection shouldn't feel like work. It should feel seamless, effortless, and peaceful. That’s why SyncSphere (pronounced Aizen) is designed to bring "Zen" to the way you meet people. We removed the friction, so you can focus on what actually matters: building relationships.
          </p>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden rounded-[40px] p-16 text-center border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-indigo-500/20 blur-[100px] pointer-events-none" />
           <div className="relative z-10 space-y-8">
             <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to Own the Room?</h2>
             <p className="text-xl text-neutral-400 max-w-xl mx-auto">
               Join the future of networking today. Ditch the paper, upgrade your digital wallet, and never lose a lead again.
             </p>
             <div>
               <Link href="/auth" className="inline-flex px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                 Get Started for Free Today
               </Link>
               <p className="text-sm text-neutral-500 mt-4">Takes less than 60 seconds to set up.</p>
             </div>
           </div>
        </section>
        
      </main>

      <footer className="w-full border-t border-white/10 py-10 text-center text-neutral-500 text-sm">
        <p>© {new Date().getFullYear()} SyncSphere. The Zen of Networking. All rights reserved.</p>
      </footer>
    </div>
  );
}
