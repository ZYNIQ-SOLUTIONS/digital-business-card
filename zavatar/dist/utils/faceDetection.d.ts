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
export declare function detectFaceAndEstimateParams(imageBuffer: Buffer, fallbackStyle?: AvatarStyle): Promise<FaceDetectionResult>;
//# sourceMappingURL=faceDetection.d.ts.map