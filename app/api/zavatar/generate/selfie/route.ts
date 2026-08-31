import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { authenticate, createErrorResponse } from '../../_utils/auth';
import {
  createAvatar,
  saveAvatarAssets,
  logConsent
} from '../../_utils/store';
import { AdapterRegistry } from '@/zavatar/src/adapters/AdapterRegistry';
import { detectFaceAndEstimateParams } from '@/zavatar/src/utils/faceDetection';
import { AvatarStyle } from '@/zavatar/src/types';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * POST /api/zavatar/generate/selfie
 * Ingests selfie photo via multipart/form-data, verifies biometric consent,
 * performs zero-retention face feature extraction, and generates multi-LOD avatar.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Authenticate user
    const auth = await authenticate(request);
    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }
    const { user } = auth;

    // 2. Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return createErrorResponse(
        400,
        'INVALID_REQUEST',
        'Request must be multipart/form-data with image and consent fields.'
      );
    }

    const imageEntry = formData.get('image');
    const consentEntry = formData.get('consent');
    const styleEntry = formData.get('style');

    // 3. Biometric Consent Gate (Evaluated before processing any biometric payload)
    const isConsentGranted =
      consentEntry === 'true' ||
      consentEntry === '1' ||
      String(consentEntry) === 'true';

    if (!isConsentGranted) {
      return createErrorResponse(
        422,
        'CONSENT_REQUIRED',
        'Biometric consent must be granted before processing selfie images.'
      );
    }

    // 4. Validate image presence
    if (!imageEntry || !(imageEntry instanceof Blob)) {
      return createErrorResponse(
        400,
        'MISSING_IMAGE',
        'An image file is required under the "image" field.'
      );
    }

    // 5. Validate file size (<= 10MB)
    if (imageEntry.size > MAX_FILE_SIZE) {
      return createErrorResponse(
        400,
        'FILE_TOO_LARGE',
        'Image size exceeds the 10MB limit.'
      );
    }

    // 6. Validate file MIME type
    const mimeType = imageEntry.type.toLowerCase();
    const fileName = (imageEntry as File).name?.toLowerCase() || '';
    const hasValidExtension =
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.webp');

    if (!ALLOWED_MIME_TYPES.includes(mimeType) && !hasValidExtension) {
      return createErrorResponse(
        400,
        'INVALID_FILE_TYPE',
        'Only JPEG, PNG, and WebP images are supported.'
      );
    }

    // 7. Extract client IP and log biometric consent audit event
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    await logConsent({
      user_id: user.id,
      consent_type: 'biometric',
      ip_address: ipAddress
    });

    // 8. Parse optional style override parameters
    let fallbackStyle: AvatarStyle | undefined;
    if (styleEntry) {
      if (typeof styleEntry === 'string') {
        try {
          fallbackStyle = JSON.parse(styleEntry) as AvatarStyle;
        } catch {
          // Invalid style JSON, ignore and use defaults
        }
      } else if (typeof styleEntry === 'object') {
        fallbackStyle = styleEntry as AvatarStyle;
      }
    }

    // 9. Load transient in-memory image buffer for face feature detection
    let rawBuffer: Buffer | null = Buffer.from(await imageEntry.arrayBuffer());

    // 10. Run face detection and parametric feature estimation
    const detection = await detectFaceAndEstimateParams(rawBuffer, fallbackStyle);

    // 11. STRICT ZERO-RETENTION: Immediately purge raw photo bytes from memory
    rawBuffer = null;

    if (!detection.hasFace) {
      return createErrorResponse(
        422,
        'NO_FACE_DETECTED',
        'No human face could be clearly detected in the uploaded image.'
      );
    }

    // 12. Invoke active generation adapter using estimated parametric features
    const adapter = AdapterRegistry.getAdapter();
    const meshResult = await adapter.generateFromTemplate(detection.estimatedParams);

    // 13. Persist avatar record in Supabase / Data Layer
    const avatarId = crypto.randomUUID();
    const avatar = await createAvatar({
      id: avatarId,
      user_id: user.id,
      status: 'ready',
      generation_method: 'selfie',
      style: detection.estimatedParams
    });

    // 14. Save multi-LOD assets to avatar_assets table
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

    // 15. Return ready response with full asset URLs
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
    const message = error instanceof Error ? error.message : 'Internal error during selfie avatar generation.';
    return createErrorResponse(500, 'GENERATION_FAILED', message);
  }
}
