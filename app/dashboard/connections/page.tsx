/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, MapPin, Check, User, Phone, Mail, Building, Plus, Camera, Loader2, Send } from "lucide-react";
import { useRef } from "react";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // @ts-ignore
  const fileInputRef = useRef<HTMLInputElement>(null);
  // @ts-ignore
  const [isScanning, setIsScanning] = useState(false);

  const fetchConnections = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("connections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) setConnections(data);
    }
    setIsLoading(false);
  };

  // @ts-ignore
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
        // Save to CRM directly
        const { data: { user } } = await supabase.auth.getUser();
        await fetch("/api/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...result, userIdOverride: user?.id, connectionSource: "Scanner" }),
        });
        /* eslint-disable react-hooks/exhaustive-deps */
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchConnections();
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
    /* eslint-disable react-hooks/exhaustive-deps */
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchConnections();
  }, []);

  
  const handleSendFollowUp = async (connection: Record<string, string>) => {
    if (!connection.contact_email) {
      alert("No email address provided for this contact.");
      return;
    }
    
    const subject = encodeURIComponent("Great meeting you!");
    const body = encodeURIComponent(connection.ai_drafted_message);
    window.location.assign(`mailto:${connection.contact_email}?subject=${subject}&body=${body}`);
    
    // Optimistic update status
    await supabase.from("connections").update({ status: "sent" }).eq("id", connection.id);
    /* eslint-disable react-hooks/exhaustive-deps */
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchConnections();
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0071E3]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Networking CRM</h1>
          <p className="text-sm text-[#86868B]">Manage contacts captured from your smart card.</p>
        </div>
      </div>

      {connections.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-black/[0.04]">
          <div className="w-16 h-16 bg-blue-50 text-[#0071E3] rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-[#1D1D1F]">No connections yet</h3>
          <p className="text-sm text-[#86868B] mt-2 max-w-md mx-auto">When someone scans your card and uses the &quot;Share Info Back&quot; feature, their details and an AI-drafted follow-up will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {connections.map(conn => (
            <div key={conn.id} className="bg-white rounded-[24px] p-5 border border-black/[0.06] shadow-sm flex flex-col sm:flex-row gap-5 items-start">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F]">{conn.contact_name}</h3>
                  {conn.status === "sent" && <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Followed Up</span>}
                </div>
                <p className="text-[14px] text-[#86868B]">{conn.contact_title} {conn.contact_company && `at ${conn.contact_company}`}</p>
                <div className="flex items-center gap-4 text-[12px] text-[#86868B] pt-2">
                  {conn.contact_email && <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> {conn.contact_email}</div>}
                  {conn.met_at_location && <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Met {conn.met_at_location}</div>}
                </div>
              </div>

              <div className="w-full sm:w-[400px] bg-[#F5F5F7] rounded-xl p-4 border border-black/[0.04] shrink-0">
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
                    <><Send className="w-4 h-4"/> Approve & Send via Email</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
