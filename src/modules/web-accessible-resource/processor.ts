import { BundleMapping } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { RollupWatcher, WatcherOptions } from "rollup";
import { Plugin } from "vite";
import { ComponentProcessor } from "../common";
import { ChromeExtensionManifestEntryMapping } from "../manifest/cache";
import { WebAccessibleResourceProcessorCache } from "./cache";

export interface WebAccessibleResourceProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedWebAccessibleResourceProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[],
}

const DefaultWebAccessibleResourceProcessorOptions: NormalizedWebAccessibleResourceProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class WebAccessibleResourceProcessor extends ComponentProcessor {
    private _options: NormalizedWebAccessibleResourceProcessorOptions;
    private _cache = new WebAccessibleResourceProcessorCache();
    private _watches = new Map<string, RollupWatcher>();

    public resolve(manifest: ChromeExtensionManifest): void {
        manifest.web_accessible_resources?.map(group => group.resources || [])
            .forEach(scripts => {
                scripts.forEach(script => this._cache.entries.push(script));
            });
    }

    public async build(): Promise<BundleMapping[]> {
        this._cache.mappings.forEach(mapping => mapping.visited = false);
        await Promise.all(this._cache.entries?.map(async entry => {
            if (this._cache.mappings.has(entry)) {
                const mapping = this._cache.mappings.get(entry) as ChromeExtensionManifestEntryMapping;
                mapping.visited = true;
            } else {
                // TODO: add build logic
            }
        }));
        // clear corrupt mappings
        this._cache.mappings.forEach((mapping, key) => {
            if (!mapping.visited) {
                if (this._watches.has(mapping.entry)) {
                    this._watches.get(mapping.entry)?.close();
                    this._watches.delete(mapping.entry);
                }
                this._cache.mappings.delete(key);
            }
        });
        return Array.from(this._cache.mappings.values()).map(mapping => ({
            module: mapping.entry,
            bundle: mapping.bundle,
        }));
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public constructor(options: WebAccessibleResourceProcessorOptions = {}) {
        super();
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: WebAccessibleResourceProcessorOptions): NormalizedWebAccessibleResourceProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultWebAccessibleResourceProcessorOptions.plugins; }
        return normalizedOptions as NormalizedWebAccessibleResourceProcessorOptions;
    }
}
