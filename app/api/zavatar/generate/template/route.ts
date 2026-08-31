import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { authenticate, createErrorResponse } from '../../_utils/auth';
import {
  createAvatar,
  saveAvatarAssets
} from '../../_utils/store';
import { TemplateAdapter } from '@/zavatar/src/adapters/TemplateAdapter';
import {
  CustomizationParams,
  AvatarFaceShape,
  AvatarSkinTone,
  AvatarHairStyle,
  AvatarOutfit,
  AvatarExpression
} from '@/zavatar/src/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/zavatar/generate/template
 * Accepts JSON CustomizationParams, generates multi-LOD 2D avatar composite
 * using TemplateAdapter, persists to Supabase data layer, and returns asset URLs.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Authenticate user
    const auth = await authenticate(request);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }
    const { user } = auth;

    // 2. Parse JSON body
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return createErrorResponse(
        400,
        'INVALID_PARAMS',
        'Request body must be valid JSON CustomizationParams.'
      );
    }

    if (!body || typeof body !== 'object') {
      return createErrorResponse(
        400,
        'INVALID_PARAMS',
        'Customization parameters must be an object.'
      );
    }

    // 3. Normalize and sanitize customization params with sensible defaults
    const params: CustomizationParams = {
      faceShape: (body.faceShape as AvatarFaceShape) || 'oval',
      skinTone: (body.skinTone as AvatarSkinTone) || '#F5CBA7',
      hairStyle: (body.hairStyle as AvatarHairStyle) || 'short-straight',
      hairColor: (body.hairColor as string) || '#1e1e1e',
      outfit: (body.outfit as AvatarOutfit) || 'business-formal',
      outfitColor: (body.outfitColor as string) || '#1e293b',
      expression: (body.expression as AvatarExpression) || 'neutral',
      eyeSize: typeof body.eyeSize === 'number' ? Math.max(0, Math.min(100, body.eyeSize)) : 50,
      noseWidth: typeof body.noseWidth === 'number' ? Math.max(0, Math.min(100, body.noseWidth)) : 50,
      jawWidth: typeof body.jawWidth === 'number' ? Math.max(0, Math.min(100, body.jawWidth)) : 50,
      accessories: Array.isArray(body.accessories) ? (body.accessories as string[]) : [],
      glasses: body.glasses as string | undefined,
      beard: body.beard as string | undefined,
      background: body.background as string | undefined
    };

    // 4. Generate multi-LOD avatar composite via TemplateAdapter
    const adapter = new TemplateAdapter();
    const meshResult = await adapter.generateFromTemplate(params);

    // 5. Persist avatar record
    const avatarId = crypto.randomUUID();
    const avatar = await createAvatar({
      id: avatarId,
      user_id: user.id,
      status: 'ready',
      generation_method: 'template',
      style: params
    });

    // 6. Save multi-LOD assets (high, mid, low, svg)
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

    // 7. Return ready response with asset URLs
    return NextResponse.json(
      {
        avatarId: avatar.id,
        status: 'ready',
        assetUrl: meshResult.assetUrls.high,
        assetUrls: meshResult.assetUrls
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error generating template avatar.';
    return createErrorResponse(500, 'GENERATION_FAILED', message);
  }
}
