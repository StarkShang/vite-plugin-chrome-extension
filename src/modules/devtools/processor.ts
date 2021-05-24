import { EventEmitter } from "events";
import { RollupWatcher, WatcherOptions } from "rollup";
import vite, { Plugin } from "vite";
import { IComponentProcessor } from "../common";

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
    private _watcher: RollupWatcher | null = null;

    public resolve(entry: string): Promise<string> {
        return new Promise(resolve => {
            // stop previous watcher
            this.stop();
            vite.build({
                build: {
                    rollupOptions: {
                        input: entry,
                    },
                    emptyOutDir: false,
                    watch: this._options.watch,
                },
                plugins: [{
                    name: "test",
                    generateBundle(_options, bundle, _isWrite) {
                        const entry = Object.entries(bundle)
                            .find(entry => entry[1].type === "chunk" && entry[1].isEntry);
                        resolve(entry ? entry[0] : "");
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
    public async stop(): Promise<void> {
        this._watcher?.close();
        this._watcher = null;
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
