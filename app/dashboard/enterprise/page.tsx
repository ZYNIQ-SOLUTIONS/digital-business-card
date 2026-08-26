"use client";

import React, { useState } from "react";
import { UploadCloud, Building2, Users, Loader2, CheckCircle2 } from "lucide-react";

export default function EnterpriseDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("csv", file);

    try {
      const res = await fetch("/api/enterprise/bulk-upload", {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        setSuccess(true);
        setFile(null);
      } else {
        alert("Failed to upload CSV.");
      }
    } catch {
      alert("Error uploading CSV.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">Enterprise Management</h1>
        <p className="text-[15px] text-[#86868B] mt-1">Bulk create and manage digital business cards for your organization.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Upload Card */}
        <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0071E3] flex items-center justify-center mb-2">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h2 className="text-[20px] font-semibold text-[#1D1D1F]">Upload Employees CSV</h2>
          <p className="text-[14px] text-[#86868B] max-w-sm">
            Upload a CSV with columns: <code className="bg-neutral-100 px-1 rounded text-neutral-800">name, title, email, phone</code> to generate cards.
          </p>
          
          {success ? (
             <div className="flex flex-col items-center gap-2 mt-4 text-[#34C759]">
               <CheckCircle2 className="w-6 h-6" />
               <span className="font-semibold text-sm">Successfully created cards</span>
               <button onClick={() => setSuccess(false)} className="text-[#0071E3] text-xs underline mt-2">Upload another</button>
             </div>
          ) : (
            <div className="w-full pt-4 space-y-4">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
              <button 
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full py-3 rounded-2xl bg-black text-white font-semibold disabled:opacity-50 flex justify-center items-center gap-2 transition hover:bg-neutral-800"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Bulk Generate Passes</span>}
              </button>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-[#0071E3] to-[#5856D6] rounded-[32px] p-8 text-white flex flex-col justify-between shadow-lg shadow-blue-500/20">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-6 h-6 text-white/80" />
              <span className="font-semibold text-white/80">Acme Corp</span>
            </div>
            
            <div className="space-y-1">
              <p className="text-white/60 text-sm font-medium">Active Passes</p>
              <h2 className="text-5xl font-bold tracking-tighter">0</h2>
            </div>
          </div>
          
          <div className="pt-8 flex items-center justify-between text-sm text-white/80 font-medium border-t border-white/20 mt-8">
            <span className="flex items-center gap-1"><Users className="w-4 h-4"/> 0 Employees</span>
            <button className="underline hover:text-white">Manage Directory</button>
          </div>
        </div>

      </div>
    </div>
  );
}
