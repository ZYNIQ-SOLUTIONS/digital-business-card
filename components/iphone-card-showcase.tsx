'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  MapPin, 
  Check, 
  ChevronRight, 
  Share2, 
  Lock, 
  Wifi, 
  Battery, 
  Signal,
  Layers,
  Palette,
  Eye,
  SlidersHorizontal,
  Play,
  Pause
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AppleIcon, VerifiedBadgeIcon, LinkedInIcon, WhatsAppIcon, XIcon, GitHubIcon, InstagramIcon } from '@/components/icons';
import { themes, themeList, ThemeTokens } from '@/lib/theme';
import { cardTemplates, templateList, TemplateLayoutId } from '@/lib/templates';

// Curated sequence of stunning template + theme combinations for autonomous keynote playback
export const SHOWCASE_SEQUENCE: {
  templateId: TemplateLayoutId;
  themeId: string;
  badge: string;
  role: string;
  name: string;
  company: string;
  islandStatus: string;
}[] = [
  {
    templateId: 'classic-segmented',
    themeId: 'apple-dark',
    badge: 'Cupertino Classic',
    role: 'Founder & CEO',
    name: 'Ibrahim El Khalil',
    company: 'IZN Technologies • Dubai',
    islandStatus: '🍏 Apple Wallet Active',
  },
  {
    templateId: 'bento-grid',
    themeId: 'emerald-forest',
    badge: 'Modular Bento Grid',
    role: 'Managing Partner',
    name: 'Sarah Al Mansoori',
    company: 'Apex Capital Ventures',
    islandStatus: '⚡ 1-Tap NFC Connected',
  },
  {
    templateId: 'cyber-holo',
    themeId: 'neon-cyberpunk',
    badge: 'Cyber Holographic',
    role: 'Principal AI Architect',
    name: 'Alexandre Chen',
    company: 'NeuroSync Systems',
    islandStatus: '🛰️ Encrypted Pass Synced',
  },
  {
    templateId: 'executive-minimal',
    themeId: 'obsidian-gold',
    badge: 'Executive 24K Minimal',
    role: 'Managing Director',
    name: 'Sheikh Tariq Al Qasimi',
    company: 'Royal Gulf Holdings',
    islandStatus: '👑 VIP NFC Card Linked',
  },
  {
    templateId: 'creative-hero',
    themeId: 'matcha-cream',
    badge: 'Creative Hero Cover',
    role: 'Design Director',
    name: 'Elena Rostova',
    company: 'Studio Monochrome',
    islandStatus: '✨ Dynamic Portfolio Live',
  },
  {
    templateId: 'bento-grid',
    themeId: 'swiss-editorial',
    badge: 'Swiss Editorial Grid',
    role: 'Creative Technologist',
    name: 'David Vance',
    company: 'Helvetica Zurich',
    islandStatus: '📄 vCard Download Ready',
  },
  {
    templateId: 'cyber-holo',
    themeId: 'quantum-flux',
    badge: 'Quantum Flux Mesh',
    role: 'Crypto & Web3 Lead',
    name: 'Zane Montgomery',
    company: 'Solana Ecosystem',
    islandStatus: '🌐 Verified Domain Live',
  },
];

export function IphoneCardShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState('9:41');

  // Set real local time in iPhone status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formatted = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes}`;
      setCurrentTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Autonomous animation playback loop (cycles every 3.8 seconds with smooth morphing)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_SEQUENCE.length);
    }, 3800);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentItem = SHOWCASE_SEQUENCE[currentIndex];
  const currentTheme = themes[currentItem.themeId] || themes['apple-dark'];
  const currentTemplate = cardTemplates[currentItem.templateId] || cardTemplates['classic-segmented'];

  return (
    <div className="w-full flex flex-col items-center space-y-8 animate-fade-in select-none">
      
      {/* Live Autonomous Keynote Status Pill */}
      <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-full backdrop-blur-md shadow-lg">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-xs font-semibold text-gray-300">
          Live Template Engine Auto-Demo: <strong className="text-white">{currentTemplate.name}</strong> • <span className="text-amber-300 font-mono">{currentTheme.name}</span>
        </span>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="ml-2 text-gray-400 hover:text-white transition p-1"
          title={isPlaying ? "Pause Auto Demo" : "Play Auto Demo"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Progress Indicators Bar */}
      <div className="flex items-center justify-center gap-2">
        {SHOWCASE_SEQUENCE.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsPlaying(false);
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentIndex === idx
                ? 'w-10 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                : 'w-2.5 bg-white/20 hover:bg-white/40'
            }`}
            title={`${item.badge} (${item.themeId})`}
          />
        ))}
      </div>

      {/* REALISTIC TITANIUM APPLE iPHONE 16 PRO DEVICE FRAME */}
      <div className="relative mx-auto flex items-center justify-center">
        
        {/* Dynamic Ambient Glow Behind iPhone Chassis */}
        <div 
          className="absolute -inset-8 rounded-[80px] blur-3xl opacity-30 transition-all duration-1000 pointer-events-none"
          style={{ backgroundColor: currentTheme.previewAccent }}
        />

        {/* Outer Titanium Chassis */}
        <div className="relative w-[340px] sm:w-[375px] h-[680px] sm:h-[720px] rounded-[56px] p-[10px] bg-gradient-to-b from-[#3a3a3e] via-[#1f1f23] to-[#121215] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black/80 flex flex-col justify-between overflow-hidden">
          
          {/* Chassis Side Buttons Hardware Glare */}
          <div className="absolute -left-[3px] top-[115px] w-[3px] h-[26px] bg-[#55555d] rounded-l-xs" /> {/* Action Button */}
          <div className="absolute -left-[3px] top-[155px] w-[3px] h-[48px] bg-[#55555d] rounded-l-xs" /> {/* Volume Up */}
          <div className="absolute -left-[3px] top-[215px] w-[3px] h-[48px] bg-[#55555d] rounded-l-xs" /> {/* Volume Down */}
          <div className="absolute -right-[3px] top-[165px] w-[3px] h-[72px] bg-[#55555d] rounded-r-xs" /> {/* Power Button */}

          {/* Inner OLED Display Glass Screen */}
          <div className="relative w-full h-full rounded-[46px] bg-black overflow-hidden flex flex-col justify-between shadow-inner border border-black/40">
            
            {/* Top Apple Status Bar & Dynamic Island */}
            <div className="w-full pt-3 px-6 flex items-center justify-between z-30 select-none text-white text-[12px] font-semibold tracking-tight">
              {/* Clock */}
              <span className="font-mono text-[13px]">{currentTime}</span>

              {/* DYNAMIC ISLAND PILL */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 h-[28px] px-3.5 bg-black rounded-full border border-white/[0.08] shadow-md flex items-center gap-2 z-40 transition-all duration-300 hover:scale-105">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-gray-200 tracking-tight whitespace-nowrap">
                  {currentItem.islandStatus}
                </span>
                <div className="w-2 h-2 rounded-full bg-[#1c1c1e] border border-white/20" />
              </div>

              {/* Signal, WiFi, Battery */}
              <div className="flex items-center gap-1.5 text-white/90">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-0.5">
                  <div className="w-5 h-2.5 border border-white/80 rounded-sm p-[1px] flex items-center">
                    <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                  </div>
                  <div className="w-[1px] h-1 bg-white/80 rounded-r-xs" />
                </div>
              </div>
            </div>

            {/* SCREEN INNER CONTENT: LIVE RENDERING OF CARD ARCHITECTURE */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative z-10 transition-colors duration-700 flex flex-col justify-between" style={{ backgroundColor: currentTheme.previewBg }}>
              
              {/* Subtle Screen Reflection Highlight */}
              <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-bl from-white/[0.06] via-transparent to-transparent pointer-events-none" />

              {/* DYNAMIC CARD BODY ACCORDING TO ACTIVE TEMPLATE */}
              <div className={`w-full ${currentTheme.cardBg} border ${currentTheme.border} rounded-[28px] p-4 shadow-xl transition-all duration-700 relative overflow-hidden flex flex-col space-y-3.5 my-auto`}>
                
                {/* 1. CLASSIC SEGMENTED TEMPLATE */}
                {currentItem.templateId === 'classic-segmented' && (
                  <div className="flex flex-col items-center space-y-3 text-center animate-fade-in">
                    <div className={`w-16 h-16 rounded-2xl ${currentTheme.avatarBg} border-2 ${currentTheme.avatarBorder} shadow-md flex items-center justify-center relative`}>
                      <span className={`text-xl font-bold tracking-tighter ${currentTheme.textMain}`}>
                        {currentItem.name.split(' ').map(n => n[0]).join('')}
                      </span>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${currentTheme.accentBg} text-white flex items-center justify-center shadow-xs`}>
                        <Sparkles className="w-2.5 h-2.5 fill-white" />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-center gap-1">
                        <h3 className={`text-base font-bold tracking-tight ${currentTheme.textMain}`}>
                          {currentItem.name}
                        </h3>
                        <VerifiedBadgeIcon className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <p className={`text-xs font-semibold ${currentTheme.accent}`}>
                        {currentItem.role}
                      </p>
                      <p className={`text-[10px] ${currentTheme.textSecondary}`}>
                        {currentItem.company}
                      </p>
                    </div>

                    {/* Action Pills */}
                    <div className="w-full grid grid-cols-4 gap-1.5 pt-1">
                      {['Call', 'Email', 'Web', 'Meet'].map((action, i) => (
                        <div key={i} className={`flex flex-col items-center py-2 px-1 rounded-xl ${currentTheme.pillBg} border ${currentTheme.pillBorder} shadow-2xs`}>
                          {i === 0 && <Phone className={`w-3.5 h-3.5 ${currentTheme.accent} mb-0.5`} />}
                          {i === 1 && <Mail className={`w-3.5 h-3.5 ${currentTheme.accent} mb-0.5`} />}
                          {i === 2 && <Globe className={`w-3.5 h-3.5 ${currentTheme.accent} mb-0.5`} />}
                          {i === 3 && <Calendar className={`w-3.5 h-3.5 ${currentTheme.accent} mb-0.5`} />}
                          <span className={`text-[9px] font-bold ${currentTheme.textMain}`}>{action}</span>
                        </div>
                      ))}
                    </div>

                    {/* QR Code Container */}
                    <div className={`w-full ${currentTheme.qrContainerBg} rounded-2xl p-2.5 flex flex-col items-center border ${currentTheme.pillBorder}`}>
                      <div className="bg-white p-1.5 rounded-xl shadow-2xs">
                        <QRCodeSVG value="https://izncard.com" size={70} level="Q" className="w-16 h-16" />
                      </div>
                      <span className={`text-[9px] font-mono ${currentTheme.textSecondary} pt-1`}>
                        /ibrahim-el-khalil
                      </span>
                    </div>

                    {/* Apple Wallet CTA */}
                    <div className="w-full py-2.5 px-3 rounded-xl bg-black text-white text-[11px] font-bold flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <AppleIcon className="w-3.5 h-3.5 fill-white" />
                        <span>Add to Apple Wallet</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                {/* 2. BENTO GRID TEMPLATE */}
                {currentItem.templateId === 'bento-grid' && (
                  <div className="space-y-2.5 animate-fade-in text-left">
                    <div className={`p-3 rounded-2xl ${currentTheme.pillBg} border ${currentTheme.pillBorder} flex items-center gap-3`}>
                      <div className={`w-12 h-12 rounded-xl ${currentTheme.avatarBg} border ${currentTheme.avatarBorder} flex items-center justify-center font-bold text-base ${currentTheme.textMain} shrink-0`}>
                        {currentItem.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="truncate flex-1">
                        <span className={`block text-xs font-bold ${currentTheme.textMain} truncate`}>{currentItem.name}</span>
                        <span className={`block text-[10px] font-semibold ${currentTheme.accent} truncate`}>{currentItem.role}</span>
                        <span className={`block text-[9px] ${currentTheme.textSecondary} truncate`}>{currentItem.company}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2.5 rounded-xl ${currentTheme.pillBg} border ${currentTheme.pillBorder} text-center flex flex-col items-center justify-center`}>
                        <div className="bg-white p-1 rounded-lg shadow-2xs mb-1">
                          <QRCodeSVG value="https://izncard.com" size={50} level="Q" className="w-12 h-12" />
                        </div>
                        <span className={`text-[8px] font-mono ${currentTheme.textSecondary}`}>Instant Scan</span>
                      </div>
                      <div className={`p-2.5 rounded-xl ${currentTheme.pillBg} border ${currentTheme.pillBorder} flex flex-col justify-between`}>
                        <div>
                          <span className={`block text-[10px] font-bold ${currentTheme.textMain}`}>Bento Matrix</span>
                          <span className={`block text-[8px] ${currentTheme.textSecondary}`}>NFC Pass &amp; vCard</span>
                        </div>
                        <div className={`py-1.5 px-2 rounded-lg ${currentTheme.accentBg} text-white text-[9px] font-bold text-center`}>
                          Sync Pass
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {['Call', 'Email', 'Web', 'Meet'].map((action, i) => (
                        <div key={i} className={`p-1.5 rounded-lg ${currentTheme.pillBg} border ${currentTheme.pillBorder} text-center text-[9px] font-bold ${currentTheme.textMain}`}>
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. EXECUTIVE MINIMAL TEMPLATE */}
                {currentItem.templateId === 'executive-minimal' && (
                  <div className="space-y-3 text-left animate-fade-in">
                    <div className="border-b pb-2.5 border-black/10 dark:border-white/10 flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${currentTheme.avatarBg} border ${currentTheme.avatarBorder} flex items-center justify-center font-serif font-bold text-base ${currentTheme.textMain} shrink-0`}>
                        {currentItem.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold font-serif ${currentTheme.textMain}`}>{currentItem.name}</h4>
                        <span className={`text-[10px] uppercase font-semibold ${currentTheme.accent}`}>{currentItem.role}</span>
                        <span className={`block text-[9px] ${currentTheme.textSecondary}`}>{currentItem.company}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className={`p-2.5 rounded-xl ${currentTheme.pillBg} border ${currentTheme.pillBorder} text-[10px] font-bold ${currentTheme.textMain} flex items-center justify-between`}>
                        <span>Direct VIP Call</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className={`p-2.5 rounded-xl ${currentTheme.pillBg} border ${currentTheme.pillBorder} text-[10px] font-bold ${currentTheme.textMain} flex items-center justify-between`}>
                        <span>Executive Dispatch</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className={`p-2.5 rounded-xl ${currentTheme.pillBg} border ${currentTheme.pillBorder} text-[10px] font-bold ${currentTheme.textMain} flex items-center justify-between`}>
                        <span>Private Board Portal</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CYBER HOLO TEMPLATE */}
                {currentItem.templateId === 'cyber-holo' && (
                  <div className="space-y-2.5 text-left animate-fade-in font-mono">
                    <div className={`p-3 rounded-2xl bg-black/60 border ${currentTheme.pillBorder} flex items-center justify-between`}>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-[#38BDF8] block tracking-widest">[NFC_NODE_v4.2]</span>
                        <h4 className={`text-sm font-bold ${currentTheme.textMain}`}>{currentItem.name}</h4>
                        <span className={`text-[9px] ${currentTheme.accent}`}>{currentItem.role}</span>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-black border border-cyan-500/40 p-1 flex items-center justify-center">
                        <QRCodeSVG value="https://izncard.com" size={32} level="Q" className="w-8 h-8" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      <div className={`p-2 rounded-xl bg-black/50 border ${currentTheme.pillBorder} text-center`}>
                        <span className="text-gray-400 block text-[7px] uppercase">Telemetry</span>
                        <span className={`font-bold ${currentTheme.textMain}`}>LATENCY: 12ms</span>
                      </div>
                      <div className={`p-2 rounded-xl bg-black/50 border ${currentTheme.pillBorder} text-center`}>
                        <span className="text-gray-400 block text-[7px] uppercase">Encryption</span>
                        <span className="font-bold text-emerald-400">AES-256 GCM</span>
                      </div>
                    </div>

                    <div className={`py-2 px-3 rounded-xl ${currentTheme.accentBg} text-black font-bold text-xs text-center uppercase tracking-wider`}>
                      Execute Protocol (vCard)
                    </div>
                  </div>
                )}

                {/* 5. CREATIVE HERO TEMPLATE */}
                {currentItem.templateId === 'creative-hero' && (
                  <div className="space-y-2.5 animate-fade-in text-center">
                    <div className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 p-2 flex items-end justify-start relative">
                      <div className={`w-12 h-12 rounded-xl ${currentTheme.avatarBg} border-2 border-white shadow-lg flex items-center justify-center font-bold text-sm ${currentTheme.textMain} absolute -bottom-3 left-3`}>
                        {currentItem.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>

                    <div className="pt-2 text-left pl-1">
                      <h4 className={`text-sm font-bold ${currentTheme.textMain}`}>{currentItem.name}</h4>
                      <span className={`text-[10px] font-medium ${currentTheme.accent}`}>{currentItem.role}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {['Call', 'Email', 'Web', 'Meet'].map((act, i) => (
                        <div key={i} className={`py-1.5 rounded-lg ${currentTheme.pillBg} border ${currentTheme.pillBorder} text-[9px] font-bold ${currentTheme.textMain}`}>
                          {act}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Hardware Badge Inside Card */}
                <div className="pt-1 border-t border-black/[0.04] flex items-center justify-between text-[9px]">
                  <span className={`font-mono text-[8px] ${currentTheme.textSecondary}`}>
                    IZN NFC CARD ENGINE
                  </span>
                  <span className="text-emerald-500 font-bold text-[8px]">
                    ● ACTIVE
                  </span>
                </div>

              </div>

              {/* Bottom Apple Home Indicator Bar */}
              <div className="w-full flex justify-center pb-1 pt-2">
                <div className="w-32 h-1 bg-white/40 rounded-full" />
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Autonomous Keynote Caption */}
      <p className="text-center text-xs text-gray-500 max-w-lg">
        The card automatically morphs in real-time on physical NFC taps, adapting layout structures, contrast tokens, and wallet passes dynamically.
      </p>

    </div>
  );
}
