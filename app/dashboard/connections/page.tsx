"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, MapPin, Check, User, Phone, Mail, Building, Plus, 
  Camera, Loader2, Send, Folder, FolderOpen, FolderPlus, MoreVertical, X,
  Sparkles, Layers, ChevronDown, Trash2, Edit3, CheckCircle2
} from "lucide-react";
import { AiCollectionModal } from "@/components/ai-collection-modal";

const PRESET_COLORS = [
  "#0071E3", // Apple Blue
  "#34C759", // Emerald Green
  "#AF52DE", // Purple
  "#FF9500", // Orange
  "#FF2D55", // Rose Pink
  "#5856D6", // Indigo
  "#5AC8FA", // Cyan
  "#64748B", // Slate
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals & Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState("#0071E3");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [connRes, collRes, cardsRes, profileRes] = await Promise.all([
        supabase.from("connections").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("collections").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("cards").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);
      
      if (connRes.data) setConnections(connRes.data);
      if (collRes.data) setCollections(collRes.data);
      if (cardsRes.data) setCards(cardsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
    }
    setIsLoading(false);
  };

  const handleCreateManualCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    
    setIsSubmittingManual(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from("collections").insert({
        user_id: user.id,
        name: newCollectionName.trim(),
        color: newCollectionColor || "#0071E3"
      }).select().single();

      if (!error && data) {
        setNewCollectionName("");
        setNewCollectionColor("#0071E3");
        setIsCreatingCollection(false);
        await fetchData();
        setActiveCollectionId(data.id);
      }
    }
    setIsSubmittingManual(false);
  };

  const handleDeleteCollection = async (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this collection? Connections will not be deleted.")) return;

    await supabase.from("collections").delete().eq("id", collectionId);
    if (activeCollectionId === collectionId) {
      setActiveCollectionId(null);
    }
    fetchData();
  };

  const handleAssignCollection = async (connectionId: string, collectionId: string | null) => {
    await supabase.from("connections").update({ collection_id: collectionId }).eq("id", connectionId);
    fetchData();
  };

  const handleScanCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const data = new FormData();
      data.append("image", file);
      
      const res = await fetch("/api/ai/extract-card", {
        method: "POST",
        body: data,
      });
      
      const result = await res.json();
      if (res.ok) {
        const { data: { user } } = await supabase.auth.getUser();
        await fetch("/api/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...result, userIdOverride: user?.id, connectionSource: "Scanner" }),
        });
        fetchData();
      } else {
        alert("Extraction failed.");
      }
    } catch {
      alert("Error parsing card.");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendFollowUp = async (connection: Record<string, string>) => {
    if (!connection.contact_email) {
      alert("No email address provided for this contact.");
      return;
    }
    
    const subject = encodeURIComponent("Great meeting you!");
    const body = encodeURIComponent(connection.ai_drafted_message);
    window.location.assign(`mailto:${connection.contact_email}?subject=${subject}&body=${body}`);
    
    await supabase.from("connections").update({ status: "sent" }).eq("id", connection.id);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071E3]" />
      </div>
    );
  }

  const filteredConnections = activeCollectionId 
    ? connections.filter(c => c.collection_id === activeCollectionId)
    : connections;

  const activeCollectionObj = collections.find(c => c.id === activeCollectionId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">Networking Wallet</h1>
          <p className="text-sm text-[#86868B]">Manage contacts, scan paper cards, and organize into smart collections.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleScanCard} />
          
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-full transition flex items-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Generate Collections</span>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="px-4 py-2 bg-black hover:bg-neutral-800 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-full transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>Scan Card</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar: Collections */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-3xl p-5 border border-black/[0.04] shadow-xs space-y-4">
          
          {/* Collections Section Header & Action Menu */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Collections</span>
            </h3>

            {/* Split / Dropdown Action Area */}
            <div className="relative" ref={menuRef}>
              <div className="flex items-center gap-1">
                {/* 1-Click AI Generator Button */}
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  title="Generate Collections with AI"
                  className="p-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 hover:bg-blue-100 transition flex items-center gap-1 text-[11px] font-semibold px-2 cursor-pointer border border-blue-100"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI</span>
                </button>

                {/* Main Add Button with Dropdown Options */}
                <button 
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-black bg-neutral-100 hover:bg-neutral-200 p-1.5 rounded-full transition flex items-center justify-center cursor-pointer"
                  title="Add Collection Options"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Collection Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-black/[0.08] shadow-xl p-2 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Add Collection
                  </div>

                  {/* Option 1: Add Manually */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsCreatingCollection(true);
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition text-left group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700 group-hover:bg-black group-hover:text-white transition">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-900">Add Manually</div>
                      <div className="text-[11px] text-neutral-500">Create with custom name & color</div>
                    </div>
                  </button>

                  {/* Option 2: Generate with AI */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAiModalOpen(true);
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/60 transition text-left group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#0071E3] flex items-center gap-1">
                        <span>Generate with AI</span>
                        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full uppercase font-bold">Smart</span>
                      </div>
                      <div className="text-[11px] text-neutral-500">Auto-cluster cards & profile</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Horizontal Pill Scroll */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveCollectionId(null)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl shrink-0 text-xs font-semibold transition active:scale-95 ${
                !activeCollectionId
                  ? "bg-black text-white shadow-xs"
                  : "bg-neutral-100 text-[#1D1D1F]"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>All Cards</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${!activeCollectionId ? "bg-neutral-800 text-white" : "bg-neutral-200 text-neutral-600"}`}>
                {connections.length}
              </span>
            </button>

            {collections.map(collection => {
              const count = connections.filter(c => c.collection_id === collection.id).length;
              const isActive = activeCollectionId === collection.id;
              const color = collection.color || "#0071E3";

              return (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollectionId(collection.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl shrink-0 text-xs font-semibold transition active:scale-95 ${
                    isActive
                      ? "bg-[#0071E3] text-white shadow-xs"
                      : "bg-neutral-100 text-[#1D1D1F]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? "#FFFFFF" : color }} />
                  <span>{collection.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop Collections List */}
          <div className="hidden lg:block space-y-1">
            {/* All Cards Option */}
            <button
              onClick={() => setActiveCollectionId(null)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition text-xs sm:text-sm font-semibold cursor-pointer ${
                !activeCollectionId 
                  ? "bg-black text-white shadow-xs" 
                  : "text-[#1D1D1F] hover:bg-neutral-100"
              }`}
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">All Cards</span>
              <span className={`ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full ${!activeCollectionId ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                {connections.length}
              </span>
            </button>

            {/* Custom Collections */}
            {collections.map(collection => {
              const count = connections.filter(c => c.collection_id === collection.id).length;
              const isActive = activeCollectionId === collection.id;
              const color = collection.color || "#0071E3";

              return (
                <div
                  key={collection.id}
                  onClick={() => setActiveCollectionId(collection.id)}
                  className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition text-xs sm:text-sm font-semibold cursor-pointer ${
                    isActive 
                      ? "bg-[#0071E3] text-white shadow-xs" 
                      : "text-[#1D1D1F] hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: isActive ? "#FFFFFF" : color }}
                    />
                    <span className="truncate">{collection.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCollection(e, collection.id)}
                      className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition ${
                        isActive ? "hover:bg-white/20 text-white" : "hover:bg-red-50 text-neutral-400 hover:text-red-600"
                      }`}
                      title="Delete collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick AI Generator Banner for empty/new state */}
          {collections.length === 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-purple-50/70 border border-blue-100/80 space-y-2 text-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[#1D1D1F]">Auto-organize your leads</div>
              <p className="text-[11px] text-neutral-500 leading-tight">
                Let AI cluster your saved cards into smart groups.
              </p>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-xs transition"
              >
                Generate Smart Collections
              </button>
            </div>
          )}

        </div>

        {/* Main Content: Connections Grid */}
        <div className="flex-1 w-full space-y-4">
          
          {/* Active Collection Filter Bar */}
          {activeCollectionObj && (
            <div className="bg-white rounded-2xl p-4 border border-black/[0.04] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: activeCollectionObj.color || "#0071E3" }} />
                <h2 className="font-bold text-sm text-[#1D1D1F]">
                  Viewing Collection: <span className="text-[#0071E3]">{activeCollectionObj.name}</span>
                </h2>
                <span className="text-xs text-neutral-400 font-mono">({filteredConnections.length} cards)</span>
              </div>
              <button
                onClick={() => setActiveCollectionId(null)}
                className="text-xs font-semibold text-neutral-500 hover:text-black transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear filter
              </button>
            </div>
          )}

          {filteredConnections.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-black/[0.04] space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-[#0071E3] rounded-3xl flex items-center justify-center mx-auto shadow-xs">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-lg font-bold text-[#1D1D1F]">
                  {activeCollectionId ? "No cards in this collection" : "Your networking wallet is empty"}
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  {activeCollectionId 
                    ? "Assign existing contacts using the collection dropdown on any card below, or scan a new business card." 
                    : "Scan a physical paper card or share your digital business card link to capture leads."}
                </p>
              </div>
              {activeCollectionId ? (
                <button
                  onClick={() => setActiveCollectionId(null)}
                  className="px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition"
                >
                  View All Cards
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-xs transition"
                >
                  Scan First Business Card
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredConnections.map(conn => {
                const assignedColl = collections.find(c => c.id === conn.collection_id);

                return (
                  <div key={conn.id} className="bg-white rounded-[28px] p-5 sm:p-6 border border-black/[0.06] shadow-xs flex flex-col sm:flex-row gap-5 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">{conn.contact_name}</h3>
                        {conn.status === "sent" && (
                          <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Followed Up
                          </span>
                        )}
                        {assignedColl && (
                          <span 
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
                            style={{ 
                              backgroundColor: `${assignedColl.color || '#0071E3'}15`,
                              color: assignedColl.color || '#0071E3'
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: assignedColl.color || '#0071E3' }} />
                            {assignedColl.name}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[13px] font-medium text-neutral-600">
                        {conn.contact_title} {conn.contact_company && <span className="text-neutral-400">at</span>} {conn.contact_company}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#86868B] pt-1">
                        {conn.contact_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-neutral-400"/> 
                            <a href={`mailto:${conn.contact_email}`} className="hover:underline text-neutral-600">{conn.contact_email}</a>
                          </div>
                        )}
                        {conn.contact_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-neutral-400"/> 
                            <a href={`tel:${conn.contact_phone}`} className="hover:underline text-neutral-600 font-mono">{conn.contact_phone}</a>
                          </div>
                        )}
                        {conn.met_at_location && (
                          <div className="flex items-center gap-1 text-neutral-500">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400"/> Met {conn.met_at_location}
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-xs text-neutral-400 font-medium">Collection:</span>
                        <select 
                          value={conn.collection_id || ""}
                          onChange={(e) => handleAssignCollection(conn.id, e.target.value || null)}
                          className="text-xs py-1 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                        >
                          <option value="">No Collection</option>
                          {collections.map(col => (
                            <option key={col.id} value={col.id}>{col.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* AI Drafted Follow-up Card */}
                    <div className="w-full sm:w-[340px] bg-[#F5F5F7] rounded-2xl p-4 border border-black/[0.04] shrink-0 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#0071E3]" />
                            <span>AI Drafted Follow-up</span>
                          </p>
                        </div>
                        <p className="text-[13px] text-[#1D1D1F] italic leading-relaxed">
                          &quot;{conn.ai_drafted_message || "Great meeting you today! Let's connect soon."}&quot;
                        </p>
                      </div>

                      <button 
                        onClick={() => handleSendFollowUp(conn)}
                        disabled={conn.status === "sent"}
                        className="w-full mt-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-semibold flex items-center justify-center gap-2 text-xs transition disabled:opacity-50 disabled:bg-green-600 cursor-pointer shadow-xs"
                      >
                        {conn.status === "sent" ? (
                          <><Check className="w-4 h-4"/> Follow-up Sent</>
                        ) : (
                          <><Send className="w-4 h-4"/> Approve & Send Email</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Manual Collection Creation Modal */}
      {isCreatingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-black/[0.08] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[#1D1D1F]">New Collection</h2>
              </div>
              <button 
                onClick={() => setIsCreatingCollection(false)} 
                className="p-1.5 hover:bg-neutral-100 rounded-full transition text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Collection Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={newCollectionName} 
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. VIP Clients, Dubai Summit 2026..."
                  className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 text-sm text-[#1D1D1F] font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Color Tag
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCollectionColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newCollectionColor === c ? "ring-2 ring-offset-2 ring-black scale-110" : "opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCollection(false)}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingManual || !newCollectionName.trim()}
                  className="flex-1 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isSubmittingManual ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Collection Generator Modal */}
      <AiCollectionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onCollectionsCreated={fetchData}
        connections={connections}
        cards={cards}
        profile={profile}
        existingCollections={collections}
      />
    </div>
  );
}
