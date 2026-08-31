/**
 * Zavatar Core Types & Interfaces
 * Requirement R1 / Milestone M1
 */

export type AvatarFaceShape =
  | 'oval'
  | 'round'
  | 'square'
  | 'heart'
  | 'diamond'
  | (string & {});

export type AvatarSkinTone =
  | '#FDDFDF' // Fair
  | '#F5CBA7' // Light
  | '#E0AC69' // Medium / Olive
  | '#C68642' // Tan / Amber
  | '#8D5524' // Deep Bronze
  | '#3B2219' // Rich Dark
  | (string & {});

export type AvatarHairStyle =
  | 'short-straight'
  | 'short-curly'
  | 'buzz-cut'
  | 'long-wavy'
  | 'bob'
  | 'afro'
  | 'side-part'
  | 'bald'
  | (string & {});

export type AvatarOutfit =
  | 'business-formal'
  | 'smart-casual'
  | 'creative-founder'
  | 'techwear'
  | 'regional-formal'
  | (string & {});

export type AvatarExpression =
  | 'neutral'
  | 'smile'
  | 'laugh'
  | 'concerned'
  | 'surprised'
  | 'wink'
  | (string & {});

export interface AvatarStyle {
  outfit?: AvatarOutfit;
  outfitColor?: string;
  expression?: AvatarExpression;
  accessories?: string[];
  background?: string;
  theme?: string;
  faceShape?: AvatarFaceShape;
  skinTone?: AvatarSkinTone;
  hairStyle?: AvatarHairStyle;
  hairColor?: string;
  eyeSize?: number;     // 0 - 100, default 50
  noseWidth?: number;   // 0 - 100, default 50
  jawWidth?: number;    // 0 - 100, default 50
  glasses?: string;
  beard?: string;
}

export interface CustomizationParams {
  faceShape: AvatarFaceShape;
  skinTone: AvatarSkinTone;
  hairStyle: AvatarHairStyle;
  hairColor?: string;
  outfit: AvatarOutfit;
  outfitColor?: string;
  expression: AvatarExpression;
  eyeSize?: number;     // 0 - 100, default 50
  noseWidth?: number;   // 0 - 100, default 50
  jawWidth?: number;    // 0 - 100, default 50
  accessories?: string[];
  glasses?: string;
  beard?: string;
  background?: string;
}

export interface AvatarAssetUrls {
  high: string; // 512x512 PNG data URL or URL
  mid: string;  // 256x256 PNG data URL or URL
  low: string;  // 64x64 PNG data URL or URL
  svg?: string; // Composed SVG data URL or XML string
  glb?: string; // 3D model asset URL (for MetaPerson or GLB exports)
  raw?: string;
}

export interface AvatarMeshDimensions {
  high: { width: number; height: number };
  mid: { width: number; height: number };
  low: { width: number; height: number };
}

export interface AvatarMeshResult {
  avatarId?: string;
  format: 'glb' | 'png' | 'svg';
  assetUrls: AvatarAssetUrls;
  assetUrl?: string; // Convenience reference (defaults to assetUrls.high or main asset)
  metadata: {
    generator: 'TemplateAdapter' | 'MetaPersonAdapter';
    lodLevels: ('high' | 'mid' | 'low')[];
    generationTimeMs: number;
    paramsHash?: string;
    dimensions?: AvatarMeshDimensions;
  };
}

export interface AvatarGenerationAdapter {
  generateFromSelfie(image: Buffer, style: AvatarStyle): Promise<AvatarMeshResult>;
  generateFromTemplate(params: CustomizationParams): Promise<AvatarMeshResult>;
  healthCheck(): Promise<boolean>;
}

export type AvatarStatus = 'draft' | 'rendering' | 'ready' | 'minted';
export type AvatarGenerationMethod = 'selfie' | 'template';
export type AvatarLodLevel = 'high' | 'mid' | 'low';
export type AvatarFormat = 'glb' | 'png' | 'svg';

export interface AvatarRecord {
  id: string;
  user_id: string;
  wallet_address?: string | null;
  status: AvatarStatus;
  generation_method: AvatarGenerationMethod;
  style: AvatarStyle | CustomizationParams;
  created_at: string;
  updated_at: string;
}

export interface AvatarAssetRecord {
  id: string;
  avatar_id: string;
  lod_level: AvatarLodLevel;
  format: AvatarFormat;
  storage_url: string;
  checksum?: string | null;
  created_at: string;
}

export interface ConsentLogRecord {
  id: string;
  user_id: string;
  consent_type: string;
  granted_at: string;
  ip_address?: string | null;
  revoked_at?: string | null;
}

export interface NftMintRecord {
  id: string;
  avatar_id: string;
  token_id?: string | null;
  contract_address?: string | null;
  chain_id?: number | null;
  tx_hash?: string | null;
  ipfs_cid?: string | null;
  minted_at?: string | null;
}

export interface MarketplaceListingRecord {
  id: string;
  nft_mint_id?: string | null;
  seller_wallet: string;
  price: number;
  currency: string;
  status: 'active' | 'sold' | 'cancelled';
  listed_at: string;
  sold_at?: string | null;
}
