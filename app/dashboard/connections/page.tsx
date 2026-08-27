/* eslint-disable */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, MapPin, Check, User, Phone, Mail, Building, Plus, 
  Camera, Loader2, Send, Folder, FolderOpen, MoreVertical, X
} from "lucide-react";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [connRes, collRes] = await Promise.all([
        supabase.from("connections").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("collections").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      ]);
      
      if (connRes.data) setConnections(connRes.data);
      if (collRes.data) setCollections(collRes.data);
    }
    setIsLoading(false);
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("collections").insert({
        user_id: user.id,
        name: newCollectionName.trim(),
        color: "#0071E3"
      });
      setNewCollectionName("");
      setIsCreatingCollection(false);
      fetchData();
    }
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
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0071E3]" /></div>;
  }

  const filteredConnections = activeCollectionId 
    ? connections.filter(c => c.collection_id === activeCollectionId)
    : connections;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Networking Wallet</h1>
          <p className="text-sm text-[#86868B]">Manage contacts and organize saved cards.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleScanCard} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white text-sm font-semibold rounded-full transition flex items-center gap-2"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            Scan Card
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar: Collections */}
        <div className="w-full lg:w-64 shrink-0 bg-white rounded-3xl p-4 border border-black/[0.04] shadow-xs">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider">Collections</h3>
            <button 
              onClick={() => setIsCreatingCollection(true)}
              className="text-[#0071E3] hover:bg-blue-50 p-1.5 rounded-full transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            <button
              onClick={() => setActiveCollectionId(null)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium ${!activeCollectionId ? "bg-black text-white" : "text-[#1D1D1F] hover:bg-neutral-100"}`}
            >
              <FolderOpen className="w-4 h-4" />
              All Cards
              <span className="ml-auto text-xs opacity-60">{connections.length}</span>
            </button>
            {collections.map(collection => {
              const count = connections.filter(c => c.collection_id === collection.id).length;
              const isActive = activeCollectionId === collection.id;
              return (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollectionId(collection.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium ${isActive ? "bg-[#0071E3] text-white" : "text-[#1D1D1F] hover:bg-neutral-100"}`}
                >
                  <Folder className={`w-4 h-4 ${isActive ? "text-white" : "text-[#0071E3]"}`} />
                  {collection.name}
                  <span className="ml-auto text-xs opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content: Connections Grid */}
        <div className="flex-1 w-full space-y-4">
          {filteredConnections.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-black/[0.04]">
              <div className="w-16 h-16 bg-blue-50 text-[#0071E3] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-[#1D1D1F]">No cards in this collection</h3>
              <p className="text-sm text-[#86868B] mt-2 max-w-md mx-auto">Scan a business card or share your info back to capture leads.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredConnections.map(conn => (
                <div key={conn.id} className="bg-white rounded-[24px] p-5 border border-black/[0.06] shadow-sm flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-semibold text-[#1D1D1F]">{conn.contact_name}</h3>
                      {conn.status === "sent" && <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Followed Up</span>}
                    </div>
                    <p className="text-[14px] text-[#86868B]">{conn.contact_title} {conn.contact_company && `at ${conn.contact_company}`}</p>
                    <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#86868B] pt-2">
                      {conn.contact_email && <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> {conn.contact_email}</div>}
                      {conn.met_at_location && <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Met {conn.met_at_location}</div>}
                    </div>
                    
                    <div className="pt-3">
                      <select 
                        value={conn.collection_id || ""}
                        onChange={(e) => handleAssignCollection(conn.id, e.target.value || null)}
                        className="text-xs p-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 focus:outline-none"
                      >
                        <option value="">No Collection</option>
                        {collections.map(col => (
                          <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="w-full sm:w-[350px] bg-[#F5F5F7] rounded-xl p-4 border border-black/[0.04] shrink-0">
                    <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-2">AI Drafted Follow-up</p>
                    <p className="text-[13px] text-[#1D1D1F] italic leading-relaxed">&quot;{conn.ai_drafted_message}&quot;</p>
                    <button 
                      onClick={() => handleSendFollowUp(conn)}
                      disabled={conn.status === "sent"}
                      className="w-full mt-3 px-4 py-2 min-h-[44px] rounded-xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-semibold flex items-center justify-center gap-2 text-[14px] transition disabled:opacity-50 disabled:bg-green-600"
                    >
                      {conn.status === "sent" ? (
                        <><Check className="w-4 h-4"/> Sent</>
                      ) : (
                        <><Send className="w-4 h-4"/> Approve & Send</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isCreatingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1D1D1F]">New Collection</h2>
              <button onClick={() => setIsCreatingCollection(false)} className="p-2 hover:bg-neutral-100 rounded-full transition">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Collection Name</label>
                <input 
                  type="text" 
                  value={newCollectionName} 
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. VIP Clients, CES 2026..."
                  className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-[#0071E3] text-white rounded-xl font-semibold active:scale-95 transition"
              >
                Create Collection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

