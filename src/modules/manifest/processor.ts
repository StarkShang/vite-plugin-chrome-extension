import fs from "fs-extra";
import chalk from "chalk";
import memoize from "mem";
import { relative } from "path";
import { cosmiconfigSync } from "cosmiconfig";
import { EmittedAsset, PluginContext } from "rollup";
import { ChromeExtensionManifest } from "../../manifest";
import { deriveFiles, ChromeExtensionManifestParser, ChromeExtensionManifestEntriesDiff, ChromeExtensionManifestEntryDiff, ChromeExtensionManifestEntryArrayDiff } from "./parser";
import { reduceToRecord } from "../../manifest-input/reduceToRecord";
import { ManifestInputPluginCache } from "../../plugin-options";
import { manifestName } from "../../manifest-input/common/constants";
import { validateManifest } from "../../manifest-input/manifest-parser/validate";
import { NormalizedChromeExtensionOptions } from "@/configs/options";
import { PermissionProcessor, PermissionProcessorOptions } from "../permission";
import { ChromeExtensionManifestCache } from "./cache";
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
    public backgroundProcessor?: BackgroundProcessor;
    public contentScriptProcessor?: ContentScriptProcessor;
    public popupProcessor?: PopupProcessor;
    public optionsProcessor?: OptionsProcessor;
    public devtoolProcessor?: DevtoolsProcessor;
    public overrideBookmarksProcessor?: OverrideBookmarksProcessor;
    public overrideHistoryProcessor?: OverrideHistoryProcessor;
    public overrideNewtabProcessor?: OverrideNewtabProcessor;
    public webAccessibleResourceProcessor?: WebAccessibleResourceProcessor;

    public constructor(private options = {} as NormalizedChromeExtensionOptions) {
        // initial manifest parser
        this.manifestParser = new ChromeExtensionManifestParser();
        // initial processors
        this.permissionProcessor = new PermissionProcessor(new PermissionProcessorOptions());
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
        /* --------------- CACHE MANIFEST & ENTRIES & DIFF --------------- */
        const patch = this.manifestParser.diff(currentManifest, this.cache.manifest);
        this.cache.manifest = currentManifest;
        const entries = this.manifestParser.entries(currentManifest, this.options.rootPath!);
        // if reload manifest.json, then calculate diff and restart sub bundle tasks
        this.cache.entriesDiff = this.cache.entries
            ? this.manifestParser.diffEntries(this.cache.entries, entries) // calculate diff between the last and the current manifest
            : ChromeExtensionManifestParser.entriesToDiff(entries);
        console.log(chalk`{blue find entries}`, this.cache.entriesDiff);
        this.cache.entries = entries;
    }

    public async generateBundle() {
        if (!this.cache.entriesDiff) { return; }
        this.buildComponents(this.cache.entriesDiff);
    }

    private async buildComponents(diff: ChromeExtensionManifestEntriesDiff): Promise<void> {
        // background
        this.backgroundProcessor && diff.background && this.buildComponent(diff.background, this.backgroundProcessor, output => {
            this.cache.manifest && (this.cache.manifest.background = { service_worker: output });
        });
        // content_scripts
        this.contentScriptProcessor && diff.content_scripts && this.buildArrayComponent(diff.content_scripts, this.contentScriptProcessor, (input, output) => {
            this.cache.manifest && this.cache.manifest.content_scripts?.forEach(group => {
                if (!group.js) { return; }
                for (let index = 0; index < group.js.length; index++) {
                    if (group.js[index] === input) {
                        group.js[index] = output;
                    }
                }
            });
        });
        // popup
        this.popupProcessor && diff.popup && this.buildComponent(diff.popup, this.popupProcessor, output => {
            this.cache.manifest && this.cache.manifest.action && (this.cache.manifest.action.default_popup = output);
        });
        // options_page
        this.optionsProcessor && diff.options_page && this.buildComponent(diff.options_page, this.optionsProcessor, output => {
            this.cache.manifest && (this.cache.manifest.options_page = output);
        });
        // options_ui
        this.optionsProcessor && diff.options_ui && this.buildComponent(diff.options_ui, this.optionsProcessor, output => {
            this.cache.manifest && this.cache.manifest.options_ui && (this.cache.manifest.options_ui.page = output);
        });
        // devtools
        this.devtoolProcessor && diff.devtools && this.buildComponent(diff.devtools, this.devtoolProcessor, output => {
            this.cache.manifest && (this.cache.manifest.devtools_page = output);
        });
        // override
        this.overrideBookmarksProcessor && diff.override?.bookmarks && this.buildComponent(diff.override.bookmarks, this.overrideBookmarksProcessor, output => {
            this.cache.manifest && (
                this.cache.manifest.chrome_url_overrides
                    ? this.cache.manifest.chrome_url_overrides.bookmarks = output
                    : this.cache.manifest.chrome_url_overrides = { bookmarks: output });
        });
        this.overrideHistoryProcessor && diff.override?.history && this.buildComponent(diff.override.history, this.overrideHistoryProcessor, output => {
            this.cache.manifest && (
                this.cache.manifest.chrome_url_overrides
                    ? this.cache.manifest.chrome_url_overrides.history = output
                    : this.cache.manifest.chrome_url_overrides = { history: output });
        });
        this.overrideNewtabProcessor && diff.override?.newtab && this.buildComponent(diff.override.newtab, this.overrideNewtabProcessor, output => {
            this.cache.manifest && (
                this.cache.manifest.chrome_url_overrides
                    ? this.cache.manifest.chrome_url_overrides.newtab = output
                    : this.cache.manifest.chrome_url_overrides = { newtab: output });
        });
        // web_accessible_resources
        this.webAccessibleResourceProcessor && diff.web_accessible_resources && this.buildArrayComponent(diff.web_accessible_resources, this.webAccessibleResourceProcessor, (input, output) => {
            this.cache.manifest && this.cache.manifest.web_accessible_resources?.forEach(group => {
                if (!group.resources) { return; }
                for (let index = 0; index < group.resources.length; index++) {
                    if (group.resources[index] === input) {
                        group.resources[index] = output;
                    }
                }
            });
        });
    }

    private async buildComponent(
        diff: ChromeExtensionManifestEntryDiff,
        processor: IComponentProcessor,
        callback: (path: string) => void,
    ): Promise<void> {
        switch (diff.status) {
            case "create":
            case "update":
                if (diff.entry) {
                    const output = await processor.resolve(diff.entry);
                    callback(output);
                }
                break;
            case "delete":
                if (diff.entry) {
                    await processor.stop();
                    // TODO: delete output file
                }
                break;
        }
    }

    private async buildArrayComponent(
        diff: ChromeExtensionManifestEntryArrayDiff,
        processor: IComponentProcessor,
        callback: (input: string, output: string) => void,
    ): Promise<void> {
        for (const entry of diff.create || []) {
            callback(entry, await processor.resolve(entry));
        }
        for (const entry of diff.delete || []) {
            await processor.stop();
        }
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
}
