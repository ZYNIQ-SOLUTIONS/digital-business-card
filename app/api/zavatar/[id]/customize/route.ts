import { NextResponse } from 'next/server';
import { authenticate, createErrorResponse } from '../../_utils/auth';
import {
  getAvatar,
  updateAvatar,
  saveAvatarAssets
} from '../../_utils/store';
import { TemplateAdapter } from '@/zavatar/src/adapters/TemplateAdapter';
import { CustomizationParams } from '@/zavatar/src/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/zavatar/[id]/customize
 * Accepts partial CustomizationParams, merges with existing style,
 * re-generates multi-LOD avatar composites via TemplateAdapter,
 * updates avatar_assets, and returns the updated asset URLs.
 */
export async function PATCH(
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
        'You do not have permission to customize this avatar.'
      );
    }

    // 5. Parse partial customization params
    let updates: Record<string, unknown>;
    try {
      updates = (await request.json()) as Record<string, unknown>;
    } catch {
      return createErrorResponse(
        400,
        'INVALID_PARAMS',
        'Request body must be valid JSON CustomizationParams.'
      );
    }

    if (!updates || typeof updates !== 'object') {
      return createErrorResponse(
        400,
        'INVALID_PARAMS',
        'Customization updates must be an object.'
      );
    }

    // 6. Merge incoming updates with existing style
    const existingStyle: CustomizationParams = {
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

    const mergedParams: CustomizationParams = {
      ...existingStyle,
      ...(updates as Partial<CustomizationParams>),
      eyeSize: typeof updates.eyeSize === 'number'
        ? Math.max(0, Math.min(100, updates.eyeSize))
        : existingStyle.eyeSize,
      noseWidth: typeof updates.noseWidth === 'number'
        ? Math.max(0, Math.min(100, updates.noseWidth))
        : existingStyle.noseWidth,
      jawWidth: typeof updates.jawWidth === 'number'
        ? Math.max(0, Math.min(100, updates.jawWidth))
        : existingStyle.jawWidth
    };

    // 7. Re-run TemplateAdapter with merged parameters
    const adapter = new TemplateAdapter();
    const meshResult = await adapter.generateFromTemplate(mergedParams);

    // 8. Update avatar record in store / database
    await updateAvatar(avatar.id, {
      style: mergedParams,
      status: 'ready',
      updated_at: new Date().toISOString()
    });

    // 9. Update multi-LOD assets in avatar_assets
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

    // 10. Return updated avatar response
    return NextResponse.json(
      {
        avatarId: avatar.id,
        status: 'ready',
        style: mergedParams,
        assetUrl: meshResult.assetUrls.high,
        assetUrls: meshResult.assetUrls
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error customizing avatar.';
    return createErrorResponse(500, 'CUSTOMIZATION_FAILED', message);
  }
}
