import path from "path";
import fs from "fs";
import vite from "vite";
import chalk from "chalk";
import { RollupOutput } from "rollup";
import { IComponentProcessor } from "../common";
import { PopupProcessorCache } from "./cache";
import { ChromeExtensionManifest } from "@/manifest";
import { DefaultPopupProcessorOptions, PopupProcessorInternalOptions, PopupProcessorNormalizedOptions } from "./option";
import slash from "slash";

export class PopupProcessor implements IComponentProcessor {
    private _options: PopupProcessorNormalizedOptions;
    private _cache = new PopupProcessorCache();

    public async resolve(manifest: ChromeExtensionManifest): Promise<string[]> {
        this._cache.manifest = manifest;
        if (manifest.action?.default_popup) {
            const entry = manifest.action.default_popup;
            if (!this._cache.module || entry !== this._cache.entry) {
                console.log(chalk`{blue rebuilding popup: ${entry}}`);
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
        const outputPath = path.resolve(this._options.root, this._options.outDir);
        if (fs.existsSync(outputPath)) {
            this._cache.module.forEach(chunk => {
                const outputFilePath = path.resolve(outputPath, chunk.fileName);
                const dirName = path.dirname(outputFilePath);
                if (!fs.existsSync(dirName)) { fs.mkdirSync(dirName); }
                if (chunk.type === "chunk") {
                    fs.writeFileSync(outputFilePath, chunk.code);
                } else {
                    fs.writeFileSync(outputFilePath, chunk.source);
                }
            });
        }

        const entryBundle = this._cache.module.find(module => {
            if (module.type === "chunk") {
                return module.facadeModuleId === path.resolve(this._options.root, this._cache.entry || "");
            } else {
                return module.fileName === this._cache.entry;
            }
        });
        // update manifest
        if (this._cache.manifest) {
            if (this._cache.manifest.action) {
                this._cache.manifest.action.default_popup = entryBundle!.fileName;
            } else {
                this._cache.manifest.action = {
                    default_popup: entryBundle!.fileName,
                };
            }
        }
    }

    public clearCacheByFilePath(file: string) {
        this._cache.module = undefined;
    }

    public constructor(options: PopupProcessorInternalOptions) {
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: PopupProcessorInternalOptions): PopupProcessorNormalizedOptions {
        const normalizedOptions = { ...options };
        if (!normalizedOptions.outDir) {
            normalizedOptions.outDir = DefaultPopupProcessorOptions.outDir;
        }
        if (path.isAbsolute(normalizedOptions.outDir)) {
            normalizedOptions.outDir = slash(normalizedOptions.outDir);
        } else {
            normalizedOptions.outDir = slash(path.resolve(normalizedOptions.outputRoot, normalizedOptions.outDir));
        }
        if (!normalizedOptions.alias) {
            normalizedOptions.alias = DefaultPopupProcessorOptions.alias;
        }
        if (!normalizedOptions.plugins) {
            normalizedOptions.plugins = DefaultPopupProcessorOptions.plugins;
        }
        return normalizedOptions as PopupProcessorNormalizedOptions;
    }


    public async run(entry: string): Promise<RollupOutput> {
        return await vite.build({
            root: this._options.root,
            resolve: {
                alias: this._options.alias,
            },
            plugins: this._options.plugins,
            build: {
                rollupOptions: { input: path.resolve(this._options.root, entry) },
                emptyOutDir: false,
                write: false,
            },
            configFile: false, // must set to false, to avoid load config from vite.config.ts
        }) as RollupOutput;
    }
}
