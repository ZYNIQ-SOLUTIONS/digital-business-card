"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Smartphone, 
  Share, 
  PlusSquare, 
  Download, 
  Check, 
  Copy, 
  ExternalLink, 
  Monitor, 
  Laptop,
  Layers
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface AddToHomescreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: {
    type: "dashboard" | "card";
    title: string;
    slug?: string;
    url?: string;
  };
}

export function AddToHomescreenModal({
  isOpen,
  onClose,
  target = {
    type: "dashboard",
    title: "IZN Dashboard",
    url: "/dashboard",
  },
}: AddToHomescreenModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<"ios" | "android" | "desktop">("ios");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already running as installed PWA
    if (typeof window !== "undefined") {
      const isPWA = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(isPWA));

      // Detect user platform
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActivePlatform("ios");
      } else if (/android/.test(ua)) {
        setActivePlatform("android");
      } else {
        setActivePlatform("desktop");
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = target.slug ? `${origin}/${target.slug}` : `${origin}${target.url || "/dashboard"}`;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-black/[0.08] relative overflow-hidden flex flex-col space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-md flex items-center justify-center p-2.5">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeLinecap="round" />
                <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#10b981" strokeWidth="16" strokeLinecap="round" />
                <circle cx="100" cy="100" r="16" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
                {target.type === "card" ? `Add "${target.title}" Shortcut` : "Add Dashboard to Home Screen"}
              </h3>
              <p className="text-xs text-gray-500">
                {target.type === "card"
                  ? "Direct one-tap access to your digital card on your phone."
                  : "Launch IZN directly like a native mobile app on any device."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Native 1-click Install (if supported by browser) */}
        {deferredPrompt && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 via-emerald-600/10 to-cyan-600/10 border border-violet-500/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-violet-600" />
                Instant Install Supported
              </span>
              <p className="text-[11px] text-gray-500">Your browser supports one-click install.</p>
            </div>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              Install Now
            </button>
          </div>
        )}

        {/* Platform Selector Tabs */}
        <div className="flex rounded-xl bg-neutral-100 p-1">
          <button
            type="button"
            onClick={() => setActivePlatform("ios")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePlatform === "ios"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            iOS (iPhone / iPad)
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform("android")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePlatform === "android"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            Android
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform("desktop")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePlatform === "desktop"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            Mac / PC
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-3 bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 text-xs text-neutral-700">
          {activePlatform === "ios" && (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-200 font-bold flex items-center justify-center text-[10px] text-neutral-900 shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-relaxed">
                  Open this link in <strong className="text-neutral-900">Safari</strong> and tap the <strong className="text-neutral-900 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline text-blue-600" /> Share</strong> button at the bottom of the screen.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-200 font-bold flex items-center justify-center text-[10px] text-neutral-900 shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-relaxed">
                  Scroll down the share sheet and tap <strong className="text-neutral-900 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline text-neutral-800" /> Add to Home Screen</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-200 font-bold flex items-center justify-center text-[10px] text-neutral-900 shrink-0 mt-0.5">
                  3
                </span>
                <p className="leading-relaxed">
                  Tap <strong className="text-neutral-900">Add</strong> in the top-right corner. The app icon will appear immediately on your home screen!
                </p>
              </div>
            </div>
          )}

          {activePlatform === "android" && (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-200 font-bold flex items-center justify-center text-[10px] text-neutral-900 shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-relaxed">
                  In <strong className="text-neutral-900">Chrome</strong>, tap the <strong className="text-neutral-900">⋮</strong> (three vertical dots) menu icon in the upper-right corner.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-200 font-bold flex items-center justify-center text-[10px] text-neutral-900 shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-relaxed">
                  Select <strong className="text-neutral-900">Install app</strong> or <strong className="text-neutral-900">Add to Home screen</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-200 font-bold flex items-center justify-center text-[10px] text-neutral-900 shrink-0 mt-0.5">
                  3
                </span>
                <p className="leading-relaxed">
                  Confirm by tapping <strong className="text-neutral-900">Install</strong>.
                </p>
              </div>
            </div>
          )}

          {activePlatform === "desktop" && (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-200 font-bold flex items-center justify-center text-[10px] text-neutral-900 shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-relaxed">
                  In <strong className="text-neutral-900">Chrome or Edge</strong>, click the <strong className="text-neutral-900">Install App</strong> icon on the right side of the address bar.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-200 font-bold flex items-center justify-center text-[10px] text-neutral-900 shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-relaxed">
                  In <strong className="text-neutral-900">Safari (macOS Sonoma+)</strong>: File &rarr; <strong className="text-neutral-900">Add to Dock</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Link Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>Copy Shortcut URL</span>
              </>
            )}
          </button>

          {target.slug && (
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <span>Open Live</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddToHomescreenModal;
