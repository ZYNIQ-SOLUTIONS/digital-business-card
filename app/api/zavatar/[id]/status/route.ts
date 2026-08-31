import { NextResponse } from 'next/server';
import { authenticate, createErrorResponse } from '../../_utils/auth';
import { getAvatar, getAvatarAssetUrls } from '../../_utils/store';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/zavatar/[id]/status
 * Returns generation status and progress for an avatar.
 * Enforces ownership: returns 403 if the requesting user does not own the avatar.
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

    // 4. Verify ownership
    if (avatar.user_id !== user.id) {
      return createErrorResponse(
        403,
        'FORBIDDEN',
        'You do not have permission to view the status of this avatar.'
      );
    }

    // 5. Fetch associated asset URLs
    const assetUrls = await getAvatarAssetUrls(avatar.id);

    // 6. Return status payload
    return NextResponse.json(
      {
        id: avatar.id,
        status: avatar.status,
        progress: 100,
        assetUrls: assetUrls.high ? assetUrls : undefined
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error retrieving avatar status.';
    return createErrorResponse(500, 'INTERNAL_ERROR', message);
  }
}
