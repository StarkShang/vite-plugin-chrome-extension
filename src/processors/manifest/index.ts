import fs from "fs-extra";
import chalk from "chalk";
import memoize from "mem";
import { relative } from "path";
import { cosmiconfigSync } from "cosmiconfig";
import { EmittedAsset, InputOption, InputOptions, OutputBundle, PluginContext, TransformPluginContext } from "rollup";
import { ChromeExtensionManifest, Background } from "../../manifest";
import { deriveFiles } from "./parser";
import { reduceToRecord } from "../../manifest-input/reduceToRecord";
import { ManifestInputPluginCache, NormalizedChromeExtensionOptions } from "../../plugin-options";
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
    public cache = {
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
    public manifest?: ChromeExtensionManifest;
    public contentScriptProcessor: ContentScriptProcessor;
    public permissionProcessor: PermissionProcessor;
    public backgroundProcessor: BackgroundProcesser;

    public constructor(private options = {} as NormalizedChromeExtensionOptions) {
        this.contentScriptProcessor = new ContentScriptProcessor(options);
        this.permissionProcessor = new PermissionProcessor(new PermissionProcessorOptions());
        this.backgroundProcessor = new BackgroundProcesser(options);
    }

    /**
     * Load content from manifest.json
     * @param options: rollup input options
     */
    public load(manifest: ChromeExtensionManifest): void {
        /* --------------- VALIDATE MANIFEST.JSON CONTENT --------------- */
        this.validateChromeExtensionManifest(manifest);
        /* --------------- APPLY USER CUSTOM CONFIG --------------- */
        manifest = this.applyExternalManifestConfiguration(manifest);
        // if reload manifest.json, then calculate diff and restart sub bundle tasks
        if (this.manifest) {
            // calculate diff between the last and the current manifest
            const changed = true;
            // restart related sub build task

        } else {
            const entries = this.resolveEntries(manifest);
            console.log(entries);
        }
        this.manifest = manifest;
    }

    public toString() {
        return JSON.stringify(this.manifest, null, 4);
    }

    /**
     * Resolve input files for rollup
     * @param input: Input not in manifest.json but specify by user
     * @returns
     */
    public resolveEntries(manifest: ChromeExtensionManifest): { [entryAlias: string]: string } {
        if (!manifest || !this.options.srcDir) {
            throw new TypeError("manifest and options.srcDir not initialized");
        }
        // Derive all static resources from manifest
        // Dynamic entries will emit in transform hook
        const { js, html, css, img, others } = deriveFiles(
            manifest,
            this.options.srcDir,
        );
        // Cache derived inputs
        this.cache.input = [...this.cache.inputAry, ...js, ...html];
        this.cache.assets = [...new Set([...css, ...img, ...others])];
        const inputs = this.cache.input.reduce(
            reduceToRecord(this.options.srcDir),
            this.cache.inputObj);
        return inputs;
    }

    public transform(context: TransformPluginContext, code: string, id: string, ssr?: boolean) {
        const { code:updatedCode, imports } = this.backgroundProcessor.resolveDynamicImports(context, code);
        this.cache.dynamicImportContentScripts.push(...imports);
        return updatedCode;
    }

    public isDynamicImportedContentScript(referenceId: string) {
        return this.cache.dynamicImportContentScripts.includes(referenceId);
    }

    /**
     * Add watch files
     * @param context Rollup Plugin Context
     */
    public addWatchFiles(context: PluginContext) {
        // watch manifest.json file
        context.addWatchFile(this.options.manifestPath!);
        // watch asset files
        this.cache.assets.forEach(srcPath => context.addWatchFile(srcPath));
    }

    public async emitFiles(context: PluginContext) {
        // Copy asset files
        const assets: EmittedAsset[] = await Promise.all(
            this.cache.assets.map(async (srcPath) => {
                const source = await this.readAssetAsBuffer(srcPath);
                return {
                    type: "asset" as const,
                    source,
                    fileName: relative(this.options.srcDir!, srcPath),
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
            delete this.manifest;
            this.cache.assetChanged = false;
        } else {
            // Force new read of changed asset
            this.cache.assetChanged = this.cache.readFile.delete(id);
        }
    }

    public async generateBundle(context: PluginContext, bundle: OutputBundle) {
        if (!this.manifest) { throw new Error("[generate bundle] Manifest cannot be empty"); }
        /* ----------------- GET CHUNKS -----------------*/
        const chunks = getChunk(bundle);
        const assets = getAssets(bundle);
        /* ----------------- UPDATE PERMISSIONS ----------------- */
        this.permissionProcessor.derivePermissions(context, chunks, this.manifest);
        /* ----------------- UPDATE CONTENT SCRIPTS ----------------- */
        await this.contentScriptProcessor.generateBundle(context, bundle, this.manifest);
        await this.contentScriptProcessor.generateBundleFromDynamicImports(context, bundle, this.cache.dynamicImportContentScripts);
        /* ----------------- SETUP BACKGROUND SCRIPTS ----------------- */
        await this.backgroundProcessor.generateBundle(context, bundle, this.manifest);
        /* ----------------- SETUP ASSETS IN WEB ACCESSIBLE RESOURCES ----------------- */

        /* ----------------- STABLE EXTENSION ID ----------------- */
        /* ----------------- OUTPUT MANIFEST.JSON ----------------- */
        /* ----------- OUTPUT MANIFEST.JSON ---------- */
        this.generateManifest(context, this.manifest);
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
        if (this.manifest) {
            validateManifest(this.manifest)
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
            cache: this.cache.readFile,
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
