import slash from "slash";
import { OutputAsset, OutputBundle, PluginContext, RollupWatcher, WatcherOptions } from "rollup";
import { removeFileExtension } from "../../common/utils";
import { ChromeExtensionManifest, WebAccessibleResource } from "../../manifest";
import { findAssetByName, findChunkByName } from "../../utils/helpers";
import { updateCss } from "../../common/utils/css";
import { mixinChunksForIIFE } from "../mixin";
import { IComponentProcessor } from "../common";
import { Plugin } from "vite";
import { ContentScriptProcessorCache } from "./cache";
import { ChromeExtensionModule } from "@/common/models";

export interface ContentScriptProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedContentScriptProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[],
}

const DefaultContentScriptProcessorOptions: NormalizedContentScriptProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class ContentScriptProcessor implements IComponentProcessor {
    private _options: NormalizedContentScriptProcessorOptions;
    private _cache = new ContentScriptProcessorCache();
    private _watches = new Map<string, RollupWatcher>();

    public async resolve(manifest: ChromeExtensionManifest): Promise<string[]> {
        manifest.content_scripts?.map(group => group.js || [])
            .forEach(scripts => {
                scripts.forEach(script => this._cache.entries.push(script));
            });
        return [];
    }

    public async build(): Promise<ChromeExtensionModule[] | undefined> {
        this._cache.modules.forEach(module => module.visited = false);
        await Promise.all(this._cache.entries?.map(async entry => {
            if (this._cache.modules.has(entry)) {
                const module = this._cache.modules.get(entry);
                module && (module.visited = true);
            } else {
                // TODO: add build logic
            }
        }));
        // clear corrupt modules
        this._cache.modules.forEach((module, key) => {
            if (!module.visited) {
                this._cache.modules.delete(key);
            }
        });
        return this._cache.modules.size > 0 ? Array.from(this._cache.modules.values()) : undefined;
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
    public constructor(options: ContentScriptProcessorOptions = {}) {
        this._options = this.normalizeOptions(options);
    }
    private normalizeOptions(options: ContentScriptProcessorOptions): NormalizedContentScriptProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultContentScriptProcessorOptions.plugins; }
        return normalizedOptions as NormalizedContentScriptProcessorOptions;
    }
}
