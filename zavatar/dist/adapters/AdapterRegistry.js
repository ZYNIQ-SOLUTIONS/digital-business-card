"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterRegistry = void 0;
const TemplateAdapter_1 = require("./TemplateAdapter");
const MetaPersonAdapter_1 = require("./MetaPersonAdapter");
/**
 * Registry and resolver for Zavatar Generation Adapters.
 * Evaluates ACTIVE_ADAPTER environment variable and provides seamless fallback to TemplateAdapter.
 */
class AdapterRegistry {
    static adapters = new Map();
    static templateInstance = new TemplateAdapter_1.TemplateAdapter();
    /**
     * Registers a custom adapter instance under a given key.
     */
    static registerAdapter(name, adapter) {
        this.adapters.set(name.toLowerCase(), adapter);
    }
    /**
     * Retrieves an adapter by name or resolves the configured default adapter.
     * If MetaPersonAdapter initialization fails or lacks configuration, falls back to TemplateAdapter.
     */
    static getAdapter(name) {
        const requestedName = (name ||
            process.env.ACTIVE_ADAPTER ||
            'template').toLowerCase();
        // Check pre-registered adapters
        if (this.adapters.has(requestedName)) {
            return this.adapters.get(requestedName);
        }
        // Resolve MetaPerson Adapter if requested
        if (requestedName === 'metaperson') {
            try {
                const metaPerson = new MetaPersonAdapter_1.MetaPersonAdapter();
                this.adapters.set('metaperson', metaPerson);
                return metaPerson;
            }
            catch (err) {
                console.warn(`[AdapterRegistry] Unable to initialize MetaPersonAdapter (${err.message}). Falling back to TemplateAdapter.`);
                return this.templateInstance;
            }
        }
        // Default to TemplateAdapter
        return this.templateInstance;
    }
    /**
     * Convenience getter for the active default adapter.
     */
    static getDefaultAdapter() {
        return this.getAdapter();
    }
    /**
     * Returns list of known adapter names.
     */
    static listAdapters() {
        return ['template', 'metaperson', ...Array.from(this.adapters.keys())];
    }
    /**
     * Returns the name of the currently active adapter.
     */
    static getActiveAdapterName() {
        return (process.env.ACTIVE_ADAPTER || 'template').toLowerCase();
    }
}
exports.AdapterRegistry = AdapterRegistry;
//# sourceMappingURL=AdapterRegistry.js.map