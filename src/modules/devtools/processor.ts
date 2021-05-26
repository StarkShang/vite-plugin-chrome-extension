import { BundleMapping } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { EventEmitter } from "events";
import { RollupWatcher, WatcherOptions } from "rollup";
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

    public async build(): Promise<BundleMapping> {
        if (this._cache.mapping.module === this._cache.entry) {
            return this._cache.mapping;
        } else {
            return new Promise<BundleMapping>(resolve => {
                const entry = this._cache.entry;
                // stop previous watcher
                this.stop();
                vite.build({
                    build: {
                        rollupOptions: {
                            input: this._cache.entry,
                        },
                        emptyOutDir: false,
                        watch: this._options.watch,
                    },
                    plugins: [{
                        name: "test",
                        generateBundle(_options, bundle, _isWrite) {
                            const chunk = Object.entries(bundle)
                                .find(([, chunk]) => chunk.type === "chunk" && chunk.isEntry);
                            resolve(chunk ? ({
                                module: entry as string,
                                bundle: chunk[0] as string,
                            }) : ({
                                module: entry as string,
                                bundle: "",
                            }));
                        },
                    }],
                    configFile: false, // must set to false, to avoid load config from vite.config.ts
                }).then(output => {
                    if (output instanceof EventEmitter) {
                        const watcher = output as RollupWatcher;
                        this._watcher = watcher;
                    }
                });
            });
        }
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
