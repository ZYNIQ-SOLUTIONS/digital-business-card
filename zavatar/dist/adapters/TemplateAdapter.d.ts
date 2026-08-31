import { AvatarGenerationAdapter } from './AvatarGenerationAdapter';
import { AvatarMeshResult, AvatarStyle, CustomizationParams } from '../types';
/**
 * Local high-performance 2D parametric avatar compositing engine.
 * Assembles modular SVG layers and renders multi-LOD PNG assets (512px, 256px, 64px) using Sharp.
 */
export declare class TemplateAdapter implements AvatarGenerationAdapter {
    /**
     * Health check confirming Sharp and SVG pipeline are operational.
     */
    healthCheck(): Promise<boolean>;
    /**
     * Generates a multi-LOD avatar composite from parametric customization options.
     */
    generateFromTemplate(params: CustomizationParams): Promise<AvatarMeshResult>;
    /**
     * Generates an avatar from an uploaded selfie buffer.
     * Extracts facial features and maps them to parametric customization parameters.
     */
    generateFromSelfie(image: Buffer, style?: AvatarStyle): Promise<AvatarMeshResult>;
}
//# sourceMappingURL=TemplateAdapter.d.ts.map