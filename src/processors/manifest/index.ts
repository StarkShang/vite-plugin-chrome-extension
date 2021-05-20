import fs from "fs-extra";
import chalk from "chalk";
import memoize from "mem";
import { relative } from "path";
import { cosmiconfigSync } from "cosmiconfig";
import { EmittedAsset, OutputBundle, PluginContext, rollup, TransformPluginContext } from "rollup";
import vite, { resolveConfig, ResolvedConfig } from "vite";
import { ChromeExtensionManifest } from "../../manifest";
import { deriveFiles, ChromeExtensionManifestEntries, ChromeExtensionManifestParser, ChromeExtensionManifestEntriesDiff } from "./parser";
import { reduceToRecord } from "../../manifest-input/reduceToRecord";
import { ManifestInputPluginCache } from "../../plugin-options";
import { cloneObject } from "../../utils/cloneObject";
import { manifestName } from "../../manifest-input/common/constants";
import { getAssets, getChunk } from "../../utils/bundle";
import {
    validateManifest,
    ValidationErrorsArray,
} from "../../manifest-input/manifest-parser/validate";
import { ContentScriptProcessor } from "../content-script/content-script";
import { PermissionProcessor, PermissionProcessorOptions } from "../permission";
import { BackgroundProcesser } from "../background/background";
import { NormalizedChromeExtensionOptions } from "@/configs/options";
import { ChromeExtensionManifestCache } from "./cache";

export const explorer = cosmiconfigSync("manifest", {
    cache: false,
});

export type ExtendManifest =
    | Partial<ChromeExtensionManifest>
    | ((manifest: ChromeExtensionManifest) => ChromeExtensionManifest);

export type ChromeExtensionConfigurationInfo = {
    filepath: string,
    config: ChromeExtensionManifest,
    isEmpty?: true,
};

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
    public manifestParser = new ChromeExtensionManifestParser();
    public contentScriptProcessor: ContentScriptProcessor;
    public permissionProcessor: PermissionProcessor;
    public backgroundProcessor: BackgroundProcesser;

    public constructor(private options = {} as NormalizedChromeExtensionOptions) {
        this.contentScriptProcessor = new ContentScriptProcessor(options);
        this.permissionProcessor = new PermissionProcessor(new PermissionProcessorOptions());
        this.backgroundProcessor = new BackgroundProcesser(options);
    }
    // file path of manifest.json
    private _filePath = "";
    public get filePath() { return this._filePath; }
    public set filePath(path: string) { this._filePath = path; }

    /**
     * Load content from manifest.json
     * @param options: rollup input options
     */
    public load(manifest: ChromeExtensionManifest): void {
        /* --------------- VALIDATE MANIFEST.JSON CONTENT --------------- */
        this.validateChromeExtensionManifest(manifest);
        /* --------------- APPLY USER CUSTOM CONFIG --------------- */
        const currentManifest = this.applyExternalManifestConfiguration(manifest);
        const entries = this.manifestParser.entries(currentManifest, this.options.rootPath!);
        // if reload manifest.json, then calculate diff and restart sub bundle tasks
        const waitForBuild = this.cache.entries
            ? this.manifestParser.diffEntries(this.cache.entries, entries) // calculate diff between the last and the current manifest
            : ChromeExtensionManifestParser.entriesToDiff(entries);
        this.buildComponents(waitForBuild);
        // record current manifest and entries
        this.cache.manifest = currentManifest;
        this.cache.entries = entries;
    }

    private buildComponents(entries: ChromeExtensionManifestEntriesDiff) {
        // background
        // if (entries.background) {
        //     switch (entries.background.status) {
        //         case "create":
        //         case "update":
        //             entries.background.entry && this.backgroundProcessor.load(entries.background.entry, this.options.watch);
        //             break;
        //         case "delete":
        //             entries.background.entry && this.backgroundProcessor.stop(entries.background.entry);
        //             break;
        //     }
        // }
        // content_scripts
        // if (entries.content_scripts) {
        //     if (entries.content_scripts.create) {
        //         entries.content_scripts.create.forEach(script => this.contentScriptProcessor.build(script, this.options.watch));
        //     }
        //     if (entries.content_scripts.delete) {
        //         entries.content_scripts.delete.forEach(script => this.contentScriptProcessor.stop(script, this.options.watch));
        //     }
        // }
        // options_page
        // if (entries.options_page) {
        //     switch (entries.options_page.status) {
        //         case "create":
        //         case "update":
        //             entries.options_page.entry && this.optionsProcessor.load(entries.options_page.entry, this.options.watch);
        //             break;
        //         case "delete":
        //             entries.options_page.entry && this.optionsProcessor.stop(entries.options_page.entry);
        //             break;
        //     }
        // }
        // waitForBuild.options_page && console.log(waitForBuild.options_page);
        // waitForBuild.options_ui && console.log(waitForBuild.options_ui);
        // waitForBuild.override && console.log(waitForBuild.override);
        // waitForBuild.popup && console.log(waitForBuild.popup);
        // waitForBuild.devtools && console.log(waitForBuild.devtools);
        // waitForBuild.web_accessible_resources && console.log(waitForBuild.web_accessible_resources);
    }

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

    public transform(context: TransformPluginContext, code: string, id: string, ssr?: boolean) {
        const { code:updatedCode, imports } = this.backgroundProcessor.resolveDynamicImports(context, code);
        this.cache2.dynamicImportContentScripts.push(...imports);
        return updatedCode;
    }

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

    public async generateBundle(context: PluginContext, bundle: OutputBundle) {
        if (!this.cache.manifest) { throw new Error("[generate bundle] Manifest cannot be empty"); }
        /* ----------------- GET CHUNKS -----------------*/
        const chunks = getChunk(bundle);
        const assets = getAssets(bundle);
        /* ----------------- UPDATE PERMISSIONS ----------------- */
        this.permissionProcessor.derivePermissions(context, chunks, this.cache.manifest);
        /* ----------------- UPDATE CONTENT SCRIPTS ----------------- */
        await this.contentScriptProcessor.generateBundle(context, bundle, this.cache.manifest);
        await this.contentScriptProcessor.generateBundleFromDynamicImports(context, bundle, this.cache2.dynamicImportContentScripts);
        /* ----------------- SETUP BACKGROUND SCRIPTS ----------------- */
        await this.backgroundProcessor.generateBundle(context, bundle, this.cache.manifest);
        /* ----------------- SETUP ASSETS IN WEB ACCESSIBLE RESOURCES ----------------- */

        /* ----------------- STABLE EXTENSION ID ----------------- */
        /* ----------------- OUTPUT MANIFEST.JSON ----------------- */
        /* ----------- OUTPUT MANIFEST.JSON ---------- */
        this.generateManifest(context, this.cache.manifest);
        // validate manifest
        this.validateManifest();
    }

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
}
