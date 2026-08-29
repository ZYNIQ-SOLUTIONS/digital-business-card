export type TemplateLayoutId = 
  | "classic-segmented"
  | "bento-grid"
  | "executive-minimal"
  | "cyber-holo"
  | "creative-hero";

export interface TemplateDefinition {
  id: TemplateLayoutId;
  name: string;
  badge: string;
  description: string;
  features: string[];
  recommendedFor: string;
}

export const cardTemplates: Record<TemplateLayoutId, TemplateDefinition> = {
  "classic-segmented": {
    id: "classic-segmented",
    name: "Classic Apple Tabs",
    badge: "Most Popular",
    description: "Iconic Apple iOS card layout with smooth segmented tab transitions & quick action pills.",
    features: ["Segmented Tab Navigation", "Dynamic Quick Action 4-Grid", "Integrated Apple Wallet", "QR Pass Code"],
    recommendedFor: "Executives, Founders, Consultants & General Networking",
  },
  "bento-grid": {
    id: "bento-grid",
    name: "Modern Bento Grid",
    badge: "Contemporary",
    description: "Modular Linear & Vercel-inspired bento layout with asymmetric live widgets and rich tiles.",
    features: ["Hero Status Card", "Live QR Code Tile", "Direct Action Pods", "Interactive Schedule Tile", "Bio & Skill Matrix"],
    recommendedFor: "Tech Founders, Developers, Designers & Product Leaders",
  },
  "executive-minimal": {
    id: "executive-minimal",
    name: "Executive Minimal",
    badge: "High Luxury",
    description: "Ultra-refined editorial aesthetic with high-contrast typography, executive quote & sleek direct buttons.",
    features: ["Editorial Typography", "Executive Quote Callout", "Full-Width Direct Actions", "Compact Floating QR Strip"],
    recommendedFor: "C-Level Executives, Investors, Attorneys & VIPs",
  },
  "cyber-holo": {
    id: "cyber-holo",
    name: "Cyber HUD Terminal",
    badge: "Futuristic",
    description: "Spatial cybernetic digital identity with corner HUD markings, live NFC encryption badge & neon frame.",
    features: ["Live Terminal Status", "Corner HUD Markers", "Neon Border Glow", "Scanning Holographic QR Frame", "Cyber Social Grid"],
    recommendedFor: "AI Researchers, Cyber Engineers, Crypto & Web3 Creators",
  },
  "creative-hero": {
    id: "creative-hero",
    name: "Creative Hero Showcase",
    badge: "Visual Impact",
    description: "Immersive edge-to-edge header banner with overlapping elevated avatar, media links & sticky contact bar.",
    features: ["Full-Bleed Header Banner", "Elevated Avatar Ring", "Visual Social Chips", "Featured Skills Showcase", "Prominent Action Footer"],
    recommendedFor: "Creative Directors, Photographers, Artists & Influencers",
  },
};

export const templateList: TemplateDefinition[] = Object.values(cardTemplates);
