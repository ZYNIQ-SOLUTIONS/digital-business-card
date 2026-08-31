import { NextResponse } from 'next/server';
import { authenticate, createErrorResponse } from '../../_utils/auth';
import { getAvatar, getNftMint } from '../../_utils/store';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/zavatar/[id]/ownership
 * Phase 3 Web3 Ownership verification endpoint.
 * Returns on-chain minting details from nft_mints, or standard un-minted stub.
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

    // 2. Resolve route param id
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id) {
      return createErrorResponse(400, 'MISSING_ID', 'Avatar ID is required.');
    }

    // 3. Check avatar existence
    const avatar = await getAvatar(id);
    if (!avatar) {
      return createErrorResponse(404, 'NOT_FOUND', 'Avatar not found.');
    }

    // 4. Query NFT mint record
    const nft = await getNftMint(avatar.id);

    if (nft) {
      return NextResponse.json(
        {
          avatarId: avatar.id,
          minted: true,
          owner: avatar.wallet_address || null,
          tokenId: nft.token_id,
          contractAddress: nft.contract_address,
          chainId: nft.chain_id,
          txHash: nft.tx_hash,
          ipfsCid: nft.ipfs_cid,
          mintedAt: nft.minted_at
        },
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 5. Phase 3 un-minted stub response
    return NextResponse.json(
      {
        avatarId: avatar.id,
        minted: false,
        owner: null,
        tokenId: null,
        contractAddress: null
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error checking avatar ownership.';
    return createErrorResponse(500, 'INTERNAL_ERROR', message);
  }
}
