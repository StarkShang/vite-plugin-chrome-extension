import { ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { RollupOutput, RollupWatcher, WatcherOptions } from "rollup";
import vite, { Plugin } from "vite";
import { IComponentProcessor } from "../common";
import { DevtoolsProcessorCache } from "./cache";

export interface DevtoolsProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedDevtoolsProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[];
}

const DefaultDevtoolsProcessorOptions: NormalizedDevtoolsProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class DevtoolsProcessor implements IComponentProcessor {
    private _options: NormalizedDevtoolsProcessorOptions;
    private _cache = new DevtoolsProcessorCache();

    public async resolve(manifest: ChromeExtensionManifest): Promise<string[]> {
        this._cache.manifest = manifest;
        manifest.devtools_page && (this._cache.entry = manifest.devtools_page);
        return [];
    }

    public async build(): Promise<void> {
        if (!this._cache.entry) {
            this._cache.module = undefined;
        } else if (!this._cache.module || this._cache.module.entry !== this._cache.entry) {
            const entry = this._cache.entry;
            const build = await vite.build({
                build: {
                    rollupOptions: { input: entry },
                    emptyOutDir: false,
                    watch: this._options.watch,
                },
                configFile: false, // must set to false, to avoid load config from vite.config.ts
            }) as RollupOutput;
            this._cache.module = {
                entry: this._cache.entry,
                bundle: build.output[0].fileName,
            };
        }
        // update manifest
        if (this._cache.manifest) {
            this._cache.manifest.devtools_page = this._cache.module?.bundle;
        }
    }

    public clearCacheByFilePath(file: string): void {
        this._cache.module = undefined;
    }

    constructor(options: DevtoolsProcessorOptions = {}) {
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: DevtoolsProcessorOptions): NormalizedDevtoolsProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultDevtoolsProcessorOptions.plugins; }
        return normalizedOptions as NormalizedDevtoolsProcessorOptions;
    }
}
