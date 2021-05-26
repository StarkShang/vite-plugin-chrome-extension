import fs from "fs-extra";
import chalk from "chalk";
import memoize from "mem";
import { relative } from "path";
import { cosmiconfigSync } from "cosmiconfig";
import { EmittedAsset, PluginContext } from "rollup";
import { ChromeExtensionManifest } from "../../manifest";
import { deriveFiles, ChromeExtensionManifestParser, ChromeExtensionManifestEntriesDiff, ChromeExtensionManifestEntryDiff, ChromeExtensionManifestEntryArrayDiff, ChromeExtensionManifestEntry } from "./parser";
import { reduceToRecord } from "../../manifest-input/reduceToRecord";
import { ManifestInputPluginCache } from "../../plugin-options";
import { manifestName } from "../../manifest-input/common/constants";
import { validateManifest } from "../../manifest-input/manifest-parser/validate";
import { NormalizedChromeExtensionOptions } from "@/configs/options";
import { PermissionProcessor, PermissionProcessorOptions } from "../permission";
import { ChromeExtensionManifestCache, ChromeExtensionManifestEntryMapping, ChromeExtensionManifestEntryMappings } from "./cache";
import { IComponentProcessor } from "../common";
import { BackgroundProcessor } from "../background";
import { ContentScriptProcessor } from "../content-script";
import { OptionsProcessor } from "../options/processor";
import { DevtoolsProcessor } from "../devtools";
import { PopupProcessor } from "../popup";
import { OverrideBookmarksProcessor, OverrideHistoryProcessor, OverrideNewtabProcessor } from "../override/processor";
import { WebAccessibleResourceProcessor } from "../web-accessible-resource/processor";

export const explorer = cosmiconfigSync("manifest", {
    cache: false,
});

export type ExtendManifest =
    | Partial<ChromeExtensionManifest>
    | ((manifest: ChromeExtensionManifest) => ChromeExtensionManifest);

export class ManifestProcessor {
    public cache2 = {
        assetChanged: false,
        assets: [],
        iife: [],
        input: [],
        inputAry: [],
        inputObj: {},
        dynamicImportContentScripts: [],
        permsHash: "",
        readFile: new Map<string, any>(),
        srcDir: null,
    } as ManifestInputPluginCache;
    public cache = new ChromeExtensionManifestCache();
    public manifestParser;
    private processors = new Map<string, IComponentProcessor>();
    public permissionProcessor: PermissionProcessor;

    public constructor(private options = {} as NormalizedChromeExtensionOptions) {
        // initial manifest parser
        this.manifestParser = new ChromeExtensionManifestParser();
        // initial processors
        this.permissionProcessor = new PermissionProcessor(new PermissionProcessorOptions());
        this.initialProcessors(options);
    }

    // file path of manifest.json
    private _filePath = "";
    public get filePath() { return this._filePath; }
    public set filePath(path: string) { this._filePath = path; }

    /**
     * Load content from manifest.json
     * @param options: rollup input options
     */
    public async resolve(manifest: ChromeExtensionManifest): Promise<void> {
        /* --------------- VALIDATE MANIFEST.JSON CONTENT --------------- */
        this.validateChromeExtensionManifest(manifest);
        /* --------------- APPLY USER CUSTOM CONFIG --------------- */
        const currentManifest = this.applyExternalManifestConfiguration(manifest);
        /* --------------- CACHE MANIFEST & ENTRIES --------------- */
        this.cache.manifest = currentManifest;
        this.cache.entries = this.manifestParser.entries(currentManifest);
    }

    // if reload manifest.json, then calculate diff and restart sub bundle tasks
    // this method will update cache.manifest and cache.mappings
    public async build(): Promise<void> {
        this.cache.mappings.forEach(mapping => mapping.visited = false);
        // start build process
        await Promise.all(this.cache.entries?.map(async entry => {
            if (this.cache.mappings.has(entry.key)) {
                const mapping = this.cache.mappings.get(entry.key) as ChromeExtensionManifestEntryMapping;
                entry.bundle = mapping.bundle;
                mapping.visited = true;
            } else {
                const processor = this.processors.get(entry.type);
                const output = await processor?.build(entry.module) || entry.module;
                this.cache.mappings.set(entry.key, {
                    entry: entry.module,
                    bundle: output,
                    visited: true,
                });
            }
        })||[]);
        // remove useless mapping
        this.cache.mappings.forEach((mapping, key) => {
            if (mapping.visited === false) {
                this.cache.mappings.delete(key);
            }
        });
    }

    public async generate(): Promise<void> {}

    public toString() {
        return JSON.stringify(this.cache.manifest, null, 4);
    }

    /**
     * Resolve input files for rollup
     * @param input: Input not in manifest.json but specify by user
     * @returns
     */
    public resolveEntries(manifest: ChromeExtensionManifest): { [entryAlias: string]: string } {
        if (!manifest || !this.options.rootPath) {
            throw new TypeError("manifest and options.srcDir not initialized");
        }
        // Derive all static resources from manifest
        // Dynamic entries will emit in transform hook
        const { js, html, css, img, others } = deriveFiles(
            manifest,
            this.options.rootPath,
        );
        // Cache derived inputs
        this.cache2.input = [...this.cache2.inputAry, ...js, ...html];
        this.cache2.assets = [...new Set([...css, ...img, ...others])];
        const inputs = this.cache2.input.reduce(
            reduceToRecord(this.options.rootPath),
            this.cache2.inputObj);
        return inputs;
    }

    // public transform(context: TransformPluginContext, code: string, id: string, ssr?: boolean) {
    //     const { code:updatedCode, imports } = this.backgroundProcessor.resolveDynamicImports(context, code);
    //     this.cache2.dynamicImportContentScripts.push(...imports);
    //     return updatedCode;
    // }

    public isDynamicImportedContentScript(referenceId: string) {
        return this.cache2.dynamicImportContentScripts.includes(referenceId);
    }

    /**
     * Add watch files
     * @param context Rollup Plugin Context
     */
    public addWatchFiles(context: PluginContext) {
        // watch manifest.json file
        context.addWatchFile(this.options.manifestPath!);
        // watch asset files
        this.cache2.assets.forEach(srcPath => context.addWatchFile(srcPath));
    }

    public async emitFiles(context: PluginContext) {
        // Copy asset files
        const assets: EmittedAsset[] = await Promise.all(
            this.cache2.assets.map(async (srcPath) => {
                const source = await this.readAssetAsBuffer(srcPath);
                return {
                    type: "asset" as const,
                    source,
                    fileName: relative(this.options.rootPath!, srcPath),
                };
            }),
        );
        assets.forEach((asset) => {
            context.emitFile(asset);
        });
    }

    public clearCacheById(id: string) {
        if (id.endsWith(manifestName)) {
            // Dump cache.manifest if manifest changes
            delete this.cache.manifest;
            this.cache2.assetChanged = false;
        } else {
            // Force new read of changed asset
            this.cache2.assetChanged = this.cache2.readFile.delete(id);
        }
    }

    // public async generateBundle(context: PluginContext, bundle: OutputBundle) {
    //     if (!this.cache.manifest) { throw new Error("[generate bundle] Manifest cannot be empty"); }
    //     /* ----------------- GET CHUNKS -----------------*/
    //     const chunks = getChunk(bundle);
    //     const assets = getAssets(bundle);
    //     /* ----------------- UPDATE PERMISSIONS ----------------- */
    //     this.permissionProcessor.derivePermissions(context, chunks, this.cache.manifest);
    //     /* ----------------- UPDATE CONTENT SCRIPTS ----------------- */
    //     await this.contentScriptProcessor.generateBundle(context, bundle, this.cache.manifest);
    //     await this.contentScriptProcessor.generateBundleFromDynamicImports(context, bundle, this.cache2.dynamicImportContentScripts);
    //     /* ----------------- SETUP BACKGROUND SCRIPTS ----------------- */
    //     await this.backgroundProcessor.generateBundle(context, bundle, this.cache.manifest);
    //     /* ----------------- SETUP ASSETS IN WEB ACCESSIBLE RESOURCES ----------------- */

    //     /* ----------------- STABLE EXTENSION ID ----------------- */
    //     /* ----------------- OUTPUT MANIFEST.JSON ----------------- */
    //     /* ----------- OUTPUT MANIFEST.JSON ---------- */
    //     this.generateManifest(context, this.cache.manifest);
    //     // validate manifest
    //     this.validateManifest();
    // }

    private validateChromeExtensionManifest(manifest: ChromeExtensionManifest) {
        const { options_page, options_ui } = manifest;
        if (
            options_page !== undefined &&
            options_ui !== undefined
        ) {
            throw new Error(
                "options_ui and options_page cannot both be defined in manifest.json.",
            );
        }
    }

    private validateManifest() {
        if (this.cache.manifest) {
            validateManifest(this.cache.manifest)
        } else {
            throw new Error("Manifest cannot be empty");
        }
    }

    private applyExternalManifestConfiguration(manifest: ChromeExtensionManifest): ChromeExtensionManifest {
        if (typeof this.options.extendManifest === "function") {
            return this.options.extendManifest(manifest);
        } else if (typeof this.options.extendManifest === "object") {
            return {
                ...manifest,
                ...this.options.extendManifest,
            };
        } else {
            return manifest;
        }
    }

    private readAssetAsBuffer = memoize(
        (filepath: string) => {
            return fs.readFile(filepath);
        },
        {
            cache: this.cache2.readFile,
        },
    );

    private generateManifest(
        context: PluginContext,
        manifest: ChromeExtensionManifest,
    ) {
        const manifestJson = JSON.stringify(manifest, null, 4)
            // SMELL: is this necessary?
            .replace(/\.[jt]sx?"/g, '.js"');
        // Emit manifest.json
        context.emitFile({
            type: "asset",
            fileName: manifestName,
            source: manifestJson,
        });
    }

    private initialProcessors(options: NormalizedChromeExtensionOptions) {
        // create processors
        options.components?.background && this.processors.set("background", new BackgroundProcessor(options.components.background));
        options.components?.contentScripts && this.processors.set("content-script", new ContentScriptProcessor(options.components.contentScripts === true ? {} : options.components.contentScripts));
        options.components?.popup && this.processors.set("popup", new PopupProcessor(options.components.popup === true ? {} : options.components.popup));
        options.components?.options && this.processors.set("options", new OptionsProcessor(options.components.options === true ? {} : options.components.options));
        options.components?.devtools && this.processors.set("devtools", new DevtoolsProcessor(options.components.devtools === true ? {} : options.components.devtools));
        if (options.components?.override) {
            if (options.components.override === true) {
                this.processors.set("bookmarks", new OverrideBookmarksProcessor());
                this.processors.set("history", new OverrideHistoryProcessor());
                this.processors.set("newtab", new OverrideNewtabProcessor());
            } else {
                options.components.override.bookmarks && this.processors.set("bookmarks", new OverrideBookmarksProcessor(options.components.override.bookmarks === true ? {} : options.components.override.bookmarks));
                options.components.override.history && this.processors.set("history", new OverrideHistoryProcessor(options.components.override.history === true ? {} : options.components.override.history));
                options.components.override.newtab && this.processors.set("newtab", new OverrideNewtabProcessor(options.components.override.newtab === true ? {} : options.components.override.newtab));
            }
        }
        options.components?.webAccessibleResources && this.processors.set("web-accessible-resource", new WebAccessibleResourceProcessor(options.components.webAccessibleResources === true ? {} : options.components.webAccessibleResources));
        // register build end event handler
        this.processors.forEach(processor => processor.on("buildEnd", this.generate));
    }
}
