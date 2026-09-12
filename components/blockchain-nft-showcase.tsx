"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  Flame, 
  Award, 
  Check, 
  ArrowRight,
  Layers,
  Fingerprint
} from "lucide-react";
import { MagicDemoTrigger } from "./magic-demo-trigger";

export function BlockchainNftShowcase() {
  const [selectedTier, setSelectedTier] = useState<"Bronze" | "Silver" | "Gold" | "Diamond">("Gold");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const TIER_DATA = {
    Bronze: {
      score: 240,
      points: "0 – 299 pts",
      label: "Bronze Networker",
      color: "#cd7f32",
      badgeClass: "bg-[#cd7f32]/20 border-[#cd7f32]/40 text-[#f59e0b]",
      gradient: "from-[#cd7f32]/30 to-[#8b4513]/30",
      border: "border-[#cd7f32]/40",
      description: "Baseline verified digital profile with essential contact credentials.",
    },
    Silver: {
      score: 485,
      points: "300 – 599 pts",
      label: "Silver Networker",
      color: "#94a3b8",
      badgeClass: "bg-[#94a3b8]/20 border-[#94a3b8]/40 text-[#cbd5e1]",
      gradient: "from-[#94a3b8]/30 to-[#475569]/30",
      border: "border-[#94a3b8]/40",
      description: "Active networker with completed portfolio links and verified email & phone.",
    },
    Gold: {
      score: 785,
      points: "600 – 849 pts",
      label: "Gold Executive",
      color: "#f59e0b",
      badgeClass: "bg-[#f59e0b]/20 border-[#f59e0b]/40 text-amber-300",
      gradient: "from-[#f59e0b]/30 via-[#d97706]/20 to-transparent",
      border: "border-amber-400/40",
      description: "Executive-tier profile with AI biometric identity verification and 20+ saved connections.",
    },
    Diamond: {
      score: 960,
      points: "850 – 1,000 pts",
      label: "Diamond Elite",
      color: "#38bdf8",
      badgeClass: "bg-[#38bdf8]/20 border-[#38bdf8]/40 text-[#38bdf8]",
      gradient: "from-[#38bdf8]/30 via-[#818cf8]/20 to-[#c084fc]/30",
      border: "border-sky-400/50",
      description: "Top 1% industry connector. Verifiable high-volume business dealmaker.",
    },
  };

  const current = TIER_DATA[selectedTier];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <section id="blockchain-identity" className="w-full max-w-6xl mx-auto px-6 py-12">
      <div className="rounded-[40px] bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-white/[0.01] border border-white/[0.08] p-8 md:p-14 shadow-2xl relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8b5cf6]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#10b981]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* ── LEFT COLUMN: Feature Content ── */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 text-[#c084fc] text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Web3 &amp; On-Chain Reputation</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              The first digital business card minted on the{" "}
              <span className="bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#38bdf8] bg-clip-text text-transparent">
                blockchain.
              </span>
            </h2>

            <p className="text-sm md:text-base text-gray-400 leading-relaxed">
              Elevate your card from a simple link to an immutable, Soulbound ERC-721 digital asset on <strong>Base Sepolia</strong>. Your verified identity, networking achievements, and reputation score are provable on-chain forever.
            </p>

            {/* Feature Pillars */}
            <div className="grid sm:grid-cols-2 gap-3.5 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Fingerprint className="w-4 h-4 text-[#10b981]" />
                  <span>Soulbound Identity</span>
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Non-transferable ERC-721 token bound to your executive credentials, eliminating counterfeit business cards.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Score (0–1,000 pts)</span>
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Dynamic reputation engine that ranks your networking tier with every contact saved and profile verification.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Zap className="w-4 h-4 text-[#0ea5e9]" />
                  <span>1-Click Gasless Mint</span>
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Mint in seconds without owning cryptocurrency or paying gas fees. Or connect MetaMask for Web3 signing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Layers className="w-4 h-4 text-[#8b5cf6]" />
                  <span>Base Sepolia Verified</span>
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Every card receives a verifiable transaction hash and smart contract receipt viewable on BaseScan.
                </p>
              </div>
            </div>

            {/* Interactive Tier Selector */}
            <div className="pt-2 space-y-2.5">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                Select Rarity Tier to Preview NFT:
              </span>
              <div className="flex flex-wrap gap-2">
                {(["Bronze", "Silver", "Gold", "Diamond"] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      selectedTier === tier
                        ? "bg-white text-black font-bold shadow-md scale-105"
                        : "bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 border border-white/[0.08]"
                    }`}
                  >
                    <span>{tier}</span>
                    <span className="text-[10px] opacity-70">({TIER_DATA[tier].points})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/auth"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#0ea5e9] hover:brightness-110 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Mint Your Card on Base</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://sepolia.basescan.org/address/0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <span>View BaseScan Contract</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Interactive 3D Holographic NFT Card ── */}
          <div className="lg:col-span-5 flex justify-center">
            <div 
              className="relative w-full max-w-[340px] aspect-[1/1.55] rounded-3xl p-6 transition-transform duration-200 ease-out cursor-pointer select-none"
              style={{
                perspective: "1000px",
                transform: isHovered 
                  ? `rotateY(${mousePos.x * 24}deg) rotateX(${-mousePos.y * 24}deg) scale3d(1.03, 1.03, 1.03)`
                  : "rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)",
              }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                setMousePos({ x: 0, y: 0 });
              }}
            >
              {/* Holographic Sheen Layer */}
              <div 
                className={`absolute inset-0 rounded-3xl border ${current.border} shadow-2xl overflow-hidden bg-gradient-to-b from-[#14141e] via-[#0d0d16] to-[#07070b]`}
              >
                {/* Holographic Rainbow Light Sweep */}
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none transition-opacity duration-300"
                  style={{
                    background: isHovered
                      ? `radial-gradient(circle at ${(mousePos.x + 0.5) * 100}% ${(mousePos.y + 0.5) * 100}%, rgba(139,92,246,0.5), rgba(16,185,129,0.3) 40%, rgba(56,189,248,0.4) 70%, transparent 90%)`
                      : "linear-gradient(135deg, rgba(255,255,255,0.05), transparent)",
                  }}
                />

                {/* Shimmer line */}
                <div className="absolute -top-1/2 left-0 right-0 h-full bg-gradient-to-b from-white/15 to-transparent transform rotate-12 pointer-events-none" />

                {/* Card Interior */}
                <div className="relative h-full flex flex-col justify-between p-2">
                  
                  {/* Top Bar: Network & Soulbound Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                      <span>Base Sepolia</span>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono ${current.badgeClass}`}>
                      ★ {current.label}
                    </div>
                  </div>

                  {/* Center Identity Section */}
                  <div className="space-y-3 text-center my-auto">
                    <div className="relative w-20 h-20 mx-auto">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                        alt="Profile"
                        className="w-full h-full rounded-2xl object-cover border-2 border-white/20 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-md">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        Ibrahim El Khalil
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">
                        Chief Executive Officer • ZYNIQ
                      </p>
                    </div>

                    {/* Networking Score Display */}
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400 font-mono uppercase tracking-wider text-[10px]">
                          Networking Score
                        </span>
                        <span className="font-extrabold text-white font-mono">
                          {current.score} / 1,000
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#38bdf8]"
                          style={{ width: `${(current.score / 1000) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Chip & On-Chain Proof */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-gray-500 uppercase block">Token ID</span>
                      <span className="text-white font-bold">IZN-BASE-84532</span>
                    </div>

                    <div className="w-8 h-6 rounded-md border border-amber-400/40 bg-amber-400/10 flex items-center justify-center text-amber-300 text-[9px] font-bold">
                      NFC
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default BlockchainNftShowcase;
