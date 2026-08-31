'use client';

import React, { useState } from 'react';
import { ThemeTokens } from '@/lib/theme';
import { TemplateLayoutId } from '@/lib/templates';
import { 
  Phone, Mail, Globe, MapPin, Share2, 
  Download, QrCode, Sparkles, Check, 
  ExternalLink, Calendar, MessageSquare, 
  Shield, Layers, Terminal, Zap, Heart
} from 'lucide-react';

interface ThemePreviewSimulatorProps {
  tokens: ThemeTokens;
  layoutStyle?: TemplateLayoutId;
  sections?: string[];
  activeTab?: 'card' | 'about' | 'contact' | 'nfc';
  onTabChange?: (tab: 'card' | 'about' | 'contact' | 'nfc') => void;
  scale?: number;
}

export function ThemePreviewSimulator({
  tokens,
  layoutStyle = 'classic-segmented',
  sections = ['hero', 'actions', 'contact', 'socials', 'nfc'],
  activeTab: controlledTab,
  onTabChange,
  scale = 1
}: ThemePreviewSimulatorProps) {
  const [internalTab, setInternalTab] = useState<'card' | 'about' | 'contact' | 'nfc'>('card');
  const activeTab = controlledTab || internalTab;
  const setTab = onTabChange || setInternalTab;

  const [copied, setCopied] = useState(false);

  const t = tokens;

  // Sample card profile for realistic visual preview
  const sampleCard = {
    name: 'Ibrahim El Khalil',
    title: 'Founder & Design Architect',
    company: 'ZYNIQ Studio Dubai',
    bio: 'Pioneering next-gen luxury NFC hardware, spatial identity systems & bespoke agentic interfaces across the MENA region.',
    phone: '+971 50 123 4567',
    email: 'ibrahim@zyniq.ae',
    website: 'https://zyniq.ae',
    location: 'DIFC Gate Tower, Dubai, UAE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    socials: [
      { name: 'Instagram', handle: '@zyniq.dxb' },
      { name: 'LinkedIn', handle: 'ibrahim-zyniq' },
      { name: 'X / Twitter', handle: '@ibrahim_zyniq' },
      { name: 'WhatsApp', handle: '+971501234567' }
    ]
  };

  return (
    <div className="w-full flex justify-center items-center select-none">
      {/* Phone Frame */}
      <div 
        className="w-[340px] sm:w-[370px] min-h-[660px] max-h-[760px] rounded-[42px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[6px] border-[#1e1e2d] bg-[#000000] relative overflow-hidden flex flex-col"
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}
      >
        {/* Dynamic Island / Speaker notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3 border border-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Screen Content Wrapper with Theme Background */}
        <div 
          className={`w-full h-full flex-1 rounded-[32px] overflow-y-auto no-scrollbar relative flex flex-col p-4 transition-all duration-300 ${t.bg} ${t.fontFamily || 'font-sans'}`}
          style={{
            backgroundImage: t.gradient ? undefined : undefined,
          }}
        >
          {/* Top Status Bar Simulator */}
          <div className="flex items-center justify-between text-[11px] font-semibold pt-1 pb-3 px-2 opacity-60">
            <span className={t.isDark ? 'text-white' : 'text-neutral-900'}>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${t.isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>5G</span>
              <div className={`w-4 h-2.5 rounded-xs border ${t.isDark ? 'border-white bg-white/80' : 'border-black bg-black/80'}`} />
            </div>
          </div>

          {/* Main Content Card Container */}
          <div className={`flex-1 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${t.cardBg}`}>
            
            {/* Header / Avatar Banner Section */}
            <div className={`p-4 text-center relative overflow-hidden flex flex-col items-center ${t.headerBg}`}>
              {/* Verification & Live NFC Pulse */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${t.isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  NFC
                </span>
              </div>

              {/* Avatar Photo */}
              <div className="relative mt-2 mb-3">
                <div className={`w-20 h-20 rounded-full overflow-hidden border-2 shadow-lg transition-transform hover:scale-105 ${t.avatarBorder} ${t.avatarBg}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={sampleCard.avatarUrl} 
                    alt={sampleCard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <Shield className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>

              {/* Identity Details */}
              <h2 className={`text-lg font-black tracking-tight ${t.textMain}`}>
                {sampleCard.name}
              </h2>
              <p className={`text-xs font-semibold mt-0.5 ${t.textSecondary}`}>
                {sampleCard.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[11px] font-medium ${t.textMuted}`}>
                  {sampleCard.company}
                </span>
                <span className={`w-1 h-1 rounded-full ${t.isDark ? 'bg-white/30' : 'bg-black/30'}`} />
                <span className={`text-[11px] font-medium flex items-center gap-0.5 ${t.accent}`}>
                  <MapPin className="w-3 h-3" /> Dubai
                </span>
              </div>
            </div>

            {/* Segmented Navigation Tabs */}
            <div className={`px-3 py-2 ${t.tabBg}`}>
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5">
                {[
                  { id: 'card', label: 'Card' },
                  { id: 'about', label: 'Bio' },
                  { id: 'contact', label: 'Info' },
                  { id: 'nfc', label: 'Share' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTab(tab.id as any)}
                      className={`py-1.5 text-[11px] rounded-lg font-bold transition-all text-center ${
                        isActive
                          ? `${t.tabActiveBg} ${t.tabActiveText}`
                          : `${t.tabInactiveText}`
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Body View */}
            <div className="p-3.5 space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {activeTab === 'card' && (
                <div className="space-y-3 animate-fadeIn">
                  {/* Quick Action Matrix Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      className={`p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all shadow-xs ${t.pillBg} ${t.pillBorder} ${t.pillHover}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.iconCircleBg} ${t.iconCircleColor}`}>
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${t.textMuted}`}>Call</div>
                        <div className={`text-xs font-bold truncate ${t.textMain}`}>Direct Mobile</div>
                      </div>
                    </button>

                    <button 
                      className={`p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all shadow-xs ${t.pillBg} ${t.pillBorder} ${t.pillHover}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.iconCircleBg} ${t.iconCircleColor}`}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${t.textMuted}`}>Email</div>
                        <div className={`text-xs font-bold truncate ${t.textMain}`}>Work Inbox</div>
                      </div>
                    </button>
                  </div>

                  {/* Primary Save Contact CTA */}
                  <button 
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${t.accentBg} ${t.accentHover}`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Save Contact (.VCF)</span>
                  </button>

                  {/* Social Profile Grid */}
                  <div className="pt-1">
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${t.textMuted}`}>
                      Social & Channels
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {sampleCard.socials.map((soc) => (
                        <div 
                          key={soc.name}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between ${t.pillBg} ${t.pillBorder}`}
                        >
                          <span className={`font-semibold text-[11px] ${t.textMain}`}>{soc.name}</span>
                          <ExternalLink className={`w-3 h-3 ${t.textMuted}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className={`p-3 rounded-xl ${t.pillBg} ${t.pillBorder}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                      Executive Bio
                    </div>
                    <p className={`text-xs leading-relaxed ${t.textSecondary}`}>
                      {sampleCard.bio}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl flex items-center justify-between ${t.pillBg} ${t.pillBorder}`}>
                    <div className="flex items-center gap-2.5">
                      <Calendar className={`w-4 h-4 ${t.accent}`} />
                      <div>
                        <div className={`text-xs font-bold ${t.textMain}`}>Book a Consultation</div>
                        <div className={`text-[10px] ${t.textMuted}`}>Direct Calendar Sync</div>
                      </div>
                    </div>
                    <button className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${t.accentBg}`}>
                      Schedule
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-2 animate-fadeIn text-xs">
                  <div className={`p-2.5 rounded-xl flex items-center gap-3 ${t.pillBg} ${t.pillBorder}`}>
                    <Phone className={`w-4 h-4 ${t.accent}`} />
                    <span className={`font-mono font-medium ${t.textMain}`}>{sampleCard.phone}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl flex items-center gap-3 ${t.pillBg} ${t.pillBorder}`}>
                    <Mail className={`w-4 h-4 ${t.accent}`} />
                    <span className={`font-medium truncate ${t.textMain}`}>{sampleCard.email}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl flex items-center gap-3 ${t.pillBg} ${t.pillBorder}`}>
                    <Globe className={`w-4 h-4 ${t.accent}`} />
                    <span className={`font-medium truncate ${t.textMain}`}>{sampleCard.website}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl flex items-center gap-3 ${t.pillBg} ${t.pillBorder}`}>
                    <MapPin className={`w-4 h-4 ${t.accent}`} />
                    <span className={`font-medium ${t.textSecondary}`}>{sampleCard.location}</span>
                  </div>
                </div>
              )}

              {activeTab === 'nfc' && (
                <div className="space-y-3 animate-fadeIn text-center py-2">
                  <div className={`inline-block p-3 rounded-2xl ${t.qrContainerBg} shadow-md`}>
                    <QrCode className="w-24 h-24 text-neutral-900 mx-auto" />
                  </div>
                  <p className={`text-[11px] font-semibold ${t.textSecondary}`}>
                    Scan with camera or tap via NFC to exchange contact
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${t.pillBg} ${t.pillBorder} ${t.textMain}`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer Watermark */}
            <div className={`px-4 py-2 text-center text-[10px] font-medium border-t flex items-center justify-center gap-1 ${t.divider} ${t.textMuted}`}>
              <Sparkles className="w-3 h-3 text-[#8b5cf6]" />
              <span>Powered by <strong>IZN</strong> ZYNIQ Studio</span>
            </div>
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="w-32 h-1 bg-white/30 rounded-full mx-auto my-2" />
      </div>
    </div>
  );
}
