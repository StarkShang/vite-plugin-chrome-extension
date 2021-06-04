import path from "path";
import fs from "fs";
import vite, { AliasOptions, Plugin } from "vite";
import { ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { IComponentProcessor } from "../common";
import { OptionsProcessorCache } from "./cache";
import { RollupOutput } from "rollup";
import chalk from "chalk";

export interface OptionsProcessorOptions {
    root?: string;
    outDir?: string;
    alias?: AliasOptions;
    plugins?: Plugin[];
}

export interface NormalizedOptionsProcessorOptions {
    root: string;
    outDir: string;
    alias: AliasOptions;
    plugins: Plugin[],
}

const DefaultOptionsProcessorOptions: NormalizedOptionsProcessorOptions = {
    root: process.cwd(),
    outDir: path.join(process.cwd(), "dist"),
    alias: [],
    plugins: [],
};

export class OptionsProcessor implements IComponentProcessor {
    private _options: NormalizedOptionsProcessorOptions;
    private _cache = new OptionsProcessorCache();

    public async resolve(manifest: ChromeExtensionManifest): Promise<string[]> {
        this._cache.manifest = manifest;
        let entry: string | undefined = undefined;
        if (manifest.options_ui?.page) {
            entry = manifest.options_ui.page;
        } else if (manifest.options_page) {
            entry = manifest.options_page;
        }

        if (entry) {
            if (!this._cache.module || entry !== this._cache.entry) {
                console.log(chalk`{blue rebuilding options: ${entry}}`);
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
            if (this._cache.manifest.options_ui) {
                this._cache.manifest.options_ui = {...this._cache.manifest.options_ui, page: entryBundle!.fileName};
            } else if (this._cache.manifest.options_page) {
                this._cache.manifest.options_page = entryBundle!.fileName;
            }
        }
    }

    public clearCacheByFilePath(file: string) {
        this._cache.module = undefined;
    }

    public constructor(options: OptionsProcessorOptions = {}) {
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: OptionsProcessorOptions): NormalizedOptionsProcessorOptions {
        const normalizedOptions = { ...options };
        if (!normalizedOptions.root) {
            normalizedOptions.root = DefaultOptionsProcessorOptions.root;
        }
        if (!normalizedOptions.outDir) {
            normalizedOptions.outDir = DefaultOptionsProcessorOptions.outDir;
        }
        if (!normalizedOptions.alias) {
            normalizedOptions.alias = DefaultOptionsProcessorOptions.alias;
        }
        if (!normalizedOptions.plugins) {
            normalizedOptions.plugins = DefaultOptionsProcessorOptions.plugins;
        }
        return normalizedOptions as NormalizedOptionsProcessorOptions;
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
