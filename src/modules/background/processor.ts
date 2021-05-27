import { OutputBundle, PluginContext, RollupWatcher, TransformPluginContext, WatcherOptions } from "rollup";
import { resolve, parse, join,  } from "path";
import { existsSync, readFileSync } from "fs";
import slash from "slash";
import { ChromeExtensionManifest } from "../../manifest";
import { removeFileExtension } from "../../common/utils";
import { findChunkByName } from "../../utils/helpers";
import { mixinChunksForIIFE } from "../mixin";
import vite, { Plugin } from "vite";
import { EventEmitter } from "events";
import { ComponentProcessor } from "../common";
import { BackgroundProcessorCache } from "./cache";
import { BundleMapping } from "@/common/models";

const dynamicImportAssetRex = /(?<=chrome.scripting.insertCSS\()[\s\S]*?(?=\))/gm;
const dynamicImportScriptRex = /(?<=chrome.scripting.executeScript\()[\s\S]*?(?=\))/gm;

export interface BackgroundDynamicImport {
    code: string;
    imports: string[];
}

export interface BackgroundProcessorOptions {
    rootPath: string;
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedBackgroundProcessorOptions {
    rootPath: string;
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[],
}

const DefaultBackgroundProcessorOptions: NormalizedBackgroundProcessorOptions = {
    rootPath: "",
    watch: undefined,
    plugins: [],
};

export class BackgroundProcessor extends ComponentProcessor {
    private _options: NormalizedBackgroundProcessorOptions;
    private _cache = new BackgroundProcessorCache();
    private _watcher: RollupWatcher | null = null;

    public resolve(manifest: ChromeExtensionManifest): void {
        manifest.background
            && manifest.background.service_worker
            && (this._cache.entry = manifest.background.service_worker);
    }

    public async build(): Promise<BundleMapping> {
        if (this._cache.mapping.module === this._cache.entry) {
            return this._cache.mapping;
        } else {
            const entry = this._cache.entry;
            return new Promise(resolve => {
                // stop previous watcher
                this.stop();
                vite.build({
                    build: {
                        rollupOptions: {
                            input: entry,
                        },
                        emptyOutDir: false,
                        watch: this._options.watch
                            ? { clearScreen: true }
                            : null,
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

    public async stop() {
        this._watcher?.close();
        this._watcher = null;
    }

    constructor(options: BackgroundProcessorOptions) {
        super();
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: BackgroundProcessorOptions): NormalizedBackgroundProcessorOptions {
        const normalizedOptions = { ...options };
        // check root path
        if (!existsSync(normalizedOptions.rootPath)) {
            throw new Error("root path does not exist");
        }
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultBackgroundProcessorOptions.plugins; }
        return normalizedOptions as NormalizedBackgroundProcessorOptions;
    }

    public resolveDynamicImports(context: TransformPluginContext, code: string): BackgroundDynamicImport {
        if (!this._options.rootPath) {
            throw new TypeError("BackgroundProcessor: options.srcDir is not initialized");
        }
        /* ----------------- PROCESS DYNAMICALLY IMPORTED ASSETS -----------------*/
        code.match(dynamicImportAssetRex)
            ?.map(m => m.match(/(?<=(files:\[)?\")[\s\S]*?(?=\]?\")/gm))
            .reduce((f, m) => f.concat(...(m || [])) || [], [] as string[])
            .map(m => { console.log("resolveDynamicImports", m); return m; })
            .forEach(m => {
                const filePath = resolve(this._options.rootPath!, m);
                if (existsSync(filePath)) {
                    context.emitFile({
                        type: "asset",
                        fileName: m,
                        source: readFileSync(filePath),
                    })
                }
            });
        /* ----------------- PROCESS DYNAMICALLY IMPORTED SCRIPTS -----------------*/
        // dynamicImports collects files used by chrome.scripting.executeScript
        const dynamicImports: string[] = [];
        const updatedCode = code.replace(
            dynamicImportScriptRex,
            match => match.replace(/(?<=(files:\[)?)\"[\s\S]*?\"(?=\]?)/gm, fileStr => {
                const file = parse(fileStr.replace(/\"/g, "").trim());
                const filePath = resolve(this._options.rootPath!, file.dir, file.base);
                if (existsSync(filePath)) {
                    const referenceId = context.emitFile({
                        id: filePath,
                        type: "chunk",
                        name: join(file.dir, file.name)
                    });
                    dynamicImports.push(referenceId);
                    return `import.meta.ROLLUP_FILE_URL_${referenceId}`;
                } else {
                    return fileStr;
                }
            })
        );
        return { code: updatedCode, imports: dynamicImports };
    }

    public async generateBundle(
        context: PluginContext,
        bundle: OutputBundle,
        manifest: ChromeExtensionManifest
    ): Promise<void> {
        if (manifest.background?.service_worker) {
            // make background chunk output in the same directory as manifest.json
            const chunk = findChunkByName(removeFileExtension(manifest.background.service_worker), bundle);
            if (chunk) {
                // mixin all dependent chunks
                // change background chunk output in the same directory as manifest.json
                chunk.fileName = chunk.fileName.replace(/assets\//, "");
                manifest.background.service_worker = slash(await mixinChunksForIIFE(context, chunk, bundle));
            }
        }
    }
}
