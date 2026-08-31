import { AvatarGenerationAdapter } from './AvatarGenerationAdapter';
import { TemplateAdapter } from './TemplateAdapter';
import { MetaPersonAdapter } from './MetaPersonAdapter';

/**
 * Registry and resolver for Zavatar Generation Adapters.
 * Evaluates ACTIVE_ADAPTER environment variable and provides seamless fallback to TemplateAdapter.
 */
export class AdapterRegistry {
  private static adapters: Map<string, AvatarGenerationAdapter> = new Map();
  private static templateInstance = new TemplateAdapter();

  /**
   * Registers a custom adapter instance under a given key.
   */
  public static registerAdapter(name: string, adapter: AvatarGenerationAdapter): void {
    this.adapters.set(name.toLowerCase(), adapter);
  }

  /**
   * Retrieves an adapter by name or resolves the configured default adapter.
   * If MetaPersonAdapter initialization fails or lacks configuration, falls back to TemplateAdapter.
   */
  public static getAdapter(name?: string): AvatarGenerationAdapter {
    const requestedName = (
      name ||
      process.env.ACTIVE_ADAPTER ||
      'template'
    ).toLowerCase();

    // Check pre-registered adapters
    if (this.adapters.has(requestedName)) {
      return this.adapters.get(requestedName)!;
    }

    // Resolve MetaPerson Adapter if requested
    if (requestedName === 'metaperson') {
      try {
        const metaPerson = new MetaPersonAdapter();
        this.adapters.set('metaperson', metaPerson);
        return metaPerson;
      } catch (err: any) {
        console.warn(
          `[AdapterRegistry] Unable to initialize MetaPersonAdapter (${err.message}). Falling back to TemplateAdapter.`
        );
        return this.templateInstance;
      }
    }

    // Default to TemplateAdapter
    return this.templateInstance;
  }

  /**
   * Convenience getter for the active default adapter.
   */
  public static getDefaultAdapter(): AvatarGenerationAdapter {
    return this.getAdapter();
  }

  /**
   * Returns list of known adapter names.
   */
  public static listAdapters(): string[] {
    return ['template', 'metaperson', ...Array.from(this.adapters.keys())];
  }

  /**
   * Returns the name of the currently active adapter.
   */
  public static getActiveAdapterName(): string {
    return (process.env.ACTIVE_ADAPTER || 'template').toLowerCase();
  }
}
