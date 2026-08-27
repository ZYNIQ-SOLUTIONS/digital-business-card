"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Bot,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Wifi,
  ScanLine,
  Globe,
  Phone,
  Play,
  Pause
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { LinkedInIcon, InstagramIcon } from "@/components/icons";

interface MagicDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MagicDemoModal({ isOpen, onClose }: MagicDemoModalProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeMode, setActiveMode] = useState<"work" | "social">("work");
  const [scanState, setScanState] = useState<"scanning" | "extracted">("scanning");

  const steps = [
    {
      id: "wallet",
      title: "1. Native Wallet Pass",
      shortTitle: "Wallet Pass",
      icon: Smartphone,
      color: "from-violet-500 to-indigo-500",
      accent: "text-violet-400",
      bgAccent: "bg-violet-500/10 border-violet-500/30",
      description: "Double-click your phone's side button to summon your branded IZN pass in Apple Wallet or Samsung Wallet instantly. Ready to share in < 2 seconds.",
    },
    {
      id: "exchange",
      title: "2. Instant Contact Swap",
      shortTitle: "Tap & Swap",
      icon: Wifi,
      color: "from-sky-500 to-blue-600",
      accent: "text-sky-400",
      bgAccent: "bg-sky-500/10 border-sky-500/30",
      description: "Hold your phone near another device or present your live QR code. The recipient gets your full interactive card with zero apps required.",
    },
    {
      id: "ai-scanner",
      title: "3. AI Paper Extraction",
      shortTitle: "AI Scanner",
      icon: Bot,
      color: "from-pink-500 to-rose-500",
      accent: "text-pink-400",
      bgAccent: "bg-pink-500/10 border-pink-500/30",
      description: "They handed you an old-school paper card? Snap a picture through your IZN dashboard. Our AI extracts and saves every lead with 99.8% precision.",
    },
    {
      id: "modes",
      title: "4. Contextual Modes",
      shortTitle: "Smart Modes",
      icon: Layers,
      color: "from-emerald-500 to-teal-500",
      accent: "text-emerald-400",
      bgAccent: "bg-emerald-500/10 border-emerald-500/30",
      description: "Networking at a conference? Toggle Work Mode for LinkedIn & Calendly. At an afterparty? Flip to Social Mode for Instagram & Spotify.",
    },
  ];

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Auto-progress timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, steps.length]);

  // Animate step 3 AI scanner simulation
  useEffect(() => {
    if (activeStep === 2) {
      setScanState("scanning");
      const scanTimer = setTimeout(() => {
        setScanState("extracted");
      }, 2000);
      return () => clearTimeout(scanTimer);
    }
  }, [activeStep]);

  if (!isOpen) return null;

  const currentStep = steps[activeStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#0d0d12]/95 border border-white/15 rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden z-10 text-white animate-in zoom-in-95 fade-in duration-300">
        
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-r ${currentStep.color} opacity-20 blur-[90px] pointer-events-none transition-all duration-700`} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-wide text-white">Experience The IZN Magic</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/10 text-neutral-300 border border-white/10">
                  Interactive Demo
                </span>
              </div>
              <p className="text-xs text-neutral-400">See how easy next-generation networking really is</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause auto-play" : "Resume auto-play"}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Selector Tabs */}
        <div className="px-6 sm:px-8 py-3 bg-black/30 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(idx);
                  setIsPlaying(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white/15 text-white border border-white/20 shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? step.accent : "text-neutral-400"}`} />
                <span>{step.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[420px]">
          
          {/* Left Column: Interactive Simulation Stage */}
          <div className="md:col-span-7 flex justify-center items-center">
            <div className="w-full max-w-[340px] bg-[#14141b] rounded-[28px] border border-white/10 p-5 shadow-2xl relative overflow-hidden flex flex-col items-center">
              
              {/* Phone Top Notch / Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full mb-4 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neutral-800" />
              </div>

              {/* STEP 1: APPLE WALLET PASS SIMULATION */}
              {activeStep === 0 && (
                <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative rounded-2xl p-5 bg-gradient-to-br from-neutral-900 via-[#181822] to-black border border-white/15 shadow-xl text-white overflow-hidden">
                    {/* Glowing Pass Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold font-display">
                          IZN
                        </div>
                        <div>
                          <div className="text-[11px] font-bold tracking-tight">Ibrahim El Khalil</div>
                          <div className="text-[9px] text-neutral-400">Founder & AI Architect</div>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Apple Wallet
                      </div>
                    </div>

                    {/* QR Code Center */}
                    <div className="bg-white p-3 rounded-xl mx-auto w-fit shadow-lg my-3 flex flex-col items-center">
                      <QRCodeSVG value="https://d-b-c.netlify.app/ibrahim" size={100} />
                    </div>

                    {/* NFC Tap Wave Indicator */}
                    <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-300 pt-2 font-medium">
                      <Wifi className="w-4 h-4 text-violet-400 rotate-90 animate-pulse" />
                      <span>Hold Near Phone to Connect</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                      Double-click side button to open
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: INSTANT CONTACT SWAP SIMULATION */}
              {activeStep === 1 && (
                <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative rounded-2xl p-5 bg-gradient-to-b from-[#181a28] to-[#0f101a] border border-sky-500/30 shadow-xl text-center space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/20">
                      <Wifi className="w-6 h-6 animate-bounce" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">NFC Contact Beam</h4>
                      <p className="text-[11px] text-neutral-400">Connection established with iPhone 15 Pro</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Card Transferred:</span>
                        <span className="font-semibold text-white">Ibrahim El Khalil</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Saved to:</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> iOS Contacts (.vcf)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-neutral-400">
                    ⚡ No apps required for either person
                  </div>
                </div>
              )}

              {/* STEP 3: AI PAPER SCANNER SIMULATION */}
              {activeStep === 2 && (
                <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative rounded-2xl p-4 bg-gradient-to-b from-neutral-900 to-[#121218] border border-pink-500/30 shadow-xl text-left space-y-3">
                    
                    {/* Camera view simulation */}
                    <div className="relative rounded-xl overflow-hidden bg-neutral-950 p-4 border border-white/10 text-center">
                      <div className="absolute inset-0 bg-pink-500/10 pointer-events-none animate-pulse" />
                      <ScanLine className="w-8 h-8 text-pink-400 mx-auto mb-2 animate-bounce" />
                      <div className="text-[11px] font-mono text-neutral-300">
                        {scanState === "scanning" ? "AI Neural Scanning..." : "Extracted in 420ms!"}
                      </div>
                    </div>

                    {/* Extracted fields */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between p-1.5 rounded bg-white/5">
                        <span className="text-neutral-400">Name:</span>
                        <span className="font-medium text-white">Sarah Chen</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded bg-white/5">
                        <span className="text-neutral-400">Role:</span>
                        <span className="font-medium text-pink-300">VP of Engineering</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded bg-white/5">
                        <span className="text-neutral-400">Company:</span>
                        <span className="font-medium text-white">Apex Ventures</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-neutral-400">
                    🤖 Powered by Gemini Multimodal Vision
                  </div>
                </div>
              )}

              {/* STEP 4: CONTEXTUAL MODES SIMULATION */}
              {activeStep === 3 && (
                <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative rounded-2xl p-4 bg-gradient-to-b from-neutral-900 to-[#141816] border border-emerald-500/30 shadow-xl text-center space-y-3">
                    
                    {/* Mode Toggle Switch */}
                    <div className="flex bg-black/60 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setActiveMode("work")}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                          activeMode === "work"
                            ? "bg-violet-600 text-white shadow"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        💼 Work Mode
                      </button>
                      <button
                        onClick={() => setActiveMode("social")}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                          activeMode === "social"
                            ? "bg-emerald-600 text-white shadow"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        🎉 Social Mode
                      </button>
                    </div>

                    {/* Dynamic Links Display */}
                    <div className="space-y-2 text-left">
                      {activeMode === "work" ? (
                        <>
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                            <LinkedInIcon className="w-4 h-4 text-blue-400" />
                            <span>LinkedIn Profile (Featured)</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <span>Company Pitch Deck</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                            <InstagramIcon className="w-4 h-4 text-pink-400" />
                            <span>Instagram @ibrahim</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                            <Phone className="w-4 h-4 text-green-400" />
                            <span>WhatsApp Direct Chat</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-center text-xs text-neutral-400">
                    🎯 Pass updates in real-time on everyone&apos;s phone
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Step Explainer & Actions */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium ${currentStep.bgAccent} ${currentStep.accent}`}>
                <span>STEP 0{activeStep + 1} OF 04</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold leading-tight text-white">
                {currentStep.title}
              </h3>
              <p className="text-neutral-300 text-sm sm:text-[15px] leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
                  setIsPlaying(false);
                }}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 hover:text-white transition active:scale-95"
                title="Previous step"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveStep((prev) => (prev + 1) % steps.length);
                  setIsPlaying(false);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-98"
              >
                <span>Next Feature</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Final CTA in modal */}
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/auth"
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition shadow-lg shadow-white/10 active:scale-98"
              >
                <span>Create Your Free Pass Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>

        {/* Modal Footer Progress Indicator */}
        <div className="px-6 sm:px-8 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Zero installation • Works on 100% of iOS & Android phones</span>
          </div>
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeStep === idx ? "w-6 bg-white" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
