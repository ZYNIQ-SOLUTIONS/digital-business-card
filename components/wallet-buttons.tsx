"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { AppleIcon, GoogleIcon } from "@/components/icons";

interface WalletButtonsProps {
  slug: string;
  cardId?: string;
  className?: string;
  t?: any;
}

export function WalletButtons({ slug, cardId, className = "", t }: WalletButtonsProps) {
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const sendTelemetry = async () => {
    if (!cardId) return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cardId);
    if (!isUUID) return;
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, eventType: "wallet_download" }),
      });
    } catch {
      // Telemetry error swallowed gracefully
    }
  };

  const handleWallet = async (type: "apple" | "google") => {
    setLoading(type);
    setNotification(null);

    try {
      sendTelemetry();

      const endpoint = type === "apple" ? `/api/wallet/apple/${slug}` : `/api/wallet/google/${slug}`;
      const res = await fetch(endpoint);

      if (res.status === 200) {
        if (type === "apple") {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${slug}.pkpass`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (data.saveUrl) {
              window.open(data.saveUrl, "_blank");
            }
          }
        }
      } else if (res.status === 501) {
        const errorData = await res.json().catch(() => null);
        const msg =
          errorData?.error ||
          (type === "apple"
            ? "Apple Developer certificates not configured"
            : "Google Wallet credentials not configured");
        setNotification(msg);
        setTimeout(() => setNotification(null), 4500);
      } else {
        const errorData = await res.json().catch(() => null);
        setNotification(errorData?.error || "Failed to generate wallet pass.");
        setTimeout(() => setNotification(null), 4500);
      }
    } catch (e) {
      console.error("Wallet pass fetch error:", e);
      setNotification("Network error requesting wallet pass.");
      setTimeout(() => setNotification(null), 4500);
    } finally {
      setLoading(null);
    }
  };

  const pillClass = t ? `${t.pillBg} ${t.pillHover} border ${t.pillBorder}` : "bg-black/5 hover:bg-black/10 border-black/10";
  const textClass = t ? t.textMain : "text-black";

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="flex items-center gap-2 w-full">
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

      {notification && (
        <div className="w-full text-center p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 animate-in fade-in duration-200">
          {notification}
        </div>
      )}
    </div>
  );
}
