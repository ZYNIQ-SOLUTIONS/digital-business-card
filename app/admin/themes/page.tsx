'use client';

import React, { useState, useEffect } from 'react';
import { ThemeTokens, themeList as initialBuiltInThemes, getAllThemes } from '@/lib/theme';
import { ThemeStudioModal } from './theme-studio-modal';
import { 
  Palette, Plus, Search, Check, Sparkles, 
  Trash2, Edit3, Eye, Copy, Globe, Lock, 
  Layers, Download, RefreshCw, Sliders, 
  Shield, Star, Zap, Code
} from 'lucide-react';

export default function AdminThemesPage() {
  const [themesList, setThemesList] = useState<ThemeTokens[]>(initialBuiltInThemes);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThemeForPreview, setActiveThemeForPreview] = useState<ThemeTokens | null>(null);
  
  // Studio Modal State
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeTokens | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch custom themes from backend API on mount
  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/themes');
      if (res.ok) {
        const data = await res.json();
        if (data.allThemes && Array.isArray(data.allThemes)) {
          setThemesList(data.allThemes);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic themes from API, using built-ins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Open Studio for new Theme
  const handleCreateNew = () => {
    setEditingTheme(null);
    setIsStudioOpen(true);
  };

  // Open Studio to Edit existing Theme
  const handleEditTheme = (theme: ThemeTokens) => {
    setEditingTheme(theme);
    setIsStudioOpen(true);
  };

  // Clone an existing Theme
  const handleCloneTheme = (theme: ThemeTokens) => {
    const cloned: ThemeTokens = {
      ...theme,
      id: `${theme.id}-copy-${Date.now().toString(36).slice(-4)}`,
      name: `${theme.name} (Copy)`,
      isCustom: true,
      isPublished: true,
    };
    setEditingTheme(cloned);
    setIsStudioOpen(true);
  };

  // Save / Publish theme via API
  const handleSaveTheme = async (theme: ThemeTokens, layoutConfig: any, isPublished: boolean) => {
    const res = await fetch('/api/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: theme.id,
        name: theme.name,
        description: theme.description,
        isDark: theme.isDark,
        category: theme.category,
        tokens: theme,
        layoutConfig,
        isPublished,
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save theme');
    }

    showNotification(`Theme "${theme.name}" published & saved successfully!`);
    await fetchThemes();
  };

  // Delete custom theme
  const handleDeleteTheme = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete custom theme "${name}"?`)) return;
    try {
      const res = await fetch(`/api/themes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showNotification(`Theme "${name}" deleted.`);
        await fetchThemes();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete theme');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export JSON
  const handleExportJson = (theme: ThemeTokens) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${theme.id}-theme.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification(`Exported ${theme.name} as JSON`);
  };

  const categoryColors: Record<string, string> = {
    light: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dark: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    luxury: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyber: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    editorial: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    creative: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    custom: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  const filteredThemes = themesList.filter((th) => {
    const matchesCat = selectedCategory === 'all' 
      ? true 
      : selectedCategory === 'custom' 
        ? th.isCustom 
        : th.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      th.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      th.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      th.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#8b5cf6] text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-slideUp">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Palette className="w-5 h-5 text-white" />
            </div>
            Theme Studio & Management
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Create, customize, and publish creative card themes with visual token pickers, drag & drop section hierarchy, and live JSON code editing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchThemes}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-gray-300 transition"
            title="Refresh Themes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] text-white font-bold text-xs shadow-lg hover:brightness-110 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Theme</span>
          </button>
        </div>
      </div>

      {/* Themes Stats Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'All Themes', cat: 'all', count: themesList.length },
          { label: 'Creative', cat: 'creative', count: themesList.filter(t => t.category === 'creative').length },
          { label: 'Luxury VIP', cat: 'luxury', count: themesList.filter(t => t.category === 'luxury').length },
          { label: 'Cyber HUD', cat: 'cyber', count: themesList.filter(t => t.category === 'cyber').length },
          { label: 'Editorial', cat: 'editorial', count: themesList.filter(t => t.category === 'editorial').length },
          { label: 'Dark OLED', cat: 'dark', count: themesList.filter(t => t.category === 'dark').length },
          { label: 'Custom Made', cat: 'custom', count: themesList.filter(t => t.isCustom).length },
        ].map((item) => (
          <button
            key={item.cat}
            onClick={() => setSelectedCategory(item.cat)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              selectedCategory === item.cat
                ? 'bg-[#8b5cf6]/15 border-[#8b5cf6] shadow-sm'
                : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.15]'
            }`}
          >
            <div className="text-xl font-bold text-white">{item.count}</div>
            <div className="text-[11px] font-semibold text-gray-400 mt-0.5">{item.label}</div>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search themes by name, id or style..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-[#8b5cf6] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {['all', 'creative', 'luxury', 'cyber', 'editorial', 'dark', 'light', 'custom'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-white text-black shadow-xs'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Themes Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredThemes.map((theme) => {
          return (
            <div
              key={theme.id}
              className="relative group rounded-3xl border border-white/[0.08] hover:border-[#8b5cf6]/50 bg-white/[0.03] hover:bg-white/[0.05] transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Top Swatch Visual with Interactive Overlay */}
              <div
                className="h-28 w-full relative overflow-hidden"
                style={{ background: theme.previewBg || '#1a1a2e' }}
              >
                {/* Mini card skeleton */}
                <div 
                  className="absolute inset-3.5 rounded-xl opacity-90 transition-transform group-hover:scale-102 flex flex-col justify-between p-2.5 shadow-md"
                  style={{
                    background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
                    border: theme.isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-5 h-5 rounded-full" style={{ background: theme.previewAccent || '#8b5cf6' }} />
                    <div className="h-1.5 rounded-full w-8 opacity-40" style={{ background: theme.isDark ? '#fff' : '#000' }} />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full w-20" style={{ background: theme.previewAccent || '#8b5cf6' }} />
                    <div className="h-1.5 rounded-full w-12 opacity-50" style={{ background: theme.isDark ? '#fff' : '#000' }} />
                  </div>
                </div>

                {/* Badge top-right */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                  {theme.isCustom && (
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/80 text-white shadow-xs">
                      Custom
                    </span>
                  )}
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border backdrop-blur-md ${categoryColors[theme.category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {theme.category}
                  </span>
                </div>
              </div>

              {/* Theme Content */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#a78bfa] transition">
                      {theme.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                    {theme.description}
                  </p>
                </div>

                {/* Color Swatch Indicators */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full border border-white/20 shadow-xs" style={{ background: theme.previewBg || '#111' }} title="Background" />
                    <div className="w-4 h-4 rounded-full border border-white/20 shadow-xs" style={{ background: theme.previewAccent || '#8b5cf6' }} title="Accent" />
                    <div className="w-4 h-4 rounded-full border border-white/20 shadow-xs" style={{ background: theme.previewSecondary || '#eee' }} title="Secondary" />
                  </div>

                  <div className="flex items-center gap-1">
                    {theme.isDark ? (
                      <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Dark
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" /> Light
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  <button
                    onClick={() => handleEditTheme(theme)}
                    className="py-1.5 px-2 rounded-xl bg-white/[0.06] hover:bg-[#8b5cf6]/20 hover:text-[#a78bfa] text-gray-300 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                    title="Edit in Visual & Code Studio"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleCloneTheme(theme)}
                    className="py-1.5 px-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                    title="Clone / Duplicate Theme"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Clone</span>
                  </button>

                  <button
                    onClick={() => handleExportJson(theme)}
                    className="py-1.5 px-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                    title="Export JSON definition"
                  >
                    <Download className="w-3 h-3" />
                    <span>JSON</span>
                  </button>
                </div>

                {theme.isCustom && (
                  <button
                    onClick={() => handleDeleteTheme(theme.id, theme.name)}
                    className="w-full py-1 text-[10px] font-semibold text-red-400/80 hover:text-red-300 flex items-center justify-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Custom Theme</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Theme Studio Visual Modal */}
      {isStudioOpen && (
        <ThemeStudioModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          initialTheme={editingTheme}
          onSaveTheme={handleSaveTheme}
        />
      )}
    </div>
  );
}
