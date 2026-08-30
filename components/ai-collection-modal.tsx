'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Loader2, 
  RefreshCw, 
  Users, 
  CreditCard, 
  FolderPlus, 
  Folder, 
  ArrowRight,
  CheckSquare,
  Square,
  Layers,
  HelpCircle,
  Tag
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface GeneratedCollectionItem {
  name: string;
  description: string;
  color: string;
  suggestedContactIds?: string[];
}

interface AiCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectionsCreated: () => void;
  connections: any[];
  cards: any[];
  profile: any;
  existingCollections: any[];
}

const COLOR_SWATCHES = [
  '#0071E3', // Apple Blue
  '#34C759', // Green
  '#AF52DE', // Purple
  '#FF9500', // Orange
  '#FF2D55', // Pink
  '#5856D6', // Indigo
  '#5AC8FA', // Cyan
  '#64748B', // Slate
];

export function AiCollectionModal({
  isOpen,
  onClose,
  onCollectionsCreated,
  connections,
  cards,
  profile,
  existingCollections,
}: AiCollectionModalProps) {
  const supabase = createClient();

  const [mode, setMode] = useState<'connections' | 'profile'>('connections');
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatedCollections, setGeneratedCollections] = useState<GeneratedCollectionItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [autoAssignContacts, setAutoAssignContacts] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (selectedMode: 'connections' | 'profile' = mode) => {
    setLoading(true);
    setErrorMsg(null);
    setSelectedIndices([]);

    try {
      const res = await fetch('/api/ai/generate-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          connections,
          cards,
          profile,
          existingCollections,
        }),
      });

      const data = await res.json();
      if (data.collections && Array.isArray(data.collections)) {
        setGeneratedCollections(data.collections);
        // Select all by default
        setSelectedIndices(data.collections.map((_: any, idx: number) => idx));
      } else {
        throw new Error(data.error || 'Failed to generate collections.');
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      setErrorMsg(err.message || 'Could not generate smart collections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Default to connections mode if user has connections, else profile mode
      const initialMode = connections.length > 0 ? 'connections' : 'profile';
      setMode(initialMode);
      handleGenerate(initialMode);
    }
  }, [isOpen]);

  const toggleSelectAll = () => {
    if (selectedIndices.length === generatedCollections.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(generatedCollections.map((_, idx) => idx));
    }
  };

  const toggleIndex = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  const handleUpdateName = (idx: number, newName: string) => {
    setGeneratedCollections((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, name: newName } : c))
    );
  };

  const handleUpdateColor = (idx: number, newColor: string) => {
    setGeneratedCollections((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, color: newColor } : c))
    );
  };

  const handleCreateSelected = async () => {
    if (selectedIndices.length === 0) return;
    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated.');

      for (const idx of selectedIndices) {
        const item = generatedCollections[idx];
        if (!item.name.trim()) continue;

        // 1. Insert collection
        const { data: newColl, error: collError } = await supabase
          .from('collections')
          .insert({
            user_id: user.id,
            name: item.name.trim(),
            color: item.color || '#0071E3',
          })
          .select()
          .single();

        if (collError) {
          console.error('Error inserting collection:', collError);
          continue;
        }

        // 2. If auto-assign is enabled and this collection has suggested contact IDs
        if (autoAssignContacts && newColl && item.suggestedContactIds && item.suggestedContactIds.length > 0) {
          await supabase
            .from('connections')
            .update({ collection_id: newColl.id })
            .in('id', item.suggestedContactIds);
        }
      }

      onCollectionsCreated();
      onClose();
    } catch (err: any) {
      console.error('Failed to create collections:', err);
      alert('Error creating collections: ' + (err.message || 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden z-10 text-neutral-900 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-black/[0.06] bg-gradient-to-r from-blue-50/70 via-purple-50/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight flex items-center gap-2">
                Smart AI Collection Generator
              </h3>
              <p className="text-xs text-neutral-500">
                Automatically organize your contacts & networking passes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Mode Toggle */}
        <div className="p-4 px-6 bg-neutral-50/60 border-b border-black/[0.04]">
          <div className="grid grid-cols-2 gap-2 bg-neutral-200/60 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('connections');
                handleGenerate('connections');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                mode === 'connections'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Users className="w-4 h-4 text-[#0071E3]" />
              <span>Based on Saved Cards</span>
              <span className="text-[10px] opacity-60 bg-neutral-100 px-1.5 py-0.5 rounded-full font-mono">
                {connections.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('profile');
                handleGenerate('profile');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                mode === 'profile'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#AF52DE]" />
              <span>Based on My Profile</span>
              <span className="text-[10px] opacity-60 bg-neutral-100 px-1.5 py-0.5 rounded-full font-mono">
                {cards.length}
              </span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-[#1D1D1F]">
                {mode === 'connections' 
                  ? 'Analyzing contact roles, companies, and networking patterns...' 
                  : 'Synthesizing tailored collections from your card persona & industry...'}
              </p>
              <p className="text-xs text-neutral-400">
                Powered by Gemini AI • Organizing your networking workflow
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center space-y-2">
              <p>{errorMsg}</p>
              <button
                onClick={() => handleGenerate(mode)}
                className="px-4 py-1.5 bg-red-100 hover:bg-red-200 font-semibold rounded-full transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Select All & Controls Bar */}
              <div className="flex items-center justify-between text-xs pb-1">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 font-semibold text-neutral-700 hover:text-black"
                >
                  {selectedIndices.length === generatedCollections.length ? (
                    <CheckSquare className="w-4 h-4 text-[#0071E3]" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-400" />
                  )}
                  <span>Select All ({selectedIndices.length}/{generatedCollections.length})</span>
                </button>

                {mode === 'connections' && (
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-600 select-none">
                    <input
                      type="checkbox"
                      checked={autoAssignContacts}
                      onChange={(e) => setAutoAssignContacts(e.target.checked)}
                      className="rounded border-gray-300 text-[#0071E3] focus:ring-[#0071E3] w-3.5 h-3.5"
                    />
                    <span>Auto-assign matching contacts</span>
                  </label>
                )}
              </div>

              {/* Collections List */}
              <div className="space-y-3">
                {generatedCollections.map((col, idx) => {
                  const isSelected = selectedIndices.includes(idx);
                  const matchingCount = col.suggestedContactIds?.length || 0;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isSelected
                          ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-neutral-50/70 border-black/[0.05] opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleIndex(idx)}
                          className="mt-1 text-neutral-400 hover:text-neutral-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#0071E3]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <input
                              type="text"
                              value={col.name}
                              onChange={(e) => handleUpdateName(idx, e.target.value)}
                              className="font-bold text-sm text-[#1D1D1F] bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none transition py-0.5"
                            />

                            {/* Color Selector */}
                            <div className="flex items-center gap-1">
                              {COLOR_SWATCHES.map((swatch) => (
                                <button
                                  key={swatch}
                                  type="button"
                                  onClick={() => handleUpdateColor(idx, swatch)}
                                  style={{ backgroundColor: swatch }}
                                  className={`w-4 h-4 rounded-full transition-transform ${
                                    col.color === swatch ? 'ring-2 ring-offset-1 ring-black scale-110' : 'opacity-70 hover:opacity-100'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-neutral-500 leading-relaxed">
                            {col.description}
                          </p>

                          {mode === 'connections' && matchingCount > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[#0071E3] font-medium bg-blue-50/70 px-2 py-0.5 rounded-md w-fit">
                              <Users className="w-3 h-3" />
                              <span>{matchingCount} matching {matchingCount === 1 ? 'card' : 'cards'} will be assigned</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-black/[0.06] bg-neutral-50/60 flex items-center justify-between text-xs">
          <button
            type="button"
            disabled={loading || isCreating}
            onClick={() => handleGenerate(mode)}
            className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-black font-semibold disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate Suggestions</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || isCreating || selectedIndices.length === 0}
              onClick={handleCreateSelected}
              className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Collections...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create {selectedIndices.length} {selectedIndices.length === 1 ? 'Collection' : 'Collections'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
