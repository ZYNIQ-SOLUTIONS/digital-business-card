"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MoreHorizontal,
  X,
  RotateCcw,
  ZoomIn,
  Move,
  Eye,
  Save,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Share2,
  Crown,
  Layers,
  User,
  Sliders,
  Smile,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomizationParams {
  outfit: "business-formal" | "smart-casual" | "creative-founder" | "techwear" | "regional-formal";
  outfitColor: string;
  expression: "neutral" | "smile" | "laugh" | "concerned" | "surprised" | "wink";
  hairStyle: "short-straight" | "short-curly" | "buzz-cut" | "long-wavy" | "bob" | "afro" | "side-part" | "bald";
  hairColor: string;
  skinToneHex: string;
  eyeSize: number;
  noseWidth: number;
  jawWidth: number;
  faceShapeValue: number;
  skinToneValue: number;
}

const DEFAULT_PARAMS: CustomizationParams = {
  outfit: "techwear",
  outfitColor: "#0f172a",
  expression: "neutral",
  hairStyle: "short-straight",
  hairColor: "#1c1917",
  skinToneHex: "#E0AC69",
  eyeSize: 50,
  noseWidth: 50,
  jawWidth: 50,
  faceShapeValue: 50,
  skinToneValue: 50,
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const OUTFITS = [
  {
    id: "techwear",
    name: "Cyber-Street",
    category: "Minimalist Techwear",
    tag: "Future",
    img: "/zavatar/outfits/techwear.jpg",
    accent: "#06b6d4",
  },
  {
    id: "business-formal",
    name: "Executive",
    category: "Business Formal",
    tag: "Executive",
    img: "/zavatar/outfits/business-formal.jpg",
    accent: "#6366f1",
  },
  {
    id: "smart-casual",
    name: "Urban Casual",
    category: "Smart Casual",
    tag: "Everyday",
    img: "/zavatar/outfits/smart-casual.jpg",
    accent: "#10b981",
  },
  {
    id: "creative-founder",
    name: "Studio Black",
    category: "Fashion Inspiration",
    tag: "Startup",
    img: "/zavatar/outfits/creative-founder.jpg",
    accent: "#f59e0b",
  },
  {
    id: "regional-formal",
    name: "Heritage",
    category: "Fashion Inspiration",
    tag: "Cultural",
    img: "/zavatar/outfits/regional-formal.jpg",
    accent: "#ec4899",
  },
] as const;

const COLOR_SWATCHES = [
  "#64748b", "#22d3ee", "#a855f7", "#ec4899", "#f59e0b",
  "#0f172a", "#e2e8f0", "#1e293b",
];

const EXPRESSIONS = [
  { id: "neutral",   name: "Neutral",   img: "/zavatar/expressions/neutral.jpg",   color: "#06b6d4" },
  { id: "smile",     name: "Smile",     img: "/zavatar/expressions/smile.jpg",     color: "#a855f7" },
  { id: "laugh",     name: "Laugh",     img: "/zavatar/expressions/laugh.jpg",     color: "#f59e0b" },
  { id: "concerned", name: "Concerned", img: null,                                 color: "#ef4444" },
  { id: "surprised", name: "Surprised", img: null,                                 color: "#10b981" },
  { id: "wink",      name: "Wink",      img: null,                                 color: "#ec4899" },
] as const;

const FACE_REGIONS = [
  { id: "eyes", label: "BROW  ·  EYE  ·  LASH", img: "/zavatar/face/eyes.jpg" },
  { id: "nose", label: "CHEEK  ·  NOSE  ·  CONTOUR", img: "/zavatar/face/nose.jpg" },
  { id: "jaw",  label: "LIP  ·  JAW  ·  CHIN", img: "/zavatar/face/jaw.jpg" },
];

const HAIR_STYLES = [
  { id: "short-straight", name: "Short" },
  { id: "short-curly",    name: "Curly" },
  { id: "buzz-cut",       name: "Buzz" },
  { id: "long-wavy",      name: "Wavy" },
  { id: "bob",            name: "Bob" },
  { id: "afro",           name: "Afro" },
  { id: "side-part",      name: "Side" },
  { id: "bald",           name: "Bald" },
] as const;

const SKIN_TONES = [
  "#FDDEC4", "#F5CBA7", "#E0AC69", "#C68642", "#8D5524", "#3B2219",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderControl({
  label,
  value,
  onChange,
  accent = "#06b6d4",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">
          {label}
        </span>
        <span className="text-[10px] font-mono text-white/50">{value}</span>
      </div>
      <div className="relative h-1 rounded-full bg-white/[0.08]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
          style={{ width: `${value}%`, background: accent }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-150"
          style={{ left: `calc(${value}% - 6px)`, background: accent }}
        />
      </div>
    </div>
  );
}

// ─── Avatar Viewport ──────────────────────────────────────────────────────────

const EXPRESSION_MAP: Record<string, string> = {
  neutral: "neutral",
  smile: "happy",
  laugh: "relaxed",
  concerned: "sad",
  surprised: "surprised",
  wink: "blinkLeft",
};

function VRMModel({
  params,
  isRotating,
  onLoaded,
}: {
  params: CustomizationParams;
  isRotating: boolean;
  onLoaded: (percent: number) => void;
}) {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      "/zavatar/models/base-avatar.vrm",
      (gltf) => {
        const vrmInstance = gltf.userData.vrm as VRM;
        if (vrmInstance) {
          vrmInstance.scene.traverse((obj) => {
            obj.frustumCulled = false;
          });
          setVrm(vrmInstance);
          onLoaded(100);
        }
      },
      (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onLoaded(percent);
        }
      },
      (err) => {
        console.error("Failed to load VRM model:", err);
      }
    );
  }, []);

  // Update VRM when params change
  useEffect(() => {
    if (!vrm) return;

    const skinColor = new THREE.Color(params.skinToneHex);
    const hairColor = new THREE.Color(params.hairColor);
    const outfitColor = new THREE.Color(params.outfitColor);

    vrm.scene.traverse((child) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          if (!mat) return;
          const standardMat = mat as THREE.MeshStandardMaterial;
          
          if (name.includes("skin") || name.includes("face") || name.includes("body")) {
            if (standardMat.color) standardMat.color.copy(skinColor);
          } else if (name.includes("hair")) {
            if (standardMat.color) standardMat.color.copy(hairColor);
          } else if (
            name.includes("cloth") ||
            name.includes("outfit") ||
            name.includes("top") ||
            name.includes("bottom") ||
            name.includes("suit") ||
            name.includes("jacket") ||
            name.includes("shirt")
          ) {
            if (standardMat.color) standardMat.color.copy(outfitColor);
          }
        });
      }
    });

    if (vrm.expressionManager) {
      vrm.expressionManager.resetValues();
      const vrmExpression = EXPRESSION_MAP[params.expression] || "neutral";
      vrm.expressionManager.setValue(vrmExpression, 1.0);
      vrm.expressionManager.update();
    }

    if (vrm.humanoid) {
      const leftEye = vrm.humanoid.getNormalizedBoneNode("leftEye");
      const rightEye = vrm.humanoid.getNormalizedBoneNode("rightEye");
      if (leftEye && rightEye) {
        const scaleVal = 0.8 + (params.eyeSize / 100) * 0.4;
        leftEye.scale.set(scaleVal, scaleVal, scaleVal);
        rightEye.scale.set(scaleVal, scaleVal, scaleVal);
      }

      const jaw = vrm.humanoid.getNormalizedBoneNode("jaw");
      if (jaw) {
        const scaleVal = 0.85 + (params.jawWidth / 100) * 0.3;
        jaw.scale.set(scaleVal, 1.0, 1.0);
      }

      const neck = vrm.humanoid.getNormalizedBoneNode("neck");
      if (neck) {
        const scaleVal = 0.9 + (params.faceShapeValue / 100) * 0.2;
        neck.scale.set(scaleVal, 1.0, scaleVal);
      }
    }
  }, [vrm, params]);

  useFrame((state, delta) => {
    if (vrm) {
      vrm.update(delta);
    }
    if (meshRef.current && isRotating) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!vrm) return null;

  return (
    <group ref={meshRef} position={[0, -0.9, 0]}>
      <primitive object={vrm.scene} />
    </group>
  );
}

function AvatarViewport({
  params,
  isRotating,
  setIsRotating,
}: {
  params: CustomizationParams;
  isRotating: boolean;
  setIsRotating: (v: boolean) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const outfitData = OUTFITS.find((o) => o.id === params.outfit) ?? OUTFITS[0];
  const exprData = EXPRESSIONS.find((e) => e.id === params.expression) ?? EXPRESSIONS[0];

  const handleLoaded = (percent: number) => {
    setProgress(percent);
    if (percent >= 100) {
      setLoaded(true);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 70% at 50% 60%, ${outfitData.accent}18 0%, transparent 70%)`,
        }}
      />
      {/* Grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: `linear-gradient(to top, ${outfitData.accent}08, transparent)`,
          maskImage: "linear-gradient(to top, black 30%, transparent)",
        }}
      />

      {/* R3F Canvas Container */}
      {isMounted ? (
        <div className={`w-full h-full z-10 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}>
          <Canvas camera={{ position: [0, 1.35, 1.15], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[1, 3, 2]} intensity={1.5} castShadow />
            <directionalLight position={[-1, 1, -1]} intensity={0.5} />
            <VRMModel params={params} isRotating={isRotating} onLoaded={handleLoaded} />
            <OrbitControls target={[0, 1.25, 0]} enableZoom={true} enablePan={false} minDistance={0.5} maxDistance={2.5} />
          </Canvas>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      )}

      {/* Loading Overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm z-25">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-xs font-mono text-cyan-400 font-semibold">{progress}%</span>
          </div>
          <span className="text-[10px] font-semibold tracking-widest text-white/50 uppercase">
            CALIBRATING_3D_MESH
          </span>
        </div>
      )}

      {/* Expression overlay badge */}
      <div
        className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 z-20"
        style={{ background: "rgba(0,0,0,0.5)" }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: exprData.color }}
        />
        <span className="text-[10px] font-semibold tracking-widest text-white/70 uppercase">
          {exprData.name}
        </span>
      </div>

      {/* Viewport toolbar */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        {[
          { icon: Eye, tip: "View" },
          { icon: ZoomIn, tip: "Zoom" },
          { icon: Move, tip: "Move" },
          { icon: RotateCcw, tip: "Reset", action: () => setIsRotating(!isRotating) },
        ].map(({ icon: Icon, tip, action }) => (
          <button
            key={tip}
            onClick={action}
            title={tip}
            className="w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all duration-200"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>

      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 blur-2xl rounded-full opacity-60"
        style={{ background: outfitData.accent }}
      />
    </div>
  );
}

// ─── Style Profile Panel ──────────────────────────────────────────────────────

function StyleProfilePanel({
  params,
  setParams,
}: {
  params: CustomizationParams;
  setParams: React.Dispatch<React.SetStateAction<CustomizationParams>>;
}) {
  const selectedOutfit = OUTFITS.find((o) => o.id === params.outfit) ?? OUTFITS[0];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">
          Style_Profile
        </span>
        <button className="text-white/30 hover:text-white/60 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-5">
        {/* Outfit grid */}
        <div>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {OUTFITS.slice(0, 3).map((outfit) => (
              <button
                key={outfit.id}
                onClick={() => setParams((p) => ({ ...p, outfit: outfit.id as CustomizationParams["outfit"] }))}
                className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200"
                style={{
                  borderColor: params.outfit === outfit.id ? outfit.accent : "transparent",
                  boxShadow: params.outfit === outfit.id ? `0 0 12px ${outfit.accent}50` : "none",
                }}
              >
                <Image
                  src={outfit.img}
                  alt={outfit.name}
                  fill
                  className="object-cover"
                />
                {params.outfit === outfit.id && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: outfit.accent }}
                  />
                )}
              </button>
            ))}
          </div>
          <p className="text-[11px] font-medium text-white/60 mb-1">{selectedOutfit.name}</p>

          {/* Color swatches */}
          <div className="flex gap-1.5 mb-4">
            {COLOR_SWATCHES.map((hex) => (
              <button
                key={hex}
                onClick={() => setParams((p) => ({ ...p, outfitColor: hex }))}
                className="w-5 h-5 rounded transition-all duration-150"
                style={{
                  background: hex,
                  border: params.outfitColor === hex ? "2px solid white" : "2px solid transparent",
                  transform: params.outfitColor === hex ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Fashion Inspiration heading */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">
            Fashion Inspiration
          </p>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {OUTFITS.slice(2).map((outfit) => (
              <button
                key={outfit.id}
                onClick={() => setParams((p) => ({ ...p, outfit: outfit.id as CustomizationParams["outfit"] }))}
                className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200"
                style={{
                  borderColor: params.outfit === outfit.id ? outfit.accent : "transparent",
                  boxShadow: params.outfit === outfit.id ? `0 0 12px ${outfit.accent}50` : "none",
                }}
              >
                <Image
                  src={outfit.img}
                  alt={outfit.name}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          <p className="text-[10px] font-medium text-white/40 mb-3">{selectedOutfit.category}</p>
        </div>

        {/* Hair */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">
            Hair Style
          </p>
          <div className="grid grid-cols-4 gap-1">
            {HAIR_STYLES.map((h) => (
              <button
                key={h.id}
                onClick={() => setParams((p) => ({ ...p, hairStyle: h.id as CustomizationParams["hairStyle"] }))}
                className="px-1 py-1.5 rounded text-[9px] font-semibold text-center transition-all duration-150"
                style={{
                  background: params.hairStyle === h.id ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.04)",
                  color: params.hairStyle === h.id ? "#06b6d4" : "rgba(255,255,255,0.4)",
                  border: params.hairStyle === h.id ? "1px solid rgba(6,182,212,0.4)" : "1px solid transparent",
                }}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>

        {/* Skin tone */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">
            Skin Tone
          </p>
          <div className="flex gap-2">
            {SKIN_TONES.map((hex) => (
              <button
                key={hex}
                onClick={() => setParams((p) => ({ ...p, skinToneHex: hex }))}
                className="w-6 h-6 rounded-full transition-all duration-150"
                style={{
                  background: hex,
                  border: params.skinToneHex === hex ? "2.5px solid white" : "2.5px solid rgba(255,255,255,0.1)",
                  transform: params.skinToneHex === hex ? "scale(1.2)" : "scale(1)",
                  boxShadow: params.skinToneHex === hex ? `0 0 8px ${hex}80` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Sculpt Panel ─────────────────────────────────────────────────────

function FeatureSculptPanel({
  params,
  setParams,
}: {
  params: CustomizationParams;
  setParams: React.Dispatch<React.SetStateAction<CustomizationParams>>;
}) {
  const [activeRegion, setActiveRegion] = useState(0);
  const region = FACE_REGIONS[activeRegion];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">
          Feature_Sculpt
        </span>
        <button className="text-white/30 hover:text-white/60 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Face region images */}
        <div className="space-y-0.5 p-2">
          {FACE_REGIONS.map((r, idx) => (
            <button
              key={r.id}
              onClick={() => setActiveRegion(idx)}
              className="relative w-full h-20 rounded-lg overflow-hidden group transition-all duration-200"
              style={{
                border: activeRegion === idx
                  ? "1.5px solid rgba(6,182,212,0.5)"
                  : "1.5px solid rgba(255,255,255,0.04)",
              }}
            >
              <Image
                src={r.img}
                alt={r.label}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all" />
              {/* Label */}
              <div className="absolute bottom-1.5 left-2">
                <span className="text-[8px] font-semibold tracking-widest text-white/60 uppercase">
                  {r.label}
                </span>
              </div>
              {/* Active indicator dot */}
              {activeRegion === idx && (
                <div className="absolute top-2 right-2 flex gap-1">
                  {[0.3, 0.6, 1].map((o, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: `rgba(6,182,212,${o})` }}
                    />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Sliders for selected region */}
        <div className="px-4 py-3 space-y-4">
          <p className="text-[9px] font-semibold tracking-widest text-white/30 uppercase">
            {region.label}
          </p>

          {activeRegion === 0 && (
            <>
              <SliderControl label="Eye Size" value={params.eyeSize} onChange={(v) => setParams((p) => ({ ...p, eyeSize: v }))} />
              <SliderControl label="Brow Arch" value={params.faceShapeValue} onChange={(v) => setParams((p) => ({ ...p, faceShapeValue: v }))} />
            </>
          )}
          {activeRegion === 1 && (
            <>
              <SliderControl label="Nose Width" value={params.noseWidth} onChange={(v) => setParams((p) => ({ ...p, noseWidth: v }))} />
              <SliderControl label="Cheek Volume" value={params.skinToneValue} onChange={(v) => setParams((p) => ({ ...p, skinToneValue: v }))} />
            </>
          )}
          {activeRegion === 2 && (
            <>
              <SliderControl label="Jaw Width" value={params.jawWidth} onChange={(v) => setParams((p) => ({ ...p, jawWidth: v }))} />
              <SliderControl label="Chin Depth" value={100 - params.jawWidth} onChange={(v) => setParams((p) => ({ ...p, jawWidth: 100 - v }))} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Expression Lab ───────────────────────────────────────────────────────────

function ExpressionLab({
  expression,
  setExpression,
}: {
  expression: string;
  setExpression: (e: CustomizationParams["expression"]) => void;
}) {
  const [scrollIdx, setScrollIdx] = useState(0);
  const visibleCount = 5;

  const scroll = (dir: number) => {
    setScrollIdx((prev) =>
      Math.max(0, Math.min(EXPRESSIONS.length - visibleCount, prev + dir))
    );
  };

  const visible = EXPRESSIONS.slice(scrollIdx, scrollIdx + visibleCount);

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06]">
        <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">
          Expression_Lab
        </span>
        <button className="text-white/30 hover:text-white/60 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 pb-3">
        <button
          onClick={() => scroll(-1)}
          disabled={scrollIdx === 0}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-white/[0.06] text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
        >
          <ChevronLeft size={12} />
        </button>

        <div className="flex-1 flex gap-2">
          {visible.map((expr) => (
            <button
              key={expr.id}
              onClick={() => setExpression(expr.id as CustomizationParams["expression"])}
              className="flex-1 relative aspect-square rounded-xl overflow-hidden transition-all duration-200 group"
              style={{
                border: expression === expr.id
                  ? `2px solid ${expr.color}`
                  : "2px solid rgba(255,255,255,0.07)",
                boxShadow: expression === expr.id ? `0 0 16px ${expr.color}40` : "none",
              }}
            >
              {expr.img ? (
                <Image
                  src={expr.img}
                  alt={expr.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center text-3xl"
                  style={{ background: `${expr.color}18` }}
                >
                  <span className="text-white/30 text-xs font-semibold">{expr.name[0]}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
              {/* Active ring pulse */}
              {expression === expr.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: expr.color }}
                />
              )}
              <div className="absolute bottom-1 left-0 right-0 text-center">
                <span className="text-[8px] text-white/50 font-medium">{expr.name}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll(1)}
          disabled={scrollIdx >= EXPRESSIONS.length - visibleCount}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-white/[0.06] text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: User,   tip: "Style Profile" },
  { icon: Layers, tip: "Layers" },
  { icon: Sliders,tip: "Sculpt" },
  { icon: Smile,  tip: "Expressions" },
  { icon: Crown,  tip: "Premium" },
];

function SidebarNav({ active, setActive }: { active: number; setActive: (i: number) => void }) {
  return (
    <div
      className="w-11 flex flex-col items-center py-4 gap-1 border-r border-white/[0.06]"
      style={{ background: "rgba(0,0,0,0.3)" }}
    >
      {NAV_ITEMS.map(({ icon: Icon, tip }, i) => (
        <button
          key={i}
          onClick={() => setActive(i)}
          title={tip}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{
            background: active === i ? "rgba(6,182,212,0.18)" : "transparent",
            color: active === i ? "#06b6d4" : "rgba(255,255,255,0.28)",
            border: active === i ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
          }}
        >
          <Icon size={14} />
        </button>
      ))}

      <div className="flex-1" />

      {/* Bottom nav items */}
      {[Share2, X].map((Icon, i) => (
        <button
          key={i}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AvatarStudioPage() {
  const [params, setParams] = useState<CustomizationParams>(DEFAULT_PARAMS);
  const [activeNav, setActiveNav] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isNftModalOpen, setIsNftModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"style" | "sculpt" | "expression">("style");

  // Restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("zavatar_studio_draft_v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.params) setParams((p) => ({ ...p, ...parsed.params }));
      }
    } catch {}
  }, []);

  // Autosave
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          "zavatar_studio_draft_v2",
          JSON.stringify({ params, savedAt: new Date().toISOString() })
        );
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [params]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaveSuccess(true);
    setIsSaving(false);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const currentOutfit = OUTFITS.find((o) => o.id === params.outfit) ?? OUTFITS[0];

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 40%, #0a0a15 100%)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/08 transition-all border border-white/[0.06]"
          >
            <ArrowLeft size={13} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm" style={{ background: currentOutfit.accent }} />
            <span className="text-xs font-semibold tracking-widest text-white/50 uppercase">
              MY_AVATAR_STUDIO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              background: saveSuccess ? "rgba(16,185,129,0.2)" : "rgba(6,182,212,0.15)",
              color: saveSuccess ? "#10b981" : "#06b6d4",
              border: saveSuccess ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(6,182,212,0.3)",
            }}
          >
            {isSaving ? (
              <Loader2 size={11} className="animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 size={11} />
            ) : (
              <Save size={11} />
            )}
            {saveSuccess ? "Saved!" : "Save & Preview"}
          </button>

          {/* Mint button */}
          <button
            onClick={() => setIsNftModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(236,72,153,0.2) 100%)",
              color: "#a855f7",
              border: "1px solid rgba(168,85,247,0.3)",
            }}
          >
            <Wallet size={11} />
            Mint as NFT
          </button>

          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 border border-white/[0.06] transition-all">
            <MoreHorizontal size={14} />
          </button>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 border border-white/[0.06] transition-all">
            <X size={14} />
          </button>
        </div>
      </header>

      {/* ── Desktop layout ────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Sidebar icon nav */}
        <SidebarNav active={activeNav} setActive={setActiveNav} />

        {/* Left panel - Style Profile */}
        <div
          className="w-56 flex-shrink-0 border-r border-white/[0.06] overflow-hidden flex flex-col"
          style={{ background: "rgba(255,255,255,0.015)" }}
          data-testid="style-profile"
        >
          <StyleProfilePanel params={params} setParams={setParams} />
        </div>

        {/* Center - Avatar Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden" data-testid="avatar-viewport">
          {/* 3D viewport */}
          <div className="flex-1 relative overflow-hidden">
            <AvatarViewport
              params={params}
              isRotating={isRotating}
              setIsRotating={setIsRotating}
            />
          </div>

          {/* Expression Lab - bottom strip */}
          <div
            className="flex-shrink-0 border-t border-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.015)" }}
            data-testid="expression-lab"
          >
            <ExpressionLab
              expression={params.expression}
              setExpression={(e) => setParams((p) => ({ ...p, expression: e }))}
            />
          </div>
        </div>

        {/* Right panel - Feature Sculpt */}
        <div
          className="w-56 flex-shrink-0 border-l border-white/[0.06] overflow-hidden flex flex-col"
          style={{ background: "rgba(255,255,255,0.015)" }}
          data-testid="feature-sculpt"
        >
          <FeatureSculptPanel params={params} setParams={setParams} />
        </div>
      </div>

      {/* ── Mobile layout ────────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        {/* Mobile tabs */}
        <div className="flex border-b border-white/[0.06] bg-black/30">
          {(["style", "sculpt", "expression"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMobileTab(tab)}
              className="flex-1 py-2.5 text-[10px] font-semibold tracking-widest uppercase transition-all"
              style={{
                color: activeMobileTab === tab ? "#06b6d4" : "rgba(255,255,255,0.3)",
                borderBottom: activeMobileTab === tab ? "2px solid #06b6d4" : "2px solid transparent",
              }}
            >
              {tab === "style" ? "Style" : tab === "sculpt" ? "Sculpt" : "Expr"}
            </button>
          ))}
        </div>

        {/* Mobile viewport */}
        <div className="h-56 relative overflow-hidden border-b border-white/[0.06]">
          <AvatarViewport
            params={params}
            isRotating={isRotating}
            setIsRotating={setIsRotating}
          />
        </div>

        {/* Mobile panel */}
        <div className="flex-1 overflow-hidden">
          {activeMobileTab === "style" && (
            <StyleProfilePanel params={params} setParams={setParams} />
          )}
          {activeMobileTab === "sculpt" && (
            <FeatureSculptPanel params={params} setParams={setParams} />
          )}
          {activeMobileTab === "expression" && (
            <div className="h-full flex items-center justify-center">
              <ExpressionLab
                expression={params.expression}
                setExpression={(e) => setParams((p) => ({ ...p, expression: e }))}
              />
            </div>
          )}
        </div>

        {/* Mobile save bar */}
        <div className="flex gap-2 p-3 border-t border-white/[0.06] bg-black/40">
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg text-xs font-semibold"
            style={{
              background: "rgba(6,182,212,0.15)",
              color: "#06b6d4",
              border: "1px solid rgba(6,182,212,0.3)",
            }}
          >
            Save & Preview
          </button>
          <button
            onClick={() => setIsNftModalOpen(true)}
            className="flex-1 py-2.5 rounded-lg text-xs font-semibold"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))",
              color: "#a855f7",
              border: "1px solid rgba(168,85,247,0.3)",
            }}
          >
            Mint NFT
          </button>
        </div>
      </div>

      {/* ── NFT Mint Modal ────────────────────────────────────────────────── */}
      {isNftModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsNftModalOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{
              background: "rgba(13,17,23,0.95)",
              border: "1px solid rgba(168,85,247,0.25)",
              boxShadow: "0 0 60px rgba(168,85,247,0.15)",
            }}
          >
            <button
              onClick={() => setIsNftModalOpen(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white/70"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3))" }}
              >
                <Wallet size={18} style={{ color: "#a855f7" }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Mint Zavatar NFT</h3>
                <p className="text-[11px] text-white/40">Base Sepolia · ERC-721 Soulbound</p>
              </div>
            </div>

            {/* Avatar preview */}
            <div
              className="relative w-full h-36 rounded-xl overflow-hidden mb-5"
              style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}
            >
              <Image
                src={currentOutfit.img}
                alt="Mint preview"
                fill
                className="object-cover object-top opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <span className="text-xs font-semibold text-white">{currentOutfit.name}</span>
                <span
                  className="ml-2 text-[9px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(168,85,247,0.3)", color: "#c084fc" }}
                >
                  SOULBOUND
                </span>
              </div>
            </div>

            <div
              className="rounded-xl p-3 mb-4 text-[11px] text-white/50 leading-relaxed"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              This avatar will be minted as a soulbound NFT — permanently tied to your wallet. It cannot be transferred or sold after minting.
            </div>

            <button
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #be185d 100%)",
                color: "white",
              }}
            >
              Connect Wallet & Mint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
