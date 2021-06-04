import path from "path";
import fs from "fs";
import fse from "fs-extra";
import slash from "slash";
import vite, { AliasOptions, Plugin } from "vite";
import { OutputAsset, OutputBundle, PluginContext, RollupOutput } from "rollup";
import { removeFileExtension } from "../../common/utils";
import { ChromeExtensionManifest, WebAccessibleResource } from "../../manifest";
import { findAssetByName, findChunkByName } from "../../utils/helpers";
import { updateCss } from "../../common/utils/css";
import { mixinChunksForIIFE } from "../mixin";
import { IComponentProcessor } from "../common";
import { ContentScriptProcessorCache } from "./cache";
import chalk from "chalk";
import { ensureDir } from "fs-extra";
import { ContentScriptProcessorInternalOptions, DefaultContentScriptProcessorOptions, ContentScriptProcessorNormalizedOptions } from "./option";
import { ChromeExtensionAssetPlugin } from "../common/plugin";

export class ContentScriptProcessor implements IComponentProcessor {
    private _options: ContentScriptProcessorNormalizedOptions;
    private _cache = new ContentScriptProcessorCache();

    public async resolve(manifest: ChromeExtensionManifest): Promise<string[]> {
        this._cache.manifest = manifest;
        if (!this._cache.manifest || !this._cache.manifest.content_scripts) { return []; }
        await Promise.all(this._cache.manifest.content_scripts.map(group => group.js || [])
            .map(scripts => scripts
                .map(async script => {
                    if (!this._cache.modules.has(script)) {
                        console.log(chalk`{blue rebuilding content-script: ${script}}`);
                        const { output } = await this.run(script);
                        this._cache.modules.set(script, output);
                    }
                }))
            .flat());
        await this._cache.manifest.content_scripts.forEachAsync(async group => {
            await group.js?.forEachAsync(async script => {
                if (!this._cache.modules.has(script)) {
                    console.log(chalk`{blue rebuilding content-script: ${script}}`);
                    const { output } = await this.run(script);
                    this._cache.modules.set(script, output);
                }
            });
            await group.css?.forEachAsync(async css => {
                const inputFilePath = path.resolve(this._options.root, css);
                this._cache.modules.set(css, [{
                    fileName: css,
                    source: await fse.readFile(inputFilePath),
                    isAsset: true,
                    name: undefined,
                    type: "asset",
                }]);
            });
        });
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
        const manifest = this._cache.manifest;
        if (!manifest || !manifest.content_scripts) { return; }
        if (this._cache.modules.size <= 0) { return; }
        const outputPath = this._options.outDir;
        await ensureDir(outputPath);
        await manifest.content_scripts.forEachAsync(async group => {
            // referencing assets will be added to web accessible resources
            const assets = new Set<string>();
            // build js files
            if (!group.js) { return; }
            await group.js.forEachAsync(async (script, index) => {
                const module = this._cache.modules.get(script);
                await module?.forEachAsync(async chunk => {
                    console.log("content-scripts: ", chunk.fileName);
                    const outputFilePath = slash(path.resolve(outputPath, chunk.fileName));
                    const relativeFilePath = slash(path.relative(this._options.outputRoot, outputFilePath));
                    await ensureDir(path.dirname(outputFilePath));
                    if (chunk.type === "chunk") {
                        // write chunk to disk
                        await fse.writeFile(outputFilePath, chunk.code);
                        // update chunk to manifest
                        if (chunk.facadeModuleId &&
                            chunk.facadeModuleId === slash(path.resolve(this._options.root, script))) {
                            group.js?.splice(index, 1, relativeFilePath);
                        }
                    } else {
                        // write asset to disk
                        await fse.writeFile(outputFilePath, chunk.source);
                        // add css files to content script css array
                        if (relativeFilePath.endsWith(".css")) {
                            if (group.css) {
                                if (!group.css.includes(relativeFilePath)) {
                                    group.css.push(relativeFilePath);
                                }
                            } else {
                                group.css = [relativeFilePath];
                            }
                        }
                        // add other assets to web accessible resources
                        else {
                            assets.add(relativeFilePath);
                        }
                    }
                });
            });
            await group.css?.forEachAsync(async script => {
                const module = this._cache.modules.get(script) as OutputAsset[];
                await module?.forEachAsync(async asset => {
                    const outputFilePath = slash(path.resolve(this._options.outputRoot, asset.fileName));
                    const relativeFilePath = slash(path.relative(this._options.outputRoot, outputFilePath));
                    await ensureDir(path.dirname(outputFilePath));
                    await fse.writeFile(outputFilePath, asset.source);
                });
            });
            if (this._cache.manifest && assets.size > 0) {
                const resource: WebAccessibleResource = {
                    matches: group.matches,
                    resources: Array.from(assets),
                };
                if (this._cache.manifest.web_accessible_resources) {
                    this._cache.manifest.web_accessible_resources.push(resource);
                } else {
                    this._cache.manifest.web_accessible_resources = [resource];
                }
            }
        });
    }
    public async generateBundle(
        context: PluginContext,
        bundle: OutputBundle,
        manifest: ChromeExtensionManifest,
    ): Promise<void> {
        for (const content_script of manifest.content_scripts || []) {
            const {js, css, ...rest} = content_script
            if (typeof js === "undefined") { continue; }
            // process related css
            js.map(name => findAssetByName(`${removeFileExtension(name)}.css`, bundle) as OutputAsset)
                .filter(asset => !!asset)
                .map(asset => {
                    const { asset: ast, resources } = updateCss(asset);
                    // add resource to web_accessible_resources
                    if (resources) {
                        const web_accessible_resources: WebAccessibleResource = {
                            resources,
                            matches: rest.matches
                        }
                        if (!manifest.web_accessible_resources) {
                            manifest.web_accessible_resources = [web_accessible_resources];
                        } else {
                            manifest.web_accessible_resources.push(web_accessible_resources);
                        }
                    }
                    return ast;
                })
                .forEach(asset => {
                    const cssFileName = slash(asset.fileName)
                    if (css) {
                        css.push(cssFileName);
                    } else {
                        content_script.css = [cssFileName];
                    }
                });
            // mixin related js
            content_script.js = [];
            for (const jsName of js) {
                const chunk = findChunkByName(removeFileExtension(jsName), bundle);
                if (chunk) {
                    content_script.js.push(slash(await mixinChunksForIIFE(context, chunk, bundle)));
                }
            }
        }
    }
    public async generateBundleFromDynamicImports(
        context: PluginContext,
        bundle: OutputBundle,
        dynamicImports: string[],
    ) {
        for (const dynamicImport of dynamicImports) {
            const filename = context.getFileName(dynamicImport);
            const chunk = bundle[filename];
            if (chunk && chunk.type === "chunk") {
                await mixinChunksForIIFE(context, chunk, bundle);
            }
        }
    }
    public constructor(options: ContentScriptProcessorInternalOptions) {
        this._options = this.normalizeOptions(options);
    }
    private normalizeOptions(options: ContentScriptProcessorInternalOptions): ContentScriptProcessorNormalizedOptions {
        const normalizedOptions = { ...options };
        if (!normalizedOptions.outDir) {
            normalizedOptions.outDir = DefaultContentScriptProcessorOptions.outDir;
        }
        if (path.isAbsolute(normalizedOptions.outDir)) {
            normalizedOptions.outDir = slash(normalizedOptions.outDir)
        } else {
            normalizedOptions.outDir = slash(path.resolve(normalizedOptions.outputRoot, normalizedOptions.outDir));
        }
        if (!normalizedOptions.alias) {
            normalizedOptions.alias = DefaultContentScriptProcessorOptions.alias;
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultContentScriptProcessorOptions.plugins; }
        return normalizedOptions as ContentScriptProcessorNormalizedOptions;
    }

    private async run(entry: string): Promise<RollupOutput> {
        return await vite.build({
            root: this._options.root,
            resolve: {
                alias: this._options.alias,
            },
            plugins: [
                ...this._options.plugins,
                ChromeExtensionAssetPlugin(),
            ],
            build: {
                rollupOptions: {
                    input: path.resolve(this._options.root, entry),
                    output: {
                        format: "umd",
                    }
                },
                emptyOutDir: false,
                write: false,
            },
            configFile: false, // must set to false, to avoid load config from vite.config.ts
        }) as RollupOutput;
    }
}
