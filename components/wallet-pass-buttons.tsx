"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Apple, Smartphone } from "lucide-react";

interface WalletPassButtonsProps {
  cardId: string;
  isPublic?: boolean;
}

export function WalletPassButtons({ cardId, isPublic = false }: WalletPassButtonsProps) {
  const [appleUrl, setAppleUrl] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPassUrls() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/passes?cardId=${cardId}&public=${isPublic}`);
        if (res.ok) {
          const data = await res.json();
          setAppleUrl(data.appleUrl);
          setGoogleUrl(data.googleUrl);
        }
      } catch (err) {
        console.error("Failed to fetch passes:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (cardId) {
      fetchPassUrls();
    }
  }, [cardId, isPublic]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate passes");

      setAppleUrl(data.appleUrl);
      setGoogleUrl(data.googleUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 justify-center py-4">
        <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
      </div>
    );
  }

  // If public view and no passes exist, don't show the generator button
  if (isPublic && !appleUrl && !googleUrl) {
    return null; 
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mt-4">
      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg text-center">
          {error}
        </div>
      )}

      {appleUrl || googleUrl ? (
        <div className="flex flex-col gap-2">
          {appleUrl && (
            <a
              href={appleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-black hover:bg-neutral-900 text-white rounded-xl py-3 px-4 font-semibold text-sm transition"
            >
              <Apple className="w-5 h-5" />
              Add to Apple Wallet
            </a>
          )}
          {googleUrl && (
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-black hover:bg-neutral-900 text-white rounded-xl py-3 px-4 font-semibold text-sm transition"
            >
              <Smartphone className="w-5 h-5" />
              Save to Google Wallet
            </a>
          )}
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-black border border-black/[0.05] rounded-xl py-3 px-4 font-semibold text-sm transition disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
          Generate Wallet Passes
        </button>
      )}
    </div>
  );
}
