import { NextResponse } from 'next/server';
import { authenticate, createErrorResponse } from '../../_utils/auth';
import {
  getAvatar,
  saveAvatarAssets,
  updateAvatar
} from '../../_utils/store';
import { TemplateAdapter } from '@/zavatar/src/adapters/TemplateAdapter';
import { CustomizationParams } from '@/zavatar/src/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/zavatar/[id]/render
 * Triggers a fresh multi-LOD render pass for an avatar, producing 3 PNG resolutions
 * (512px, 256px, 64px) and an SVG representation, updates avatar_assets, and returns asset URLs.
 */
export async function POST(
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

    // 2. Resolve route param id
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id) {
      return createErrorResponse(400, 'MISSING_ID', 'Avatar ID is required.');
    }

    // 3. Retrieve existing avatar
    const avatar = await getAvatar(id);
    if (!avatar) {
      return createErrorResponse(404, 'NOT_FOUND', 'Avatar not found.');
    }

    // 4. Verify ownership
    if (avatar.user_id !== user.id) {
      return createErrorResponse(
        403,
        'FORBIDDEN',
        'You do not have permission to render this avatar.'
      );
    }

    // 5. Construct full customization parameters from stored avatar style
    const params: CustomizationParams = {
      faceShape: avatar.style?.faceShape || 'oval',
      skinTone: avatar.style?.skinTone || '#F5CBA7',
      hairStyle: avatar.style?.hairStyle || 'short-straight',
      hairColor: avatar.style?.hairColor || '#1e1e1e',
      outfit: avatar.style?.outfit || 'business-formal',
      outfitColor: avatar.style?.outfitColor || '#1e293b',
      expression: avatar.style?.expression || 'neutral',
      eyeSize: avatar.style?.eyeSize ?? 50,
      noseWidth: avatar.style?.noseWidth ?? 50,
      jawWidth: avatar.style?.jawWidth ?? 50,
      accessories: avatar.style?.accessories || [],
      glasses: avatar.style?.glasses,
      beard: avatar.style?.beard,
      background: avatar.style?.background
    };

    // 6. Execute fresh multi-LOD render pass via TemplateAdapter
    const adapter = new TemplateAdapter();
    const meshResult = await adapter.generateFromTemplate(params);

    // 7. Update avatar status & timestamp
    await updateAvatar(avatar.id, {
      status: 'ready',
      updated_at: new Date().toISOString()
    });

    // 8. Persist multi-LOD assets to avatar_assets table
    await saveAvatarAssets(avatar.id, [
      {
        lod_level: 'high',
        format: 'png',
        storage_url: meshResult.assetUrls.high
      },
      {
        lod_level: 'mid',
        format: 'png',
        storage_url: meshResult.assetUrls.mid
      },
      {
        lod_level: 'low',
        format: 'png',
        storage_url: meshResult.assetUrls.low
      },
      ...(meshResult.assetUrls.svg
        ? [
            {
              lod_level: 'high' as const,
              format: 'svg' as const,
              storage_url: meshResult.assetUrls.svg
            }
          ]
        : [])
    ]);

    // 9. Return rendered asset URLs
    return NextResponse.json(
      {
        avatarId: avatar.id,
        status: 'ready',
        assetUrl: meshResult.assetUrls.high,
        assetUrls: {
          high: meshResult.assetUrls.high,
          mid: meshResult.assetUrls.mid,
          low: meshResult.assetUrls.low,
          svg: meshResult.assetUrls.svg
        }
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error rendering avatar assets.';
    return createErrorResponse(500, 'RENDER_FAILED', message);
  }
}
