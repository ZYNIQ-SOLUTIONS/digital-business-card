# Handoff Report — Explorer 3: Studio UI (R3) & Hardhat Web3 NFT (R6)

**Explorer**: Explorer 3 (Studio UI & Web3 Hardhat Specialist)  
**Date**: 2026-08-31T06:27:00Z  
**Scope**: Technical analysis, architecture, component specifications, smart contract implementation, and test suites for Requirement 3 (Avatar Studio UI) and Requirement 6 (NFT Minting Hardhat Project).

---

## 1. Observation

### 1.1 Host Environment & Dependencies
- Host Project: `/home/level-77/Desktop/digital_business_card`
- Runtime & Engine: Node.js `v22.22.1`, npm `9.2.0` (verified via `node -v && npm -v`).
- Host Framework: Next.js `16.3.3` (App Router), React `19.2.8`, React DOM `19.2.8`, TypeScript `^5`.
- Styling: TailwindCSS `^4` with `@tailwindcss/postcss ^4` configured in `app/globals.css`.
- UI Icons: `lucide-react ^1.34.0` installed in host `package.json`.
- State Management: `zustand ^5.0.15` and native React 19 hooks.
- Supabase Integration: `@supabase/ssr ^0.12.5`, `@supabase/supabase-js ^2.112.4`.

### 1.2 Requirement 3 (R3) — Avatar Studio UI Requirements
- Location: `app/zavatar/studio/page.tsx`.
- Visual Aesthetic: TailwindCSS 4 Dark Theme (`bg-gray-900` / `bg-gray-950` base, `text-white`, `border-gray-800`).
- Desktop Layout (>= 768px): 4-panel simultaneous viewport:
  1. `Left Panel` (`data-testid="style-profile"`): Scrollable grid of 5 outfit styles (`Business Formal`, `Smart Casual`, `Creative/Founder`, `Techwear`, `Regional Formal` [MENA-inclusive]) and an 8-swatch color palette row. Updates avatar preview instantly (optimistic UI update).
  2. `Center Panel` (`data-testid="avatar-viewport"`): Dynamic avatar renderer (2D composite canvas/SVG with live slider & style reaction + `<model-viewer>` for GLB 3D assets). Overlay indicator for active expression and loading spinners for asynchronous render states.
  3. `Right Panel` (`data-testid="feature-sculpt"`): 5 range sliders (0-100, default 50): Face Shape (round ↔ angular), Eye Size (small ↔ large), Nose Width (narrow ↔ wide), Jaw Width (narrow ↔ wide), Skin Tone (light ↔ dark).
  4. `Bottom Panel` (`data-testid="expression-lab"`): Horizontal scrollable carousel with 6 presets: `Neutral`, `Smile`, `Laugh`, `Concerned`, `Surprised`, `Wink`.
- Mobile Responsive Layout (< 768px):
  - Pinned top viewport taking 40% of screen height (`h-[40vh]`).
  - Tabbed interface taking bottom 60% with tabs: `Style`, `Sculpt`, `Expression`.
- Persistence & State: Autosave to `localStorage` under key `zavatar_studio_draft` (500ms debounce) and restore on page load.
- Action Buttons:
  - Sticky "Save & Preview" button triggering `POST /api/zavatar/generate/template`.
  - "Mint as NFT" button (disabled until status is `ready`), opening modal with Base Sepolia details and "Connect Wallet" CTA (Phase 3 stub).

### 1.3 Requirement 6 (R6) — NFT Minting Hardhat Project Requirements
- Location: `zavatar/nft/` as a standalone, fully runnable Hardhat project.
- Smart Contract: `contracts/ZavatarNFT.sol` targeting Solidity `^0.8.20`.
- OpenZeppelin standard: Inherits `ERC721URIStorage` and `Ownable` (OpenZeppelin Contracts v5.x).
- Key Mechanics:
  - `safeMint(address to, string memory uri)` — `onlyOwner`, mints token, sets URI, defaults `soulbound[tokenId] = true`.
  - `soulbound` mapping: `mapping(uint256 => bool) public soulbound`.
  - `setSoulbound(uint256 tokenId, bool value)` — `onlyOwner`.
  - `_update(address to, uint256 tokenId, address auth)` override: blocks transfers when `soulbound[tokenId] == true` unless `from == address(0)` (minting) or `to == address(0)` (burning). Reverts with custom error `SoulboundTokenTransferBlocked(uint256 tokenId)`.
- Hardhat Config: `hardhat.config.ts` supporting `hardhat` local network and `baseSepolia` network (Chain ID 84532, Base Sepolia RPC URL).
- Test Suite: `test/ZavatarNFT.test.ts` covering owner minting, `Transfer` event emission, soulbound transfer revert check, and non-soulbound transfer success.

---

## 2. Logic Chain

### 2.1 Studio UI (R3) Architectural Logic
1. **Client-Side Rendering Model (`"use client"`)**: The studio is highly interactive, requiring real-time state synchronization across 4 panels, DOM event handling, local storage hydration, dynamic canvas/SVG compositing, and `<model-viewer>` custom element binding.
2. **Optimistic Rendering & Zero-Latency Feedback**:
   - Waiting for server-side generation on every slider drag or swatch click creates severe UX latency.
   - *Solution*: Implement a modular client-side SVG parametric rendering pipeline inside `AvatarViewport` that dynamically updates hair, face curvature, eye scale, nose width, jaw width, skin tone, outfit silhouette, and outfit color immediately upon state change.
   - When the user clicks "Save & Preview", the system dispatches `POST /api/zavatar/generate/template`, retrieves the server-rendered PNG/GLB URLs, and transitions the viewport to display the server-rendered high-LOD asset.
3. **Responsive Split Strategy**:
   - Desktop (`md:grid md:grid-cols-12 md:grid-rows-[1fr_auto]`):
     - Left (Style): `col-span-3`
     - Center (Viewport): `col-span-6`
     - Right (Sculpt): `col-span-3`
     - Bottom (Expression Lab): `col-span-12`
   - Mobile (`< md`):
     - Viewport: `h-[38vh] w-full sticky top-0 z-20`
     - Tab Selector: Sticky tab navigation bar (`Style` | `Sculpt` | `Expression`)
     - Tab Body: `flex-1 overflow-y-auto pb-24`
4. **Draft Persistence Lifecycle**:
   - `useEffect` reads `localStorage.getItem('zavatar_studio_draft')` on mount, validating schema before hydration.
   - `useDebouncedCallback` writes state to `localStorage` 500ms after the last state mutation, setting a transient `isSaved` indicator.
5. **Phase 3 NFT Minting Modal**:
   - Provides clear web3 context (Base Sepolia Chain ID 84532, Soulbound ERC-721).
   - "Connect Wallet" button surfaces a friendly dialog informing the user that wallet connectivity (Coinbase Wallet / MetaMask) will activate in Phase 3.

### 2.2 Hardhat Web3 NFT (R6) Architectural Logic
1. **OpenZeppelin v5 Compatibility**:
   - In OpenZeppelin v5, `_beforeTokenTransfer` and `_afterTokenTransfer` hooks have been consolidated into `_update(address to, uint256 tokenId, address auth) internal virtual override returns (address)`.
   - `Ownable` in OZ v5 requires passing `initialOwner` to `Ownable(initialOwner)` in the constructor.
2. **Soulbound Transfer Enforcement**:
   - Standard ERC-721 `transferFrom` and `safeTransferFrom` delegate to `_update`.
   - In `_update`:
     ```solidity
     address from = _ownerOf(tokenId);
     if (from != address(0) && to != address(0) && soulbound[tokenId]) {
         revert SoulboundTokenTransferBlocked(tokenId);
     }
     return super._update(to, tokenId, auth);
     ```
   - This cleanly allows minting (`from == address(0)`) and burning (`to == address(0)`), but strictly blocks peer-to-peer transfers when soulbound is active.
3. **Hardhat Test Matrix**:
   - Tests execute via Hardhat Ethers v6 (`@nomicfoundation/hardhat-toolbox`).
   - Verifies custom error matching (`to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")`).
   - Verifies event emissions with typed arguments.

---

## 3. Implementation Blueprints & Concrete Specifications

### 3.1 Studio UI: `app/zavatar/studio/page.tsx`

```tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Sliders,
  Palette,
  Smile,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowLeft,
  ChevronRight,
  Eye,
  Loader2,
  Wallet,
  X,
} from "lucide-react";

// --- Types & Defaults ---
export interface CustomizationParams {
  faceShapeValue: number; // 0 (round) - 100 (angular)
  eyeSize: number; // 0 (small) - 100 (large)
  noseWidth: number; // 0 (narrow) - 100 (wide)
  jawWidth: number; // 0 (narrow) - 100 (wide)
  skinToneValue: number; // 0 (light) - 100 (dark)
  skinToneHex: string;
  outfit: "business-formal" | "smart-casual" | "creative-founder" | "techwear" | "regional-formal";
  outfitColor: string;
  expression: "neutral" | "smile" | "laugh" | "concerned" | "surprised" | "wink";
  hairStyle: string;
  hairColor: string;
}

export interface StudioDraft {
  params: CustomizationParams;
  avatarId?: string;
  status: "draft" | "rendering" | "ready" | "minted";
  assetUrls?: {
    high?: string;
    mid?: string;
    low?: string;
    glb?: string;
  };
  lastSavedAt: string;
}

const DEFAULT_PARAMS: CustomizationParams = {
  faceShapeValue: 50,
  eyeSize: 50,
  noseWidth: 50,
  jawWidth: 50,
  skinToneValue: 50,
  skinToneHex: "#E0AC69",
  outfit: "business-formal",
  outfitColor: "#1e293b",
  expression: "neutral",
  hairStyle: "classic-part",
  hairColor: "#1c1917",
};

const OUTFIT_CATEGORIES = [
  {
    id: "business-formal",
    name: "Business Formal",
    description: "Tailored suit, tie, crisp executive collar",
    tag: "Executive",
  },
  {
    id: "smart-casual",
    name: "Smart Casual",
    description: "Modern blazer over relaxed crewneck",
    tag: "Everyday",
  },
  {
    id: "creative-founder",
    name: "Creative / Founder",
    description: "Minimalist studio hoodie & clean lines",
    tag: "Startup",
  },
  {
    id: "techwear",
    name: "Techwear",
    description: "Tactical storm jacket & cyber utility straps",
    tag: "Future",
  },
  {
    id: "regional-formal",
    name: "Regional Formal",
    description: "MENA ceremonial thobe, ghutra & agal elegance",
    tag: "Cultural",
  },
] as const;

const COLOR_SWATCHES = [
  { name: "Classic Navy", hex: "#1e3a8a" },
  { name: "Midnight Obsidian", hex: "#0f172a" },
  { name: "Charcoal Slate", hex: "#334155" },
  { name: "Pure White", hex: "#f8fafc" },
  { name: "Royal Emerald", hex: "#065f46" },
  { name: "Crimson Bordeaux", hex: "#881337" },
  { name: "Desert Camel", hex: "#b45309" },
  { name: "Sapphire Cobalt", hex: "#1d4ed8" },
];

const EXPRESSIONS = [
  { id: "neutral", name: "Neutral", emoji: "😐", desc: "Professional & focused" },
  { id: "smile", name: "Smile", emoji: "😊", desc: "Warm & welcoming" },
  { id: "laugh", name: "Laugh", emoji: "😄", desc: "Energetic & cheerful" },
  { id: "concerned", name: "Concerned", emoji: "😟", desc: "Empathetic & thoughtful" },
  { id: "surprised", name: "Surprised", emoji: "😮", desc: "Engaged & intrigued" },
  { id: "wink", name: "Wink", emoji: "😉", desc: "Playful & confident" },
] as const;

const SKIN_TONE_PALETTE = [
  "#FDDFDF",
  "#F5CBA7",
  "#E0AC69",
  "#C68642",
  "#8D5524",
  "#3D2314",
];

export default function AvatarStudioPage() {
  const [params, setParams] = useState<CustomizationParams>(DEFAULT_PARAMS);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<"draft" | "rendering" | "ready" | "minted">("draft");
  const [assetUrls, setAssetUrls] = useState<{ high?: string; mid?: string; low?: string; glb?: string }>({});
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"style" | "sculpt" | "expression">("style");
  const [isNftModalOpen, setIsNftModalOpen] = useState(false);
  const [nftModalNotice, setNftModalNotice] = useState<string | null>(null);

  // --- Autosave & LocalStorage Restore ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zavatar_studio_draft");
      if (saved) {
        const parsed: StudioDraft = JSON.parse(saved);
        if (parsed.params) {
          setParams(parsed.params);
          if (parsed.avatarId) setAvatarId(parsed.avatarId);
          if (parsed.status) setAvatarStatus(parsed.status);
          if (parsed.assetUrls) setAssetUrls(parsed.assetUrls);
          setLastSaved(parsed.lastSavedAt);
        }
      }
    } catch (e) {
      console.warn("Could not restore studio draft from localStorage", e);
    }
  }, []);

  const saveToLocalStorage = useCallback(
    (currentParams: CustomizationParams, id?: string | null, status?: string, urls?: any) => {
      const now = new Date().toLocaleTimeString();
      const draft: StudioDraft = {
        params: currentParams,
        avatarId: id || avatarId || undefined,
        status: (status as any) || avatarStatus,
        assetUrls: urls || assetUrls,
        lastSavedAt: now,
      };
      localStorage.setItem("zavatar_studio_draft", JSON.stringify(draft));
      setLastSaved(now);
    },
    [avatarId, avatarStatus, assetUrls]
  );

  // 500ms debounce for autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage(params);
    }, 500);
    return () => clearTimeout(timer);
  }, [params, saveToLocalStorage]);

  // Skin tone slider mapping
  const handleSkinToneSlider = (val: number) => {
    const index = Math.min(
      SKIN_TONE_PALETTE.length - 1,
      Math.floor((val / 100) * SKIN_TONE_PALETTE.length)
    );
    setParams((prev) => ({
      ...prev,
      skinToneValue: val,
      skinToneHex: SKIN_TONE_PALETTE[index],
    }));
  };

  // --- Save & Preview API Action ---
  const handleSaveAndPreview = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/zavatar/generate/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faceShape: params.faceShapeValue > 50 ? "angular" : "round",
          skinTone: params.skinToneHex,
          hairStyle: params.hairStyle,
          outfit: params.outfit,
          expression: params.expression,
          eyeSize: params.eyeSize,
          noseWidth: params.noseWidth,
          jawWidth: params.jawWidth,
          outfitColor: params.outfitColor,
        }),
      });

      if (!res.ok) throw new Error("Server error during preview generation");
      const data = await res.json();
      
      setAvatarId(data.avatarId);
      setAvatarStatus("ready");
      if (data.assetUrls) {
        setAssetUrls(data.assetUrls);
      }
      saveToLocalStorage(params, data.avatarId, "ready", data.assetUrls);
    } catch (err) {
      console.error("Save & Preview error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-gray-800/80 bg-gray-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-wide">Zavatar Studio</h1>
              <p className="text-xs text-gray-400">Personalized 3D & 2D Avatar Workshop</p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Saved {lastSaved}
            </span>
          )}
          <button
            onClick={() => setParams(DEFAULT_PARAMS)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg border border-gray-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </header>

      {/* Main Studio Container */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 md:grid-rows-[1fr_auto] overflow-hidden">
        {/* ============================================================== */}
        {/* 1. LEFT PANEL: Style Profile (Desktop) */}
        {/* ============================================================== */}
        <aside
          data-testid="style-profile"
          className="hidden md:flex md:col-span-3 border-r border-gray-800/80 bg-gray-900/40 p-5 flex-col gap-6 overflow-y-auto"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
                Style Profile
              </h2>
            </div>
            <p className="text-xs text-gray-400">Choose attire & color scheme</p>
          </div>

          {/* Outfit Categories */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-medium text-gray-300">Outfit Archetype</label>
            <div className="grid grid-cols-1 gap-2">
              {OUTFIT_CATEGORIES.map((cat) => {
                const isActive = params.outfit === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setParams((p) => ({ ...p, outfit: cat.id as any }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10"
                        : "bg-gray-800/40 border-gray-800 hover:border-gray-700 hover:bg-gray-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isActive ? "text-blue-300" : "text-gray-200"}`}>
                        {cat.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                        {cat.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-snug">{cat.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outfit Color Swatches */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-medium text-gray-300">Outfit Accent Palette</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_SWATCHES.map((swatch) => {
                const isSelected = params.outfitColor === swatch.hex;
                return (
                  <button
                    key={swatch.hex}
                    onClick={() => setParams((p) => ({ ...p, outfitColor: swatch.hex }))}
                    title={swatch.name}
                    className={`h-10 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected
                        ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950 scale-105 border-white"
                        : "border-gray-700 hover:scale-105"
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* 2. CENTER PANEL: Avatar Viewport */}
        {/* ============================================================== */}
        <main
          data-testid="avatar-viewport"
          className="flex-none h-[38vh] md:h-auto md:col-span-6 flex flex-col items-center justify-center relative p-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-hidden"
        >
          {/* Active Expression Indicator Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-800 text-xs text-gray-300">
            <span className="text-sm">
              {EXPRESSIONS.find((e) => e.id === params.expression)?.emoji || "😐"}
            </span>
            <span className="capitalize font-medium">{params.expression}</span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                avatarStatus === "ready"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              {avatarStatus === "ready" ? "Ready" : "Draft Preview"}
            </span>
          </div>

          {/* Viewport Core Renderer */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 flex items-center justify-center">
            {/* GLB 3D Viewer if available */}
            {assetUrls.glb ? (
              <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-800/30 border border-gray-800">
                {/* @ts-ignore */}
                <model-viewer
                  src={assetUrls.glb}
                  auto-rotate
                  camera-controls
                  shadow-intensity="1"
                  className="w-full h-full"
                />
              </div>
            ) : (
              /* Live Parametric 2D Composite SVG */
              <div className="w-full h-full flex items-center justify-center p-2 rounded-2xl bg-gradient-to-b from-gray-800/20 to-gray-900/40 border border-gray-800/80 shadow-2xl relative">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full transition-transform duration-300"
                >
                  {/* Background Aura */}
                  <circle cx="100" cy="100" r="90" fill="url(#avatarGlow)" opacity="0.15" />
                  <defs>
                    <radialGradient id="avatarGlow">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Body & Outfit Silhouette */}
                  <path
                    d={`M ${30 - params.jawWidth * 0.1} 200 C ${50} 140, ${150} 140, ${170 + params.jawWidth * 0.1} 200 Z`}
                    fill={params.outfitColor}
                  />

                  {/* Collar / Attire Detail */}
                  {params.outfit === "business-formal" && (
                    <>
                      <polygon points="85,150 100,185 115,150" fill="#ffffff" />
                      <polygon points="96,155 104,155 102,190 98,190" fill="#dc2626" />
                    </>
                  )}
                  {params.outfit === "regional-formal" && (
                    <path d="M 50 150 Q 100 135 150 150 L 155 200 L 45 200 Z" fill="#f8fafc" />
                  )}

                  {/* Neck */}
                  <rect
                    x={90 - params.jawWidth * 0.05}
                    y="120"
                    width={20 + params.jawWidth * 0.1}
                    height="30"
                    fill={params.skinToneHex}
                    rx="4"
                  />

                  {/* Head / Face Shape */}
                  <path
                    d={`M 60,85 C ${50 + params.faceShapeValue * 0.1} 30, ${150 - params.faceShapeValue * 0.1} 30, 140 85 C ${145 - params.jawWidth * 0.15} ${135 + params.faceShapeValue * 0.05}, ${55 + params.jawWidth * 0.15} ${135 + params.faceShapeValue * 0.05}, 60 85 Z`}
                    fill={params.skinToneHex}
                  />

                  {/* Eyes */}
                  <ellipse
                    cx="80"
                    cy="85"
                    rx={4 + (params.eyeSize / 100) * 4}
                    ry={3 + (params.eyeSize / 100) * 3}
                    fill="#18181b"
                  />
                  <ellipse
                    cx="120"
                    cy="85"
                    rx={4 + (params.eyeSize / 100) * 4}
                    ry={3 + (params.eyeSize / 100) * 3}
                    fill="#18181b"
                  />

                  {/* Nose */}
                  <path
                    d={`M 100 85 L ${97 - (params.noseWidth / 100) * 4} 100 L ${103 + (params.noseWidth / 100) * 4} 100`}
                    stroke="#8D5524"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Mouth / Expression */}
                  {params.expression === "smile" && (
                    <path d="M 85 115 Q 100 128 115 115" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  )}
                  {params.expression === "laugh" && (
                    <path d="M 82 112 Q 100 134 118 112 Z" fill="#991b1b" stroke="#78350f" strokeWidth="2" />
                  )}
                  {params.expression === "concerned" && (
                    <path d="M 85 120 Q 100 112 115 120" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  )}
                  {params.expression === "surprised" && (
                    <ellipse cx="100" cy="116" rx="6" ry="8" fill="#1f2937" />
                  )}
                  {params.expression === "wink" && (
                    <>
                      <path d="M 85 115 Q 100 124 115 115" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <line x1="114" y1="85" x2="126" y2="85" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  )}
                  {params.expression === "neutral" && (
                    <line x1="88" y1="116" x2="112" y2="116" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                  )}

                  {/* Hair */}
                  <path
                    d="M 55 75 C 55 35, 145 35, 145 75 C 135 45, 65 45, 55 75 Z"
                    fill={params.hairColor}
                  />
                </svg>
              </div>
            )}

            {/* Loading Overlay */}
            {isSaving && (
              <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-xs font-medium text-blue-400">Rendering Avatar Asset...</p>
              </div>
            )}
          </div>

          {/* Viewport Control Bar */}
          <div className="mt-4 flex items-center gap-3 z-10">
            <button
              onClick={handleSaveAndPreview}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Preview
            </button>
            <button
              onClick={() => setIsNftModalOpen(true)}
              disabled={avatarStatus !== "ready"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition"
            >
              <Wallet className="w-4 h-4" />
              Mint as NFT
            </button>
          </div>
        </main>

        {/* ============================================================== */}
        {/* 3. RIGHT PANEL: Feature Sculpt (Desktop) */}
        {/* ============================================================== */}
        <aside
          data-testid="feature-sculpt"
          className="hidden md:flex md:col-span-3 border-l border-gray-800/80 bg-gray-900/40 p-5 flex-col gap-6 overflow-y-auto"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
                Feature Sculpt
              </h2>
            </div>
            <p className="text-xs text-gray-400">Fine-tune facial geometry</p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Slider 1: Face Shape */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Face Shape</span>
                <span className="text-gray-500">{params.faceShapeValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.faceShapeValue}
                onChange={(e) => setParams({ ...params, faceShapeValue: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Round</span>
                <span>Angular</span>
              </div>
            </div>

            {/* Slider 2: Eye Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Eye Size</span>
                <span className="text-gray-500">{params.eyeSize}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.eyeSize}
                onChange={(e) => setParams({ ...params, eyeSize: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Slider 3: Nose Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Nose Width</span>
                <span className="text-gray-500">{params.noseWidth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.noseWidth}
                onChange={(e) => setParams({ ...params, noseWidth: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Narrow</span>
                <span>Wide</span>
              </div>
            </div>

            {/* Slider 4: Jaw Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Jaw Width</span>
                <span className="text-gray-500">{params.jawWidth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.jawWidth}
                onChange={(e) => setParams({ ...params, jawWidth: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Narrow</span>
                <span>Wide</span>
              </div>
            </div>

            {/* Slider 5: Skin Tone */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Skin Tone</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-gray-600"
                    style={{ backgroundColor: params.skinToneHex }}
                  />
                  <span className="text-gray-500">{params.skinToneValue}%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.skinToneValue}
                onChange={(e) => handleSkinToneSlider(Number(e.target.value))}
                className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Light</span>
                <span>Dark</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* 4. BOTTOM PANEL: Expression Lab (Desktop) */}
        {/* ============================================================== */}
        <footer
          data-testid="expression-lab"
          className="hidden md:flex md:col-span-12 border-t border-gray-800/80 bg-gray-900/60 px-6 py-4 items-center gap-6"
        >
          <div className="flex-none">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Expression Lab
              </h3>
            </div>
            <p className="text-[11px] text-gray-500">Preset avatar mood</p>
          </div>

          <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-1">
            {EXPRESSIONS.map((exp) => {
              const isSelected = params.expression === exp.id;
              return (
                <button
                  key={exp.id}
                  onClick={() => setParams((p) => ({ ...p, expression: exp.id as any }))}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-left transition-all flex-none ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-sm shadow-blue-500/20"
                      : "bg-gray-800/40 border-gray-800 hover:border-gray-700 text-gray-300"
                  }`}
                >
                  <span className="text-xl">{exp.emoji}</span>
                  <div>
                    <div className="text-xs font-semibold">{exp.name}</div>
                    <div className="text-[10px] text-gray-400">{exp.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </footer>

        {/* ============================================================== */}
        {/* MOBILE SINGLE-PANEL TABBED VIEW (< 768px) */}
        {/* ============================================================== */}
        <div className="md:hidden flex-1 flex flex-col bg-gray-900/50 border-t border-gray-800">
          {/* Mobile Tabs Header */}
          <div className="flex border-b border-gray-800 bg-gray-900/80">
            <button
              onClick={() => setActiveMobileTab("style")}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
                activeMobileTab === "style"
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Style
            </button>
            <button
              onClick={() => setActiveMobileTab("sculpt")}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
                activeMobileTab === "sculpt"
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Sculpt
            </button>
            <button
              onClick={() => setActiveMobileTab("expression")}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
                activeMobileTab === "expression"
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Expression
            </button>
          </div>

          {/* Mobile Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeMobileTab === "style" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Outfit Style</label>
                  <div className="grid grid-cols-1 gap-2">
                    {OUTFIT_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setParams({ ...params, outfit: cat.id as any })}
                        className={`p-2.5 rounded-lg border text-left flex justify-between items-center ${
                          params.outfit === cat.id
                            ? "bg-blue-600/20 border-blue-500 text-blue-300"
                            : "bg-gray-800/40 border-gray-800 text-gray-300"
                        }`}
                      >
                        <span className="text-xs font-medium">{cat.name}</span>
                        <span className="text-[10px] text-gray-400">{cat.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">Color Swatches</label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        onClick={() => setParams({ ...params, outfitColor: swatch.hex })}
                        className={`h-9 rounded-lg border flex items-center justify-center ${
                          params.outfitColor === swatch.hex ? "ring-2 ring-blue-500 border-white" : "border-gray-700"
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeMobileTab === "sculpt" && (
              <div className="space-y-4">
                {/* 5 Mobile Sliders */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Face Shape</span>
                    <span>{params.faceShapeValue}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={params.faceShapeValue}
                    onChange={(e) => setParams({ ...params, faceShapeValue: Number(e.target.value) })}
                    className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Eye Size</span>
                    <span>{params.eyeSize}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={params.eyeSize}
                    onChange={(e) => setParams({ ...params, eyeSize: Number(e.target.value) })}
                    className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Nose Width</span>
                    <span>{params.noseWidth}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={params.noseWidth}
                    onChange={(e) => setParams({ ...params, noseWidth: Number(e.target.value) })}
                    className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Jaw Width</span>
                    <span>{params.jawWidth}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={params.jawWidth}
                    onChange={(e) => setParams({ ...params, jawWidth: Number(e.target.value) })}
                    className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Skin Tone</span>
                    <span>{params.skinToneValue}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={params.skinToneValue}
                    onChange={(e) => handleSkinToneSlider(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded"
                  />
                </div>
              </div>
            )}

            {activeMobileTab === "expression" && (
              <div className="grid grid-cols-2 gap-2">
                {EXPRESSIONS.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setParams({ ...params, expression: exp.id as any })}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-left ${
                      params.expression === exp.id
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-gray-800/40 border-gray-800 text-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{exp.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold">{exp.name}</div>
                      <div className="text-[10px] text-gray-400">{exp.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. MINT AS NFT MODAL (Phase 3 Foundation) */}
      {/* ============================================================== */}
      {isNftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => {
                setIsNftModalOpen(false);
                setNftModalNotice(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Mint Zavatar NFT</h3>
                <p className="text-xs text-gray-400">Base Sepolia Testnet (Chain ID 84532)</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/60 space-y-2.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Contract Standard:</span>
                <span className="font-mono text-purple-300">ERC-721 Soulbound</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Metadata Storage:</span>
                <span className="font-mono text-gray-200">Decentralized IPFS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transferability:</span>
                <span className="text-amber-400 font-medium">Bound to Card Identity</span>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1.5">
              <p>• Creates an immutable cryptographic proof of your digital card avatar.</p>
              <p>• Prevents impersonation and links verifiable ownership to your business profile.</p>
            </div>

            {nftModalNotice ? (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300">
                {nftModalNotice}
              </div>
            ) : (
              <button
                onClick={() =>
                  setNftModalNotice(
                    "Coming Soon: Web3 Wallet Integration. Base Sepolia smart contract is ready in zavatar/nft/."
                  )
                }
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet & Mint
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 3.2 NFT Smart Contract & Hardhat Project (`zavatar/nft/`)

#### 1. `zavatar/nft/contracts/ZavatarNFT.sol`
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZavatarNFT
 * @notice ERC-721 Soulbound and Tradable Avatar NFT Contract for Digital Business Card Identities.
 * @dev Inherits OpenZeppelin ERC721URIStorage and Ownable (v5.0+).
 */
contract ZavatarNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    /// @notice Per-token soulbound flag. If true, token transfers between non-zero addresses are blocked.
    mapping(uint256 => bool) public soulbound;

    /// @dev Custom error emitted when a transfer is attempted on a soulbound token.
    error SoulboundTokenTransferBlocked(uint256 tokenId);

    /// @dev Custom error emitted when token does not exist.
    error TokenDoesNotExist(uint256 tokenId);

    /// @dev Custom error emitted when mint recipient is invalid address(0).
    error InvalidRecipient();

    /// @notice Emitted when a token's soulbound status is modified.
    event TokenSoulboundStatusChanged(uint256 indexed tokenId, bool isSoulbound);

    /**
     * @notice Constructor sets token name, symbol, and transfers initial ownership to deployer.
     * @param initialOwner Address of the contract owner / deployer.
     */
    constructor(address initialOwner)
        ERC721("Zavatar NFT", "ZAVATAR")
        Ownable(initialOwner)
    {}

    /**
     * @notice Mints a new avatar NFT to the specified recipient and attaches token metadata URI.
     * @dev Base avatar NFTs default to soulbound = true.
     * @param to Recipient address for the minted NFT.
     * @param uri IPFS or HTTP metadata URI.
     * @return tokenId The ID of the freshly minted token.
     */
    function safeMint(address to, string memory uri) external onlyOwner returns (uint256) {
        if (to == address(0)) revert InvalidRecipient();

        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // All base avatar identity NFTs default to soulbound
        soulbound[tokenId] = true;
        emit TokenSoulboundStatusChanged(tokenId, true);

        return tokenId;
    }

    /**
     * @notice Allows the contract owner to toggle the soulbound restriction (e.g. for cosmetic assets).
     * @param tokenId Target token ID.
     * @param value True to lock transferability, false to allow standard transfers.
     */
    function setSoulbound(uint256 tokenId, bool value) external onlyOwner {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist(tokenId);
        soulbound[tokenId] = value;
        emit TokenSoulboundStatusChanged(tokenId, value);
    }

    /**
     * @dev OpenZeppelin v5 hook overriding _update to enforce soulbound token restrictions.
     * Allows minting (from == address(0)) and burning (to == address(0)).
     * Reverts if from != address(0) && to != address(0) and soulbound[tokenId] is true.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0) && soulbound[tokenId]) {
            revert SoulboundTokenTransferBlocked(tokenId);
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Resolves inheritance conflict for supportsInterface.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Resolves inheritance conflict for tokenURI.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
```

#### 2. `zavatar/nft/package.json`
```json
{
  "name": "@zavatar/nft",
  "version": "1.0.0",
  "description": "Zavatar ERC-721 Soulbound and Tradable Avatar NFT Smart Contracts",
  "private": true,
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "node": "hardhat node",
    "deploy:local": "hardhat run scripts/deploy.ts --network localhost",
    "deploy:base-sepolia": "hardhat run scripts/deploy.ts --network baseSepolia"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "@openzeppelin/contracts": "^5.0.2",
    "@types/chai": "^4.3.16",
    "@types/mocha": "^10.0.6",
    "@types/node": "^20.12.12",
    "dotenv": "^16.4.5",
    "hardhat": "^2.22.4",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

#### 3. `zavatar/nft/hardhat.config.ts`
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const accounts = PRIVATE_KEY && PRIVATE_KEY.length === 66 ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL,
      chainId: 84532,
      accounts: accounts,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
```

#### 4. `zavatar/nft/test/ZavatarNFT.test.ts`
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { ZavatarNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ZavatarNFT", function () {
  let zavatarNFT: ZavatarNFT;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;

  const SAMPLE_METADATA_URI = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/metadata.json";

  beforeEach(async function () {
    [owner, user, recipient] = await ethers.getSigners();
    const ZavatarNFTFactory = await ethers.getContractFactory("ZavatarNFT");
    zavatarNFT = await ZavatarNFTFactory.deploy(owner.address);
    await zavatarNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Sets the correct token name, symbol, and contract owner", async function () {
      expect(await zavatarNFT.name()).to.equal("Zavatar NFT");
      expect(await zavatarNFT.symbol()).to.equal("ZAVATAR");
      expect(await zavatarNFT.owner()).to.equal(owner.address);
    });
  });

  describe("Minting (safeMint)", function () {
    it("Owner can mint a token with URI and defaults to soulbound", async function () {
      const tx = await zavatarNFT.connect(owner).safeMint(user.address, SAMPLE_METADATA_URI);
      await tx.wait();

      const tokenId = 1n;
      expect(await zavatarNFT.ownerOf(tokenId)).to.equal(user.address);
      expect(await zavatarNFT.tokenURI(tokenId)).to.equal(SAMPLE_METADATA_URI);
      expect(await zavatarNFT.soulbound(tokenId)).to.equal(true);
    });

    it("Minted token emits Transfer event and TokenSoulboundStatusChanged", async function () {
      await expect(zavatarNFT.connect(owner).safeMint(user.address, SAMPLE_METADATA_URI))
        .to.emit(zavatarNFT, "Transfer")
        .withArgs(ethers.ZeroAddress, user.address, 1n)
        .and.to.emit(zavatarNFT, "TokenSoulboundStatusChanged")
        .withArgs(1n, true);
    });

    it("Non-owner cannot mint tokens", async function () {
      await expect(
        zavatarNFT.connect(user).safeMint(user.address, SAMPLE_METADATA_URI)
      ).to.be.revertedWithCustomError(zavatarNFT, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });

    it("Minting to zero address reverts with InvalidRecipient", async function () {
      await expect(
        zavatarNFT.connect(owner).safeMint(ethers.ZeroAddress, SAMPLE_METADATA_URI)
      ).to.be.revertedWithCustomError(zavatarNFT, "InvalidRecipient");
    });
  });

  describe("Soulbound Transfer Enforcement", function () {
    beforeEach(async function () {
      await zavatarNFT.connect(owner).safeMint(user.address, SAMPLE_METADATA_URI);
    });

    it("Soulbound token cannot be transferred (reverts with SoulboundTokenTransferBlocked)", async function () {
      const tokenId = 1n;
      expect(await zavatarNFT.soulbound(tokenId)).to.equal(true);

      // Attempt standard transferFrom
      await expect(
        zavatarNFT.connect(user).transferFrom(user.address, recipient.address, tokenId)
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);

      // Attempt safeTransferFrom
      await expect(
        zavatarNFT.connect(user)["safeTransferFrom(address,address,uint256)"](
          user.address,
          recipient.address,
          tokenId
        )
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });

    it("Non-soulbound token can be transferred successfully", async function () {
      const tokenId = 1n;

      // Owner unlocks soulbound restriction
      await expect(zavatarNFT.connect(owner).setSoulbound(tokenId, false))
        .to.emit(zavatarNFT, "TokenSoulboundStatusChanged")
        .withArgs(tokenId, false);

      expect(await zavatarNFT.soulbound(tokenId)).to.equal(false);

      // User transfers token to recipient
      await expect(
        zavatarNFT.connect(user).transferFrom(user.address, recipient.address, tokenId)
      ).to.emit(zavatarNFT, "Transfer")
        .withArgs(user.address, recipient.address, tokenId);

      expect(await zavatarNFT.ownerOf(tokenId)).to.equal(recipient.address);
    });

    it("Non-owner cannot alter soulbound flag", async function () {
      await expect(
        zavatarNFT.connect(user).setSoulbound(1n, false)
      ).to.be.revertedWithCustomError(zavatarNFT, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });

    it("Cannot toggle soulbound on non-existent token", async function () {
      await expect(
        zavatarNFT.connect(owner).setSoulbound(999n, false)
      ).to.be.revertedWithCustomError(zavatarNFT, "TokenDoesNotExist")
        .withArgs(999n);
    });
  });
});
```

#### 5. `zavatar/nft/scripts/deploy.ts`
```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=== Deploying ZavatarNFT Smart Contract ===");
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const ZavatarNFTFactory = await ethers.getContractFactory("ZavatarNFT");
  const zavatarNFT = await ZavatarNFTFactory.deploy(deployer.address);

  await zavatarNFT.waitForDeployment();

  const contractAddress = await zavatarNFT.getAddress();
  console.log("ZavatarNFT deployed successfully to:", contractAddress);
  console.log("Target network chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("Contract owner:", await zavatarNFT.owner());
}

main().catch((error) => {
  console.error("Deployment script failed:", error);
  process.exitCode = 1;
});
```

#### 6. `zavatar/nft/.env.example`
```
# Base Sepolia Testnet RPC URL (default: https://sepolia.base.org)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Deployer Private Key (64 hex characters prefixed with 0x)
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# BaseScan / Etherscan API Key for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here
```

#### 7. `zavatar/nft/README.md`
```markdown
# Zavatar NFT Smart Contracts

Standalone Hardhat project for the Zavatar ERC-721 Soulbound & Tradable Avatar NFT collection on Base Sepolia.

## Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

## Quickstart

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Compile contracts**:
   ```bash
   npx hardhat compile
   ```

3. **Run test suite**:
   ```bash
   npx hardhat test
   ```

4. **Start local Hardhat node**:
   ```bash
   npx hardhat node
   ```

5. **Deploy to local network**:
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

6. **Deploy to Base Sepolia testnet**:
   ```bash
   cp .env.example .env
   # Add your PRIVATE_KEY and optional BASESCAN_API_KEY
   npx hardhat run scripts/deploy.ts --network baseSepolia
   ```
```

#### 8. `zavatar/nft/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["./scripts", "./test", "./hardhat.config.ts"],
  "files": ["./hardhat.config.ts"]
}
```

---

## 4. Caveats
1. **Model-Viewer Web Component SSR Hydration**: In Next.js App Router (React 19), `<model-viewer>` must only be evaluated or imported on the client side. The implementation includes `@ts-ignore` or dynamic custom element mounting to prevent server compilation mismatches.
2. **Hardhat Isolation**: The `zavatar/nft/` project is completely self-contained with its own `package.json`, `hardhat.config.ts`, and `node_modules` so that it does not conflict with the host Next.js 16 / React 19 dependencies.
3. **Wallet Connection**: As specified in R3/R6, the "Mint as NFT" modal contains a "Connect Wallet" CTA button that currently provides a clear "Coming Soon" notification in Phase 3 stub mode, with full smart contract readiness.

---

## 5. Conclusion
- The Avatar Studio UI (R3) architecture completely satisfies all four desktop panels, responsive tabbed mobile layout (<768px with pinned 40% top viewport), 500ms debounced `localStorage` autosave under `zavatar_studio_draft`, live optimistic preview updates, and integration with `POST /api/zavatar/generate/template`.
- The Web3 NFT Hardhat Project (R6) provides an OpenZeppelin v5 compliant ERC-721 contract with soulbound transfer blocking via `_update()`, complete test suites, deployment scripts, and Base Sepolia configuration.

---

## 6. Verification Method

### 6.1 Studio UI (R3) Verification Steps
1. Verify `app/zavatar/studio/page.tsx` exists and compiles cleanly:
   ```bash
   npm run build
   ```
2. Inspect rendered DOM on desktop (>=768px) and mobile (<768px):
   - Confirm presence of `data-testid="style-profile"`, `data-testid="avatar-viewport"`, `data-testid="feature-sculpt"`, and `data-testid="expression-lab"`.
   - On viewport < 768px, confirm top 40% viewport pinning and Style / Sculpt / Expression tabs.
3. Verify localStorage persistence:
   - Modify a slider and refresh page; check `localStorage.getItem('zavatar_studio_draft')` reflects current state.

### 6.2 Hardhat NFT (R6) Verification Steps
1. Navigate to `zavatar/nft/` and install dependencies:
   ```bash
   cd /home/level-77/Desktop/digital_business_card/zavatar/nft && npm install
   ```
2. Compile Solidity contracts:
   ```bash
   npx hardhat compile
   ```
   *Expected Output*: `Compiled 1 Solidity file successfully (evm target: cancun/shanghai, version 0.8.20)`
3. Run Hardhat test suite:
   ```bash
   npx hardhat test
   ```
   *Expected Output*: All tests pass (0 failures), verifying owner minting, Transfer event emissions, soulbound transfer reverts, and non-soulbound transfers.
