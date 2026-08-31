"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { AppleIcon, GoogleIcon } from "@/components/icons";

interface WalletButtonsProps {
  slug: string;
  className?: string;
  t?: any;
}

export function WalletButtons({ slug, className = "", t }: WalletButtonsProps) {
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);

  const handleWallet = async (type: "apple" | "google") => {
    setLoading(type);
    try {
      if (type === "apple") {
        window.location.href = `/api/wallet/apple/${slug}`;
      } else {
        window.location.href = `/api/wallet/google/${slug}`;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(null), 2000);
    }
  };

  const pillClass = t ? `${t.pillBg} ${t.pillHover} border ${t.pillBorder}` : "bg-black/5 hover:bg-black/10 border-black/10";
  const textClass = t ? t.textMain : "text-black";

  return (
    <div className={`flex items-center gap-2 w-full ${className}`}>
      <button 
        onClick={() => handleWallet("apple")}
        disabled={!!loading}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${pillClass}`}
      >
        {loading === "apple" ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> : <AppleIcon className="w-4 h-4" />}
        <span className={`text-[11px] font-semibold tracking-tight ${textClass}`}>Apple Wallet</span>
      </button>
      
      <button 
        onClick={() => handleWallet("google")}
        disabled={!!loading}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${pillClass}`}
      >
        {loading === "google" ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> : <GoogleIcon className="w-4 h-4" />}
        <span className={`text-[11px] font-semibold tracking-tight ${textClass}`}>Google Wallet</span>
      </button>
    </div>
  );
}
