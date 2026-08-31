export type TemplateLayoutId = 
  | "classic-segmented"
  | "bento-grid"
  | "executive-minimal"
  | "cyber-holo"
  | "creative-hero"
  | "neobrutalist-bold"
  | "claude-editorial"
  | "matrix-terminal"
  | "clay-3d"
  | "riso-duotone"
  | "retro-arcade";

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
  "neobrutalist-bold": {
    id: "neobrutalist-bold",
    name: "Neo-Brutalist Pop",
    badge: "Bold & Raw",
    description: "High-voltage brutalist design with 3px solid black borders, hard 6px offset drop shadows, sticker badges & tactile chunky buttons.",
    features: ["Solid 3px Contrast Borders", "Hard Offset Box Shadows", "Sticker-Style Role Badges", "Chunky Press Buttons", "High-Impact Palette"],
    recommendedFor: "Founders, Creators, Indie Hackers, Creative Agencies & Disruptors",
  },
  "claude-editorial": {
    id: "claude-editorial",
    name: "Claude Warm Editorial",
    badge: "Research Journal",
    description: "Authoritative editorial layout on warm ivory stone with near-black slate ink, razor-sharp rules & terracotta accent.",
    features: ["Warm Ivory Canvas", "Anthropic Sans Hierarchy", "Zero-Blur Razor Rules", "Editorial Quote Block", "Asymmetric CTA Styling"],
    recommendedFor: "Researchers, Strategists, Writers, Architects & Domain Experts",
  },
  "matrix-terminal": {
    id: "matrix-terminal",
    name: "Matrix Cyber Terminal",
    badge: "Cyberpunk HUD",
    description: "Dense hacker terminal interface with phosphor green telemetry, ASCII brackets, monospace stats & live NFC protocol monitor.",
    features: ["Monospace Telemetry Feed", "Hex Encrypted NFC Monitor", "Corner ASCII Brackets", "Matrix Rain Header", "Cyber Action Grid"],
    recommendedFor: "Software Engineers, Security Experts, Web3 & Tech Visionaries",
  },
  "clay-3d": {
    id: "clay-3d",
    name: "Claymorphic 3D Puff",
    badge: "Soft & Tactile",
    description: "Playful marshmallow 3D clay aesthetic with multi-layered soft bevel shadows, puffy pill controls & soothing pastel surfaces.",
    features: ["Puffy 3D Clay Elevation", "Soft Tactile Buttons", "Marshmallow Floating Badges", "Pastel Radial Background", "Comfortable Spacing"],
    recommendedFor: "Community Builders, Educators, App Designers & Modern Brands",
  },
  "riso-duotone": {
    id: "riso-duotone",
    name: "Japanese Riso Studio",
    badge: "Artisan Print",
    description: "Authentic two-color risograph print aesthetic on off-white newsprint with vivid scarlet & cyan spot inks and halftone textures.",
    features: ["2-Color Spot Ink Palette", "Halftone Dotted Framing", "Newspaper Editorial Grid", "Artisan Stamp Seal", "High Scannability"],
    recommendedFor: "Artists, Illustrators, Photographers, Printmakers & Creative Studios",
  },
  "retro-arcade": {
    id: "retro-arcade",
    name: "Sega 8-Bit Arcade",
    badge: "Retro Gaming",
    description: "Nostalgic 8-bit arcade cabinet theme with pixel borders, chunky 3D pressable buttons, EXP/LVL power stats & retro gaming badges.",
    features: ["Pixelated Border Framing", "Tactile 3D Bevel Buttons", "EXP & Networking Level Stats", "Retro 8-Bit HUD Tags", "Arcade High Score Badge"],
    recommendedFor: "Game Developers, Streamers, Animators, Web3 Gamers & Pop Culture Icons",
  },
};

export const templateList: TemplateDefinition[] = Object.values(cardTemplates);
