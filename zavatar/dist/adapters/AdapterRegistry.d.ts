import { AvatarGenerationAdapter } from './AvatarGenerationAdapter';
/**
 * Registry and resolver for Zavatar Generation Adapters.
 * Evaluates ACTIVE_ADAPTER environment variable and provides seamless fallback to TemplateAdapter.
 */
export declare class AdapterRegistry {
    private static adapters;
    private static templateInstance;
    /**
     * Registers a custom adapter instance under a given key.
     */
    static registerAdapter(name: string, adapter: AvatarGenerationAdapter): void;
    /**
     * Retrieves an adapter by name or resolves the configured default adapter.
     * If MetaPersonAdapter initialization fails or lacks configuration, falls back to TemplateAdapter.
     */
    static getAdapter(name?: string): AvatarGenerationAdapter;
    /**
     * Convenience getter for the active default adapter.
     */
    static getDefaultAdapter(): AvatarGenerationAdapter;
    /**
     * Returns list of known adapter names.
     */
    static listAdapters(): string[];
    /**
     * Returns the name of the currently active adapter.
     */
    static getActiveAdapterName(): string;
}
//# sourceMappingURL=AdapterRegistry.d.ts.map