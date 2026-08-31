import crypto from 'crypto';
import {
  AvatarRecord,
  AvatarAssetRecord,
  ConsentLogRecord,
  NftMintRecord,
  AvatarAssetUrls,
  AvatarStatus,
  AvatarGenerationMethod,
  AvatarLodLevel,
  AvatarFormat,
  AvatarStyle,
  CustomizationParams
} from '@/zavatar/src/types';
import { createClient } from '@/lib/supabase/server';

// In-memory fallback stores for offline/test environments
const memoryAvatars: Map<string, AvatarRecord> = new Map();
const memoryAssets: Map<string, AvatarAssetRecord[]> = new Map();
const memoryConsentLogs: ConsentLogRecord[] = [];
const memoryNftMints: Map<string, NftMintRecord> = new Map();

/**
 * Creates a new avatar record in Supabase or memory store.
 */
export async function createAvatar(params: {
  id?: string;
  user_id: string;
  status: AvatarStatus;
  generation_method: AvatarGenerationMethod;
  style: AvatarStyle | CustomizationParams | Record<string, unknown>;
  wallet_address?: string | null;
}): Promise<AvatarRecord> {
  const avatarId = params.id || crypto.randomUUID();
  const now = new Date().toISOString();

  const record: AvatarRecord = {
    id: avatarId,
    user_id: params.user_id,
    wallet_address: params.wallet_address || null,
    status: params.status,
    generation_method: params.generation_method,
    style: params.style as AvatarStyle | CustomizationParams,
    created_at: now,
    updated_at: now
  };

  // Always keep in-memory copy synced
  memoryAvatars.set(avatarId, record);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('avatars')
      .insert({
        id: avatarId,
        user_id: params.user_id,
        wallet_address: params.wallet_address || null,
        status: params.status,
        generation_method: params.generation_method,
        style: params.style,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (!error && data) {
      memoryAvatars.set(data.id, data as AvatarRecord);
      return data as AvatarRecord;
    }
  } catch {
    // Database offline or table not present
  }

  return record;
}

/**
 * Retrieves an avatar record by ID.
 */
export async function getAvatar(id: string): Promise<AvatarRecord | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('avatars')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      memoryAvatars.set(data.id, data as AvatarRecord);
      return data as AvatarRecord;
    }
  } catch {
    // Supabase lookup failed
  }

  return memoryAvatars.get(id) || null;
}

/**
 * Updates an avatar record by ID.
 */
export async function updateAvatar(
  id: string,
  updates: {
    status?: AvatarStatus;
    style?: AvatarStyle | CustomizationParams | Record<string, unknown>;
    wallet_address?: string | null;
    updated_at?: string;
  }
): Promise<AvatarRecord | null> {
  const now = updates.updated_at || new Date().toISOString();
  const existing = memoryAvatars.get(id);

  if (existing) {
    const updated: AvatarRecord = {
      ...existing,
      ...updates,
      style: (updates.style || existing.style) as AvatarStyle | CustomizationParams,
      updated_at: now
    };
    memoryAvatars.set(id, updated);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('avatars')
      .update({
        ...updates,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      memoryAvatars.set(data.id, data as AvatarRecord);
      return data as AvatarRecord;
    }
  } catch {
    // Supabase update failed
  }

  return memoryAvatars.get(id) || null;
}

/**
 * Saves multi-LOD assets for a given avatar ID.
 */
export async function saveAvatarAssets(
  avatarId: string,
  assets: Array<{
    lod_level: AvatarLodLevel;
    format: AvatarFormat;
    storage_url: string;
    checksum?: string | null;
  }>
): Promise<AvatarAssetRecord[]> {
  const now = new Date().toISOString();
  const records: AvatarAssetRecord[] = assets.map((a) => ({
    id: crypto.randomUUID(),
    avatar_id: avatarId,
    lod_level: a.lod_level,
    format: a.format,
    storage_url: a.storage_url,
    checksum: a.checksum || null,
    created_at: now
  }));

  // Store in memory
  const existing = memoryAssets.get(avatarId) || [];
  // Filter out overwritten LODs of the same format
  const updated = [
    ...existing.filter(
      (e) => !assets.some((a) => a.lod_level === e.lod_level && a.format === e.format)
    ),
    ...records
  ];
  memoryAssets.set(avatarId, updated);

  try {
    const supabase = await createClient();
    // Delete existing assets for avatar to avoid duplication
    await supabase.from('avatar_assets').delete().eq('avatar_id', avatarId);

    const { data, error } = await supabase
      .from('avatar_assets')
      .insert(
        records.map((r) => ({
          id: r.id,
          avatar_id: r.avatar_id,
          lod_level: r.lod_level,
          format: r.format,
          storage_url: r.storage_url,
          checksum: r.checksum,
          created_at: r.created_at
        }))
      )
      .select();

    if (!error && data && data.length > 0) {
      memoryAssets.set(avatarId, data as AvatarAssetRecord[]);
      return data as AvatarAssetRecord[];
    }
  } catch {
    // Supabase save failed
  }

  return memoryAssets.get(avatarId) || records;
}

/**
 * Retrieves all asset records for an avatar.
 */
export async function getAvatarAssets(avatarId: string): Promise<AvatarAssetRecord[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('avatar_assets')
      .select('*')
      .eq('avatar_id', avatarId);

    if (!error && data && data.length > 0) {
      memoryAssets.set(avatarId, data as AvatarAssetRecord[]);
      return data as AvatarAssetRecord[];
    }
  } catch {
    // Database query failed
  }

  return memoryAssets.get(avatarId) || [];
}

/**
 * Derives structured AvatarAssetUrls from asset records.
 */
export async function getAvatarAssetUrls(avatarId: string): Promise<AvatarAssetUrls> {
  const assets = await getAvatarAssets(avatarId);
  const result: AvatarAssetUrls = {
    high: '',
    mid: '',
    low: ''
  };

  for (const asset of assets) {
    if (asset.format === 'png') {
      if (asset.lod_level === 'high') result.high = asset.storage_url;
      else if (asset.lod_level === 'mid') result.mid = asset.storage_url;
      else if (asset.lod_level === 'low') result.low = asset.storage_url;
    } else if (asset.format === 'svg') {
      result.svg = asset.storage_url;
    } else if (asset.format === 'glb') {
      result.glb = asset.storage_url;
    }
  }

  // Fallbacks if any LOD is missing
  if (!result.high) result.high = result.mid || result.low || result.svg || '';
  if (!result.mid) result.mid = result.high || result.low || result.svg || '';
  if (!result.low) result.low = result.mid || result.high || result.svg || '';

  return result;
}

/**
 * Logs a biometric consent event to consent_logs.
 */
export async function logConsent(params: {
  user_id: string;
  consent_type: string;
  ip_address?: string | null;
}): Promise<ConsentLogRecord> {
  const now = new Date().toISOString();
  const record: ConsentLogRecord = {
    id: crypto.randomUUID(),
    user_id: params.user_id,
    consent_type: params.consent_type,
    granted_at: now,
    ip_address: params.ip_address || null,
    revoked_at: null
  };

  memoryConsentLogs.push(record);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('consent_logs')
      .insert({
        id: record.id,
        user_id: record.user_id,
        consent_type: record.consent_type,
        granted_at: record.granted_at,
        ip_address: record.ip_address
      })
      .select()
      .single();

    if (!error && data) {
      return data as ConsentLogRecord;
    }
  } catch {
    // Database insert failed
  }

  return record;
}

/**
 * Retrieves on-chain NFT mint record for an avatar if present.
 */
export async function getNftMint(avatarId: string): Promise<NftMintRecord | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('nft_mints')
      .select('*')
      .eq('avatar_id', avatarId)
      .single();

    if (!error && data) {
      memoryNftMints.set(avatarId, data as NftMintRecord);
      return data as NftMintRecord;
    }
  } catch {
    // Database lookup failed
  }

  return memoryNftMints.get(avatarId) || null;
}

/**
 * Records an NFT mint record for an avatar.
 */
export async function recordNftMint(record: NftMintRecord): Promise<NftMintRecord> {
  memoryNftMints.set(record.avatar_id, record);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('nft_mints')
      .insert(record)
      .select()
      .single();

    if (!error && data) {
      return data as NftMintRecord;
    }
  } catch {
    // DB insert failed
  }

  return record;
}
