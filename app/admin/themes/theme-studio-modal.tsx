'use client';

import React, { useState, useEffect } from 'react';
import { ThemeTokens, THEME_STARTER_PRESETS } from '@/lib/theme';
import { TemplateLayoutId, cardTemplates } from '@/lib/templates';
import { ThemePreviewSimulator } from '@/components/admin/theme-preview-simulator';
import { 
  X, Check, Save, Copy, Upload, Download, 
  Sparkles, Code, Layout, Palette, RefreshCw, 
  Eye, GripVertical, ChevronUp, ChevronDown, 
  Sliders, Globe, Lock, Shield, Layers, Plus, 
  Trash2, FileCode, CheckCircle2, AlertCircle, 
  Sparkle, Box, Smartphone
} from 'lucide-react';

interface ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTheme?: ThemeTokens | null;
  onSaveTheme: (theme: ThemeTokens, layoutConfig: any, isPublished: boolean) => Promise<void>;
}

const DEFAULT_SECTIONS = [
  { id: 'hero', name: 'Identity & Hero Avatar', icon: '👤', description: 'Avatar, Full Name, Title, Company & Status' },
  { id: 'actions', name: 'Quick Action Pills', icon: '⚡', description: 'Save VCF, Call, Email & Direct Connect' },
  { id: 'contact', name: 'Contact Information', icon: '📞', description: 'Phone, Work Email, Address & Website' },
  { id: 'socials', name: 'Social Profile Grid', icon: '🌐', description: 'LinkedIn, Instagram, X, WhatsApp & links' },
  { id: 'services', name: 'Services & Products', icon: '💼', description: 'Service catalog & featured offerings' },
  { id: 'bookings', name: 'Schedule / Calendar Booking', icon: '📅', description: 'Direct booking & meeting scheduler' },
  { id: 'wallet_nfc', name: 'Apple / Google Wallet & NFC', icon: '💳', description: 'PassKit streaming & QR code badge' },
];

export function ThemeStudioModal({
  isOpen,
  onClose,
  initialTheme,
  onSaveTheme
}: ThemeStudioModalProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'sections' | 'code' | 'presets'>('visual');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [themeId, setThemeId] = useState('');
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [category, setCategory] = useState<'dark' | 'light' | 'luxury' | 'cyber' | 'editorial' | 'creative' | 'custom'>('creative');
  const [isDark, setIsDark] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [layoutStyle, setLayoutStyle] = useState<TemplateLayoutId>('classic-segmented');
  const [sections, setSections] = useState<string[]>(['hero', 'actions', 'contact', 'socials', 'wallet_nfc']);
  const [customCss, setCustomCss] = useState('');

  // Tokens State
  const [tokens, setTokens] = useState<ThemeTokens>({
    id: 'custom-theme-1',
    name: 'New Custom Theme',
    description: 'Bespoke custom crafted theme',
    isDark: true,
    category: 'creative',
    bg: 'bg-[#0f172a]',
    textMain: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-500',
    cardBg: 'bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl',
    headerBg: 'bg-slate-900/95 border-b border-slate-800',
    pillBg: 'bg-slate-800',
    pillHover: 'hover:bg-slate-700',
    pillBorder: 'border-slate-700',
    border: 'border-slate-800',
    accent: 'text-purple-400',
    accentBg: 'bg-purple-600',
    accentHover: 'hover:bg-purple-700',
    tabBg: 'bg-slate-950',
    tabActiveBg: 'bg-slate-800 text-white',
    tabActiveText: 'text-purple-400 font-bold',
    tabInactiveText: 'text-slate-400 hover:text-white',
    iconCircleBg: 'bg-slate-800',
    iconCircleColor: 'text-purple-400',
    qrContainerBg: 'bg-slate-950',
    gradient: 'from-purple-900/30 via-slate-900/10 to-transparent',
    avatarBg: 'bg-slate-800',
    avatarBorder: 'border-purple-500/50',
    divider: 'bg-slate-800',
    previewBg: '#0f172a',
    previewAccent: '#8b5cf6',
    previewSecondary: '#334155',
  });

  // Raw JSON String state for code editor
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Initialize or reset when modal opens / initialTheme changes
  useEffect(() => {
    if (initialTheme) {
      setThemeId(initialTheme.id);
      setThemeName(initialTheme.name);
      setThemeDescription(initialTheme.description || '');
      setCategory(initialTheme.category || 'creative');
      setIsDark(initialTheme.isDark);
      setIsPublished(initialTheme.isPublished ?? true);
      setTokens({ ...initialTheme });
      setRawJson(JSON.stringify(initialTheme, null, 2));
    } else {
      const generatedId = `theme-${Date.now().toString(36)}`;
      setThemeId(generatedId);
      setThemeName('Midnight Luminary');
      setThemeDescription('Sleek dark gradient glass with luminous electric violet highlights');
      setCategory('creative');
      setIsDark(true);
      setIsPublished(true);
      const defaultTok: ThemeTokens = {
        id: generatedId,
        name: 'Midnight Luminary',
        description: 'Sleek dark gradient glass with luminous electric violet highlights',
        isDark: true,
        category: 'creative',
        bg: 'bg-[#090A15]',
        textMain: 'text-white font-semibold',
        textSecondary: 'text-[#C4B5FD]',
        textMuted: 'text-[#8B5CF6]',
        cardBg: 'bg-[#121324]/90 backdrop-blur-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.15)]',
        headerBg: 'bg-[#121324]/95 border-b border-purple-500/20',
        pillBg: 'bg-[#1E1F3B]',
        pillHover: 'hover:bg-[#2D2E55] hover:border-purple-400/50',
        pillBorder: 'border-purple-500/30',
        border: 'border-purple-500/30',
        accent: 'text-[#A855F7]',
        accentBg: 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] shadow-[0_0_20px_rgba(139,92,246,0.4)]',
        accentHover: 'hover:brightness-110',
        tabBg: 'bg-[#090A15]',
        tabActiveBg: 'bg-[#1E1F3B] border border-purple-500/40 text-white',
        tabActiveText: 'text-[#A855F7] font-bold',
        tabInactiveText: 'text-[#C4B5FD]/70 hover:text-white',
        iconCircleBg: 'bg-[#1E1F3B] border border-purple-500/30',
        iconCircleColor: 'text-[#A855F7]',
        qrContainerBg: 'bg-[#090A15] border border-purple-500/30',
        gradient: 'from-purple-900/30 via-indigo-950/20 to-transparent',
        avatarBg: 'bg-gradient-to-b from-[#1E1F3B] to-[#090A15]',
        avatarBorder: 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
        divider: 'bg-purple-500/20',
        previewBg: '#090A15',
        previewAccent: '#A855F7',
        previewSecondary: '#EC4899',
      };
      setTokens(defaultTok);
      setRawJson(JSON.stringify(defaultTok, null, 2));
    }
  }, [initialTheme, isOpen]);

  // Sync token changes to JSON editor
  const updateToken = (key: keyof ThemeTokens, value: any) => {
    const updated = { ...tokens, [key]: value };
    setTokens(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  };

  // Sync code editor changes to tokens
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawJson(val);
    try {
      const parsed = JSON.parse(val);
      setTokens(parsed);
      setJsonError(null);
      if (parsed.name) setThemeName(parsed.name);
      if (parsed.id) setThemeId(parsed.id);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.isDark !== undefined) setIsDark(parsed.isDark);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  // Apply Skill Preset
  const applyPreset = (preset: typeof THEME_STARTER_PRESETS[0]) => {
    const newTokens: ThemeTokens = {
      ...tokens,
      ...preset.template,
      name: `${preset.name} (Custom)`,
      id: `theme-${preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36).slice(-4)}`,
    };
    setThemeName(newTokens.name);
    setThemeId(newTokens.id);
    if (newTokens.category) setCategory(newTokens.category);
    if (newTokens.isDark !== undefined) setIsDark(newTokens.isDark);
    setTokens(newTokens);
    setRawJson(JSON.stringify(newTokens, null, 2));
  };

  // Reorder sections (Move up / down)
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const newSections = [...sections];
    const item = newSections.splice(index, 1)[0];
    newSections.splice(targetIndex, 0, item);
    setSections(newSections);
  };

  // Toggle Section visibility
  const toggleSection = (id: string) => {
    if (sections.includes(id)) {
      if (sections.length <= 1) return; // Keep at least one
      setSections(sections.filter(s => s !== id));
    } else {
      setSections([...sections, id]);
    }
  };

  // Save handler
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);

      const finalTheme: ThemeTokens = {
        ...tokens,
        id: themeId || `theme-${Date.now().toString(36)}`,
        name: themeName || 'Untitled Theme',
        description: themeDescription || '',
        category,
        isDark,
        isPublished,
      };

      const layoutConfig = {
        style: layoutStyle,
        sections,
        customCss
      };

      await onSaveTheme(finalTheme, layoutConfig, isPublished);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save theme');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJson);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xl overflow-hidden animate-fadeIn">
      <div className="w-full max-w-7xl h-[94vh] bg-[#0c0c16] border border-white/[0.08] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-white">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#111122]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#0ea5e9] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {initialTheme ? `Edit Theme: ${themeName}` : 'Theme Studio & Visual Builder'}
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30">
                  WYSIWYG + Code
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Design custom card themes with live token pickers, drag & drop section layouts, and full JSON code control.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] text-white font-bold text-xs shadow-lg hover:brightness-110 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saveSuccess ? (
                <><Check className="w-4 h-4 text-white" /> Published & Saved!</>
              ) : isSaving ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save & Publish Theme</>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Panel: Tabs & Editors (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-white/[0.08] bg-[#0c0c16] overflow-hidden">
            
            {/* Studio Navigation Bar */}
            <div className="px-6 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-2">
                {[
                  { id: 'visual', label: 'Visual Designer', icon: Sliders },
                  { id: 'sections', label: 'Layout & Sections', icon: Layout },
                  { id: 'code', label: 'Code & JSON', icon: Code },
                  { id: 'presets', label: 'Design Skill Kits', icon: Sparkles },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isActive
                          ? 'bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/40 shadow-xs'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-white/20 text-[#8b5cf6] focus:ring-[#8b5cf6] bg-black/40"
                  />
                  <span>Published to Users</span>
                </label>
              </div>
            </div>

            {/* Tab 1: Visual Token Designer */}
            {activeTab === 'visual' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                
                {/* Basic Details Box */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#8b5cf6]" />
                    Theme Meta & Identity
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">Theme Name</label>
                      <input
                        type="text"
                        value={themeName}
                        onChange={(e) => {
                          setThemeName(e.target.value);
                          updateToken('name', e.target.value);
                        }}
                        placeholder="e.g. Dubai Gold VIP"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#8b5cf6] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">Theme ID</label>
                      <input
                        type="text"
                        value={themeId}
                        onChange={(e) => {
                          setThemeId(e.target.value);
                          updateToken('id', e.target.value);
                        }}
                        placeholder="e.g. dubai-gold-vip"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:border-[#8b5cf6] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Description</label>
                    <input
                      type="text"
                      value={themeDescription}
                      onChange={(e) => {
                        setThemeDescription(e.target.value);
                        updateToken('description', e.target.value);
                      }}
                      placeholder="Brief description of the visual atmosphere"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#8b5cf6] focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => {
                          const cat = e.target.value as any;
                          setCategory(cat);
                          updateToken('category', cat);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-[#8b5cf6] focus:outline-hidden"
                      >
                        <option value="creative">Creative</option>
                        <option value="luxury">Luxury</option>
                        <option value="cyber">Cyber / Tech</option>
                        <option value="editorial">Editorial</option>
                        <option value="dark">Dark OLED</option>
                        <option value="light">Light Frost</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">Mode</label>
                      <div className="flex rounded-xl bg-black/40 border border-white/10 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDark(false);
                            updateToken('isDark', false);
                          }}
                          className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                            !isDark ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Light
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDark(true);
                            updateToken('isDark', true);
                          }}
                          className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                            isDark ? 'bg-[#8b5cf6] text-white shadow-xs' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Dark
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Swatch & Preview Tokens */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-[#0ea5e9]" />
                    Palette Swatches & Hex Colors
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                      <label className="text-[11px] font-semibold text-gray-400 block">Preview Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens.previewBg || '#0f172a'}
                          onChange={(e) => updateToken('previewBg', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={tokens.previewBg || '#0f172a'}
                          onChange={(e) => updateToken('previewBg', e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-black/50 border border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                      <label className="text-[11px] font-semibold text-gray-400 block">Preview Primary Accent</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens.previewAccent || '#8b5cf6'}
                          onChange={(e) => updateToken('previewAccent', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={tokens.previewAccent || '#8b5cf6'}
                          onChange={(e) => updateToken('previewAccent', e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-black/50 border border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                      <label className="text-[11px] font-semibold text-gray-400 block">Preview Secondary</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens.previewSecondary || '#334155'}
                          onChange={(e) => updateToken('previewSecondary', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={tokens.previewSecondary || '#334155'}
                          onChange={(e) => updateToken('previewSecondary', e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-black/50 border border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CSS Token Fields Builder */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-pink-400" />
                    Tailwind & CSS Tokens Mapping
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-gray-400 block mb-1">Canvas Background (`bg`)</label>
                      <input
                        type="text"
                        value={tokens.bg}
                        onChange={(e) => updateToken('bg', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Card Container (`cardBg`)</label>
                        <input
                          type="text"
                          value={tokens.cardBg}
                          onChange={(e) => updateToken('cardBg', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Header Banner (`headerBg`)</label>
                        <input
                          type="text"
                          value={tokens.headerBg}
                          onChange={(e) => updateToken('headerBg', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Text Main (`textMain`)</label>
                        <input
                          type="text"
                          value={tokens.textMain}
                          onChange={(e) => updateToken('textMain', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Text Secondary (`textSecondary`)</label>
                        <input
                          type="text"
                          value={tokens.textSecondary}
                          onChange={(e) => updateToken('textSecondary', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Text Muted (`textMuted`)</label>
                        <input
                          type="text"
                          value={tokens.textMuted}
                          onChange={(e) => updateToken('textMuted', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Accent Text (`accent`)</label>
                        <input
                          type="text"
                          value={tokens.accent}
                          onChange={(e) => updateToken('accent', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Accent CTA (`accentBg`)</label>
                        <input
                          type="text"
                          value={tokens.accentBg}
                          onChange={(e) => updateToken('accentBg', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Accent Hover (`accentHover`)</label>
                        <input
                          type="text"
                          value={tokens.accentHover}
                          onChange={(e) => updateToken('accentHover', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Pill Background (`pillBg`)</label>
                        <input
                          type="text"
                          value={tokens.pillBg}
                          onChange={(e) => updateToken('pillBg', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Pill Hover (`pillHover`)</label>
                        <input
                          type="text"
                          value={tokens.pillHover}
                          onChange={(e) => updateToken('pillHover', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-gray-400 block mb-1">Pill Border (`pillBorder`)</label>
                        <input
                          type="text"
                          value={tokens.pillBorder}
                          onChange={(e) => updateToken('pillBorder', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Drag & Drop Section Builder */}
            {activeTab === 'sections' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                
                {/* Layout Style Preset Picker */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5 text-[#8b5cf6]" />
                    Card Layout Template Style
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.values(cardTemplates).map((tpl) => {
                      const isSelected = layoutStyle === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setLayoutStyle(tpl.id)}
                          className={`p-3 rounded-2xl text-left border transition-all ${
                            isSelected
                              ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                              : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{tpl.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#a78bfa] shrink-0" />}
                          </div>
                          <span className="text-[10px] text-gray-500 line-clamp-2 mt-1">{tpl.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Drag and Drop / Reorder Section Pods */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-[#0ea5e9]" />
                        Card Section Order & Hierarchy
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Reorder sections with the arrow controls or toggle components on/off.
                      </p>
                    </div>
                  </div>

                  {/* Active Reorderable List */}
                  <div className="space-y-2 pt-2">
                    {sections.map((secId, index) => {
                      const def = DEFAULT_SECTIONS.find(s => s.id === secId) || { id: secId, name: secId, icon: '📦', description: '' };
                      return (
                        <div
                          key={secId}
                          className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between group hover:border-[#8b5cf6]/40 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{def.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{def.name}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-gray-400">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-500">{def.description}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300"
                              title="Move Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === sections.length - 1}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300"
                              title="Move Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSection(secId)}
                              className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ml-1"
                              title="Hide Section"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Available Inactive Sections */}
                  {DEFAULT_SECTIONS.some(s => !sections.includes(s.id)) && (
                    <div className="pt-3 border-t border-white/[0.06]">
                      <div className="text-[11px] font-bold text-gray-400 mb-2">Available Optional Sections</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {DEFAULT_SECTIONS.filter(s => !sections.includes(s.id)).map((sec) => (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => toggleSection(sec.id)}
                            className="p-2.5 rounded-xl bg-white/[0.02] border border-dashed border-white/10 hover:border-[#8b5cf6]/50 flex items-center justify-between text-left transition"
                          >
                            <div className="flex items-center gap-2">
                              <span>{sec.icon}</span>
                              <span className="text-xs font-semibold text-gray-300">{sec.name}</span>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-[#8b5cf6]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Code & JSON Editor */}
            {activeTab === 'code' && (
              <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#8b5cf6]" />
                    <span className="text-xs font-bold text-gray-300">Raw JSON Theme Tokens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-1.5 transition"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy JSON</span>
                    </button>
                  </div>
                </div>

                {jsonError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>JSON Syntax Error: {jsonError}</span>
                  </div>
                )}

                <div className="flex-1 rounded-2xl bg-[#07070e] border border-white/10 overflow-hidden flex flex-col">
                  <textarea
                    value={rawJson}
                    onChange={handleJsonChange}
                    className="flex-1 w-full p-4 font-mono text-xs text-emerald-400 bg-transparent resize-none focus:outline-hidden leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Custom CSS overrides input */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Custom CSS Micro-Rules (Optional)</label>
                  <textarea
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    placeholder="/* e.g. .custom-accent-glow { filter: drop-shadow(0 0 10px #8b5cf6); } */"
                    className="w-full h-20 p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-purple-300 focus:outline-hidden resize-none"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Design Skill Starter Kits */}
            {activeTab === 'presets' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    UI Skill Design Starter Kits
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Instantly load battle-tested design system palettes inspired by Claude, Neo-Brutalism, Matrix, Sega, and Claymorphism.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {THEME_STARTER_PRESETS.map((preset) => (
                    <div
                      key={preset.name}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#8b5cf6]/50 transition flex flex-col justify-between space-y-3 group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{preset.name}</h4>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                            {preset.template.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: preset.template.previewBg || '#111' }} />
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: preset.template.previewAccent || '#8b5cf6' }} />
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: preset.template.previewSecondary || '#fff' }} />
                        </div>

                        <button
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-[#8b5cf6]/20 hover:bg-[#8b5cf6] text-[#a78bfa] hover:text-white transition flex items-center gap-1"
                        >
                          <span>Apply Preset</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Live Dual-View Interactive Simulator (5 Cols) */}
          <div className="lg:col-span-5 bg-[#080811] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto relative no-scrollbar">
            
            {/* Simulator Top Controls */}
            <div className="w-full flex items-center justify-between pb-3 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#8b5cf6]" />
                <span className="font-semibold text-white">Live Phone Simulator</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500">Real-Time Sync</span>
            </div>

            {/* Interactive Phone Mockup */}
            <ThemePreviewSimulator
              tokens={tokens}
              layoutStyle={layoutStyle}
              sections={sections}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
