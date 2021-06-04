import path from "path";
import fs from "fs";
import minimatch from "minimatch";
import { ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import chalk from "chalk";
import { OutputAsset, OutputChunk, RollupOutput, RollupWatcher, WatcherOptions } from "rollup";
import vite, { AliasOptions, Plugin } from "vite";
import { IComponentProcessor } from "../common";
import { WebAccessibleResourceProcessorCache } from "./cache";
import slash from "slash";
import { ensureDir } from "fs-extra";

export interface WebAccessibleResourceProcessorOptions {
    root?: string;
    outDir?: string;
    alias?: AliasOptions;
    match?: string[];
    plugins?: Plugin[];
}

export interface NormalizedWebAccessibleResourceProcessorOptions {
    root: string;
    outDir: string;
    alias: AliasOptions;
    match: string[];
    plugins: Plugin[],
}

const DefaultWebAccessibleResourceProcessorOptions: NormalizedWebAccessibleResourceProcessorOptions = {
    root: process.cwd(),
    outDir: path.join(process.cwd(), "dist"),
    alias: [],
    match: ["*.js", "*.ts"],
    plugins: [],
};

export class WebAccessibleResourceProcessor implements IComponentProcessor {
    private _options: NormalizedWebAccessibleResourceProcessorOptions;
    private _cache = new WebAccessibleResourceProcessorCache();

    public async resolve(manifest: ChromeExtensionManifest): Promise<string[]> {
        this._cache.manifest = manifest;
        if (!manifest.web_accessible_resources) { return []; }
        await Promise.all(manifest.web_accessible_resources.map(group => group.resources || [])
            .map(resources => resources
                .map(async resource => {
                    if (!this._cache.modules.has(resource)) {
                        console.log(chalk`{blue rebuilding web-accessible-resource: ${resource}}`);
                        this._cache.modules.set(resource, await this.run(resource));
                    }
                }))
            .flat());
        return Array.from(this._cache.modules.values())
            .map(module => module
                .map(chunk => {
                    const modules = [];
                    if (chunk.type === "chunk") {
                        modules.push(...Object.keys(chunk.modules));
                        modules.push(...chunk.imports);
                    }
                    return modules;
                })
                .flat())
            .flat();
    }

    public async build(): Promise<void> {
        if (this._cache.modules.size <= 0) { return undefined; }
        const outputPath = path.resolve(this._options.root, this._options.outDir);
        await ensureDir(outputPath);
        this._cache.manifest?.web_accessible_resources?.forEach(group => {
            group.resources.forEach((resource, index) => {
                const bundle = this._cache.modules.get(resource);
                bundle?.map(async chunk => {
                    const outputFileName = chunk.fileName;
                    const outputFilePath = path.resolve(outputPath, outputFileName);
                    await ensureDir(path.dirname(outputFilePath));
                    if (chunk.type === "chunk") {
                        fs.writeFileSync(outputFilePath, chunk.code);
                        if (chunk.facadeModuleId &&
                            slash(chunk.facadeModuleId) === slash(path.resolve(this._options.root, resource))) {
                            group.resources?.splice(index, 1, outputFileName);
                        }
                    } else {
                        fs.writeFileSync(outputFilePath, chunk.source);
                    }
                });
            });
        });
    }

    public constructor(options: WebAccessibleResourceProcessorOptions = {}) {
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: WebAccessibleResourceProcessorOptions): NormalizedWebAccessibleResourceProcessorOptions {
        const normalizedOptions = { ...options };
        if (!normalizedOptions.root) {
            normalizedOptions.root = DefaultWebAccessibleResourceProcessorOptions.root;
        }
        if (!normalizedOptions.outDir) {
            normalizedOptions.outDir = DefaultWebAccessibleResourceProcessorOptions.outDir;
        }
        if (!normalizedOptions.alias) {
            normalizedOptions.alias = DefaultWebAccessibleResourceProcessorOptions.alias;
        }
        if (!normalizedOptions.match) {
            normalizedOptions.match = DefaultWebAccessibleResourceProcessorOptions.match;
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultWebAccessibleResourceProcessorOptions.plugins; }
        return normalizedOptions as NormalizedWebAccessibleResourceProcessorOptions;
    }

    private async run(entry: string): Promise<(OutputChunk | OutputAsset)[]> {
        for (const m of this._options.match) {
            if (minimatch(entry, m)) {
                const output = await vite.build({
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
                return output.output;
            }
        }
        // tread entry as asset
        const filePath = path.resolve(this._options.root, entry);
        console.log(filePath);
        return [{
            fileName: entry,
            source: fs.readFileSync(filePath),
            isAsset: true,
            name: undefined,
            type: "asset",
        }];
    }
}
