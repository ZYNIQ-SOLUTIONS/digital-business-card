import sharp from 'sharp';
import crypto from 'crypto';
import { AvatarGenerationAdapter } from './AvatarGenerationAdapter';
import {
  AvatarMeshResult,
  AvatarStyle,
  CustomizationParams,
  AvatarAssetUrls
} from '../types';
import { SvgBuilder } from '../utils/svgBuilder';
import { detectFaceAndEstimateParams } from '../utils/faceDetection';

/**
 * Local high-performance 2D parametric avatar compositing engine.
 * Assembles modular SVG layers and renders multi-LOD PNG assets (512px, 256px, 64px) using Sharp.
 */
export class TemplateAdapter implements AvatarGenerationAdapter {
  /**
   * Health check confirming Sharp and SVG pipeline are operational.
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const testSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#000"/></svg>';
      const buffer = await sharp(Buffer.from(testSvg)).png().toBuffer();
      return buffer.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Generates a multi-LOD avatar composite from parametric customization options.
   */
  public async generateFromTemplate(params: CustomizationParams): Promise<AvatarMeshResult> {
    const startTime = Date.now();

    // 1. Build composite SVG string
    const svgContent = SvgBuilder.buildAvatarSvg(params);
    const svgBuffer = Buffer.from(svgContent);

    // 2. Compute parameters hash for asset identification
    const paramsJson = JSON.stringify(params);
    const paramsHash = crypto.createHash('sha256').update(paramsJson).digest('hex').substring(0, 16);

    // 3. Render High LOD (512x512 PNG)
    const highBuffer = await sharp(svgBuffer)
      .resize(512, 512)
      .png({ quality: 90, compressionLevel: 6 })
      .toBuffer();

    // 4. Render Mid LOD (256x256 PNG)
    const midBuffer = await sharp(svgBuffer)
      .resize(256, 256)
      .png({ quality: 85, compressionLevel: 6 })
      .toBuffer();

    // 5. Render Low LOD (64x64 PNG)
    const lowBuffer = await sharp(svgBuffer)
      .resize(64, 64)
      .png({ quality: 80, compressionLevel: 7 })
      .toBuffer();

    const highDataUrl = `data:image/png;base64,${highBuffer.toString('base64')}`;
    const midDataUrl = `data:image/png;base64,${midBuffer.toString('base64')}`;
    const lowDataUrl = `data:image/png;base64,${lowBuffer.toString('base64')}`;
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

    const assetUrls: AvatarAssetUrls = {
      high: highDataUrl,
      mid: midDataUrl,
      low: lowDataUrl,
      svg: svgDataUrl
    };

    const generationTimeMs = Date.now() - startTime;

    return {
      avatarId: `zavatar-${paramsHash}`,
      format: 'png',
      assetUrls,
      assetUrl: highDataUrl,
      metadata: {
        generator: 'TemplateAdapter',
        lodLevels: ['high', 'mid', 'low'],
        generationTimeMs,
        paramsHash,
        dimensions: {
          high: { width: 512, height: 512 },
          mid: { width: 256, height: 256 },
          low: { width: 64, height: 64 }
        }
      }
    };
  }

  /**
   * Generates an avatar from an uploaded selfie buffer.
   * Extracts facial features and maps them to parametric customization parameters.
   */
  public async generateFromSelfie(
    image: Buffer,
    style?: AvatarStyle
  ): Promise<AvatarMeshResult> {
    const detection = await detectFaceAndEstimateParams(image, style);
    if (!detection.hasFace && detection.error) {
      throw new Error(`Face detection failed: ${detection.error}`);
    }

    return this.generateFromTemplate(detection.estimatedParams);
  }
}
