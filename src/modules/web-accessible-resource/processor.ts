import { ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { RollupWatcher, WatcherOptions } from "rollup";
import { Plugin } from "vite";
import { IComponentProcessor } from "../common";
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

export class WebAccessibleResourceProcessor implements IComponentProcessor {
    private _options: NormalizedWebAccessibleResourceProcessorOptions;
    private _cache = new WebAccessibleResourceProcessorCache();
    private _watches = new Map<string, RollupWatcher>();

    public resolve(manifest: ChromeExtensionManifest): void {
        manifest.web_accessible_resources?.map(group => group.resources || [])
            .forEach(scripts => {
                scripts.forEach(script => this._cache.entries.push(script));
            });
    }

    public async build(): Promise<ChromeExtensionModule[]> {
        this._cache.modules.forEach(module => module.visited = false);
        await Promise.all(this._cache.entries?.map(async entry => {
            if (this._cache.modules.has(entry)) {
                const module = this._cache.modules.get(entry);
                module && (module.visited = true);
            } else {
                // TODO: add build logic
                throw new Error("Method not implemented.");
            }
        }));
        // clear corrupt modules
        this._cache.modules.forEach((module, key) => {
            if (!module.visited) {
                this._cache.modules.delete(key);
            }
        });
        return Array.from(this._cache.modules.values());
    }

    public constructor(options: WebAccessibleResourceProcessorOptions = {}) {
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
