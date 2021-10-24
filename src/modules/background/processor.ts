import { OutputBundle, OutputChunk, PluginContext, RollupOutput, RollupWatcher, TransformPluginContext, WatcherOptions } from "rollup";
import { resolve, parse, join, dirname } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import slash from "slash";
import { ChromeExtensionManifest } from "../../manifest";
import { removeFileExtension } from "../../common/utils";
import { findChunkByName } from "../../common/utils/helpers";
import { mixinChunksForIIFE } from "../../common/mixin";
import vite, { AliasOptions, Plugin } from "vite";
import { IComponentProcessor } from "../../common/processors/base";
import { BackgroundProcessorCache } from "./cache";
import { ChromeExtensionModule } from "@/common/models";
import chalk from "chalk";
import { ensureDir } from "fs-extra";

const dynamicImportAssetRex = /(?<=chrome.scripting.insertCSS\()[\s\S]*?(?=\))/gm;
const dynamicImportScriptRex = /(?<=chrome.scripting.executeScript\()[\s\S]*?(?=\))/gm;

export interface BackgroundDynamicImport {
    code: string;
    imports: string[];
}

export interface BackgroundProcessorOptions {
    root?: string;
    outDir?: string;
    alias?: AliasOptions;
    plugins?: Plugin[];
}

export interface NormalizedBackgroundProcessorOptions {
    root: string;
    outDir: string;
    alias: AliasOptions;
    plugins: Plugin[],
}

const DefaultBackgroundProcessorOptions: NormalizedBackgroundProcessorOptions = {
    root: process.cwd(),
    outDir: join(process.cwd(), "dist"),
    alias: [],
    plugins: [],
};

export class BackgroundProcessor implements IComponentProcessor {
    private _options: NormalizedBackgroundProcessorOptions;
    private _cache = new BackgroundProcessorCache();

    public async resolve(manifest: ChromeExtensionManifest): Promise<string[]> {
        this._cache.manifest = manifest;
        if (manifest.background?.service_worker) {
            const entry = manifest.background.service_worker;
            if (!this._cache.module || entry !== this._cache.entry) {
                console.log(chalk`{blue rebuilding background}`);
                this._cache.module = (await this.run(entry)).output;
                this._cache.entry = entry;
            }
            return this._cache.module.map(chunk => {
                const modules = [];
                if (chunk.type === "chunk") {
                    modules.push(...Object.keys(chunk.modules));
                    modules.push(...chunk.imports);
                }
                return modules;
            }).reduce((result, modules) => result.concat(modules), []);
        } else {
            return [];
        }
    }

    public async build(): Promise<void> {
        if (!this._cache.entry || !this._cache.module) { return undefined; }
        const outputPath = resolve(this._options.root, this._options.outDir);
        await ensureDir(outputPath);
        this._cache.module.forEach(chunk => {
            const outputFilePath = resolve(outputPath, chunk.fileName);
            const dirName = dirname(outputFilePath);
            if (!existsSync(dirName)) { mkdirSync(dirName); }
            if (chunk.type === "chunk") {
                writeFileSync(outputFilePath, chunk.code);
            } else {
                writeFileSync(outputFilePath, chunk.source);
            }
        });
        const entryBundle = this._cache.module.find(module => {
            if (module.type === "chunk") {
                return module.facadeModuleId
                    ? slash(module.facadeModuleId) === slash(resolve(this._options.root, this._cache.entry || ""))
                    : false;
            } else {
                return module.fileName === this._cache.entry;
            }
        });
        // update manifest
        if (this._cache.manifest) {
            this._cache.manifest.background = {
                service_worker: entryBundle!.fileName,
            };
        }
    }

    public clearCacheByFilePath(file: string): void {
        this._cache.module = undefined;
    }

    constructor(options: BackgroundProcessorOptions) {
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: BackgroundProcessorOptions): NormalizedBackgroundProcessorOptions {
        const normalizedOptions = { ...options };
        // check root path
        if (!normalizedOptions.root || !existsSync(normalizedOptions.root)) {
            throw new Error("root path does not exist");
        }
        if (!normalizedOptions.outDir) {
            normalizedOptions.outDir = DefaultBackgroundProcessorOptions.outDir;
        }
        if (!normalizedOptions.alias) {
            normalizedOptions.alias = DefaultBackgroundProcessorOptions.alias;
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultBackgroundProcessorOptions.plugins; }
        return normalizedOptions as NormalizedBackgroundProcessorOptions;
    }

    public resolveDynamicImports(context: TransformPluginContext, code: string): BackgroundDynamicImport {
        if (!this._options.root) {
            throw new TypeError("BackgroundProcessor: options.srcDir is not initialized");
        }
        /* ----------------- PROCESS DYNAMICALLY IMPORTED ASSETS -----------------*/
        code.match(dynamicImportAssetRex)
            ?.map(m => m.match(/(?<=(files:\[)?\")[\s\S]*?(?=\]?\")/gm))
            .reduce((f, m) => f.concat(...(m || [])) || [], [] as string[])
            .map(m => { console.log("resolveDynamicImports", m); return m; })
            .forEach(m => {
                const filePath = resolve(this._options.root, m);
                if (existsSync(filePath)) {
                    context.emitFile({
                        type: "asset",
                        fileName: m,
                        source: readFileSync(filePath),
                    });
                }
            });
        /* ----------------- PROCESS DYNAMICALLY IMPORTED SCRIPTS -----------------*/
        // dynamicImports collects files used by chrome.scripting.executeScript
        const dynamicImports: string[] = [];
        const updatedCode = code.replace(
            dynamicImportScriptRex,
            match => match.replace(/(?<=(files:\[)?)\"[\s\S]*?\"(?=\]?)/gm, fileStr => {
                const file = parse(fileStr.replace(/\"/g, "").trim());
                const filePath = resolve(this._options.root, file.dir, file.base);
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

    public async run(entry: string): Promise<RollupOutput> {
        const entryFilePath = resolve(this._options.root, entry);
        return await vite.build({
            root: this._options.root,
            resolve: {
                alias: this._options.alias,
            },
            plugins: [...this._options.plugins, {
                name: "chrome-extension-background",
                generateBundle(_options, bundle) {
                    Object.keys(bundle).forEach(key => {
                        const chunk = bundle[key];
                        if (chunk.type === "chunk"
                            && chunk.facadeModuleId
                            && slash(chunk.facadeModuleId) === slash(entryFilePath)) {
                            chunk.fileName = parse(chunk.fileName).base;
                            delete bundle[key];
                            bundle[chunk.fileName] = chunk;
                        }
                    });
                }
            }],
            build: {
                rollupOptions: { input: resolve(this._options.root, entry) },
                emptyOutDir: false,
                write: false,
            },
            configFile: false, // must set to false, to avoid load config from vite.config.ts
        }) as RollupOutput;
    }
}
