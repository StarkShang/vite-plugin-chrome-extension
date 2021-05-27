import { BundleMapping, ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { EventEmitter } from "events";
import { RollupOptions, RollupOutput, RollupWatcher, WatcherOptions } from "rollup";
import vite, { Plugin } from "vite";
import { ComponentProcessor } from "../common";
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

export class DevtoolsProcessor extends ComponentProcessor {
    private _options: NormalizedDevtoolsProcessorOptions;
    private _cache = new DevtoolsProcessorCache();
    private _watcher: RollupWatcher | null = null;

    public resolve(manifest: ChromeExtensionManifest): void {
        manifest.devtools_page && (this._cache.entry = manifest.devtools_page);
    }

    public async build(): Promise<ChromeExtensionModule> {
        if (this._cache.entry && this._cache.module.entry === this._cache.entry) {
                const entry = this._cache.entry;
                const build = await vite.build({
                    build: {
                        rollupOptions: { input: entry },
                        emptyOutDir: false,
                        watch: this._options.watch,
                    },
                    configFile: false, // must set to false, to avoid load config from vite.config.ts
                }) as RollupOutput;
                this._cache.module.entry = this._cache.entry;
                this._cache.module.bundle = build.output[0].fileName;
                this._cache.module.dependencies = build.output[0].referencedFiles;
        }
        return this._cache.module;
    }

    public async stop(): Promise<void> {
        this._watcher?.close();
        this._watcher = null;
    }

    constructor(options: DevtoolsProcessorOptions = {}) {
        super();
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
