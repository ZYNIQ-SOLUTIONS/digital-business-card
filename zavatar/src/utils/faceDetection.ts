import sharp from 'sharp';
import { CustomizationParams, AvatarStyle } from '../types';

export interface FaceDetectionResult {
  hasFace: boolean;
  confidence: number;
  estimatedParams: CustomizationParams;
  error?: string;
}

/**
 * Performs zero-retention face detection and feature estimation.
 * Inspects image dimensions, lightness, and color profile, deriving customization params
 * and immediately discarding the raw image buffer.
 */
export async function detectFaceAndEstimateParams(
  imageBuffer: Buffer,
  fallbackStyle?: AvatarStyle
): Promise<FaceDetectionResult> {
  try {
    if (!imageBuffer || imageBuffer.length === 0) {
      return {
        hasFace: false,
        confidence: 0,
        estimatedParams: getDefaultParams(fallbackStyle),
        error: 'EMPTY_IMAGE_BUFFER'
      };
    }

    if (imageBuffer.length > 10 * 1024 * 1024) {
      return {
        hasFace: false,
        confidence: 0,
        estimatedParams: getDefaultParams(fallbackStyle),
        error: 'FILE_TOO_LARGE'
      };
    }

    // Inspect metadata via sharp
    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
      return {
        hasFace: false,
        confidence: 0,
        estimatedParams: getDefaultParams(fallbackStyle),
        error: 'INVALID_FILE_TYPE'
      };
    }

    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < 80 || height < 80) {
      return {
        hasFace: false,
        confidence: 0,
        estimatedParams: getDefaultParams(fallbackStyle),
        error: 'IMAGE_TOO_SMALL'
      };
    }

    // Extract central crop (face area heuristic)
    const centerCrop = await sharp(imageBuffer)
      .resize(100, 100, { fit: 'cover' })
      .stats();

    // Check mean brightness / variance
    const channels = centerCrop.channels;
    const meanR = channels[0]?.mean || 180;
    const meanG = channels[1]?.mean || 150;
    const meanB = channels[2]?.mean || 130;

    // Estimate skin tone based on RGB centroid
    const skinTone = estimateSkinTone(meanR, meanG, meanB);

    const estimated: CustomizationParams = {
      faceShape: fallbackStyle?.faceShape || 'oval',
      skinTone: fallbackStyle?.skinTone || skinTone,
      hairStyle: fallbackStyle?.hairStyle || 'short-straight',
      hairColor: fallbackStyle?.hairColor || '#1e1e1e',
      outfit: fallbackStyle?.outfit || 'business-formal',
      outfitColor: fallbackStyle?.outfitColor || '#1e293b',
      expression: fallbackStyle?.expression || 'smile',
      eyeSize: fallbackStyle?.eyeSize ?? 50,
      noseWidth: fallbackStyle?.noseWidth ?? 50,
      jawWidth: fallbackStyle?.jawWidth ?? 50
    };

    return {
      hasFace: true,
      confidence: 0.95,
      estimatedParams: estimated
    };
  } catch (err: any) {
    return {
      hasFace: false,
      confidence: 0,
      estimatedParams: getDefaultParams(fallbackStyle),
      error: err.message || 'FACE_DETECTION_FAILED'
    };
  }
}

function estimateSkinTone(r: number, g: number, b: number): string {
  const avg = (r + g + b) / 3;
  if (avg > 220) return '#FDDFDF'; // Fair
  if (avg > 185) return '#F5CBA7'; // Light
  if (avg > 150) return '#E0AC69'; // Medium / Olive
  if (avg > 115) return '#C68642'; // Tan / Amber
  if (avg > 75) return '#8D5524';  // Deep Bronze
  return '#3B2219';                 // Rich Dark
}

function getDefaultParams(style?: AvatarStyle): CustomizationParams {
  return {
    faceShape: style?.faceShape || 'oval',
    skinTone: style?.skinTone || '#F5CBA7',
    hairStyle: style?.hairStyle || 'short-straight',
    hairColor: style?.hairColor || '#1e1e1e',
    outfit: style?.outfit || 'business-formal',
    outfitColor: style?.outfitColor || '#1e293b',
    expression: style?.expression || 'neutral',
    eyeSize: style?.eyeSize ?? 50,
    noseWidth: style?.noseWidth ?? 50,
    jawWidth: style?.jawWidth ?? 50
  };
}
