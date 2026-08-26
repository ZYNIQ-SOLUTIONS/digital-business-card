import React, { useState, useRef } from "react";
import { Camera, X, Loader2, CheckCircle2 } from "lucide-react";

export function ExchangeModal({ isOpen, onClose, cardOwnerName, cardId }: { isOpen: boolean; onClose: () => void; cardOwnerName: string; cardId: string }) {
  const [mode, setMode] = useState<"choose" | "camera" | "manual" | "success">("choose");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "", title: "" });

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("image", file);
      
      const res = await fetch("/api/ai/extract-card", {
        method: "POST",
        body: data,
      });
      
      const result = await res.json();
      if (res.ok) {
        setFormData(result);
        setMode("manual"); // Let them review it
      } else {
        alert("Extraction failed. Please enter manually.");
        setMode("manual");
      }
    } catch {
      alert("Error parsing card.");
      setMode("manual");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Save to connections
      await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, cardId }),
      });
      setMode("success");
    } catch {
      alert("Failed to save connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition">
          <X className="w-5 h-5" />
        </button>

        {mode === "choose" && (
          <div className="text-center space-y-6 pt-4">
            <div>
              <h3 className="text-[20px] font-semibold text-[#1D1D1F]">Connect with {cardOwnerName.split(" ")[0]}</h3>
              <p className="text-[14px] text-[#86868B] mt-1">Share your info back instantly.</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#0071E3] text-white font-semibold shadow-sm hover:bg-[#0077ED] transition"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                <span>Scan Business Card</span>
              </button>
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              
              <button 
                onClick={() => setMode("manual")}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#F5F5F7] text-[#1D1D1F] font-semibold border border-black/[0.05] hover:bg-[#E8E8ED] transition"
              >
                Enter Manually
              </button>
            </div>
          </div>
        )}

        {mode === "manual" && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <h3 className="text-[20px] font-semibold text-[#1D1D1F]">Your Details</h3>
            <div className="space-y-3">
              <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05]" />
              <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05]" />
              <input type="text" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05]" />
              <div className="flex gap-2">
                <input type="text" placeholder="Company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-1/2 p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05]" />
                <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-1/2 p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.05]" />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full p-4 rounded-2xl bg-black text-white font-semibold flex justify-center items-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Share Contact</span>}
            </button>
          </form>
        )}

        {mode === "success" && (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-50 border border-green-200/80 flex items-center justify-center text-[#34C759]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-[20px] font-semibold text-[#1D1D1F]">Sent!</h3>
            <p className="text-[14px] text-[#86868B]">Your info has been shared securely.</p>
            <button onClick={onClose} className="w-full p-3 mt-4 rounded-xl bg-[#F5F5F7] font-semibold text-[#1D1D1F]">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
