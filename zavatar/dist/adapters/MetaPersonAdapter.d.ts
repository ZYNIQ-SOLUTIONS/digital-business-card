import { AvatarGenerationAdapter } from './AvatarGenerationAdapter';
import { AvatarMeshResult, AvatarStyle, CustomizationParams } from '../types';
/**
 * MetaPerson Avatar SDK Cloud Integration Adapter.
 * Integrates with Avatar SDK Cloud REST API (https://api.metaperson.avatarsdk.com/v1/)
 * to generate realistic 3D photorealistic GLB avatars from selfie images.
 */
export declare class MetaPersonAdapter implements AvatarGenerationAdapter {
    private apiKey?;
    private endpoint;
    constructor(apiKey?: string, endpoint?: string);
    /**
     * Health check for MetaPerson Cloud API connectivity.
     */
    healthCheck(): Promise<boolean>;
    /**
     * Generates a 3D GLB avatar from a selfie image via MetaPerson Cloud API.
     */
    generateFromSelfie(image: Buffer, style?: AvatarStyle): Promise<AvatarMeshResult>;
    /**
     * Generates an avatar from template parameters using MetaPerson parameter presets.
     */
    generateFromTemplate(params: CustomizationParams): Promise<AvatarMeshResult>;
}
//# sourceMappingURL=MetaPersonAdapter.d.ts.map