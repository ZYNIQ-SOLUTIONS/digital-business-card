import { NextResponse } from 'next/server';
import { authenticate, createErrorResponse } from '../_utils/auth';
import {
  getAvatar,
  getAvatarAssets,
  getAvatarAssetUrls,
  getNftMint
} from '../_utils/store';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/zavatar/[id]
 * Returns full avatar metadata, multi-LOD asset URLs, raw assets, and NFT mint status.
 */
export async function GET(
  request: Request,
  context: RouteParams
): Promise<NextResponse> {
  try {
    // 1. Authenticate user
    const auth = await authenticate(request);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }
    const { user } = auth;

    // 2. Resolve route param id (compatible with Next.js 16 async params)
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id) {
      return createErrorResponse(400, 'MISSING_ID', 'Avatar ID is required.');
    }

    // 3. Retrieve avatar record
    const avatar = await getAvatar(id);
    if (!avatar) {
      return createErrorResponse(404, 'NOT_FOUND', 'Avatar not found.');
    }

    // 4. Access control: owner OR ready/minted public avatar
    const isOwner = avatar.user_id === user.id;
    const isPubliclyVisible = avatar.status === 'ready' || avatar.status === 'minted';

    if (!isOwner && !isPubliclyVisible) {
      return createErrorResponse(
        403,
        'FORBIDDEN',
        'You do not have permission to access this avatar.'
      );
    }

    // 5. Fetch asset records and derived URLs
    const assets = await getAvatarAssets(avatar.id);
    const assetUrls = await getAvatarAssetUrls(avatar.id);

    // 6. Fetch NFT mint record if present
    const nft = await getNftMint(avatar.id);

    // 7. Return complete metadata
    return NextResponse.json(
      {
        id: avatar.id,
        userId: avatar.user_id,
        walletAddress: avatar.wallet_address || null,
        status: avatar.status,
        generationMethod: avatar.generation_method,
        style: avatar.style,
        createdAt: avatar.created_at,
        updatedAt: avatar.updated_at,
        assetUrl: assetUrls.high || assetUrls.mid || assetUrls.low || '',
        assetUrls,
        assets: assets.map((a) => ({
          id: a.id,
          lodLevel: a.lod_level,
          format: a.format,
          storageUrl: a.storage_url,
          checksum: a.checksum,
          createdAt: a.created_at
        })),
        nft: nft
          ? {
              tokenId: nft.token_id,
              contractAddress: nft.contract_address,
              chainId: nft.chain_id,
              txHash: nft.tx_hash,
              ipfsCid: nft.ipfs_cid,
              mintedAt: nft.minted_at
            }
          : null
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error retrieving avatar metadata.';
    return createErrorResponse(500, 'INTERNAL_ERROR', message);
  }
}
