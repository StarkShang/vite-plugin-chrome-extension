import fs from "fs-extra";
import memoize from "mem";
import { cosmiconfigSync } from "cosmiconfig";
import { ChromeExtensionManifestEntries, ChromeExtensionManifestEntryType, ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { ChromeExtensionManifestParser } from "./parser";
import { ManifestInputPluginCache } from "@/plugin-options";
import { manifestName } from "@/manifest-input/common/constants";
import { validateManifest } from "@/manifest-input/manifest-parser/validate";
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
import { DefaultManifestProcessorOptions, ManifestProcessorOptions } from "./option";

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
    private _options: ManifestProcessorOptions;
    public _cache = new ChromeExtensionManifestCache();
    public _manifestParser;
    private _processors = new Map<string, IComponentProcessor>();
    public _permissionProcessor: PermissionProcessor;

    public constructor(options = {} as ManifestProcessorOptions) {
        // initial manifest parser
        this._manifestParser = new ChromeExtensionManifestParser();
        // initial options
        this._options = this.normalizeOptions(options);
        // initial processors
        this._permissionProcessor = new PermissionProcessor(new PermissionProcessorOptions());
        this.initialProcessors(this._options);
    }

    // file path of manifest.json
    private _filePath = "";
    public get filePath() { return this._filePath; }
    public set filePath(path: string) { this._filePath = path; }

    /**
     * Resolve entries from manifest.json
     * @param manifest: chrome extension manifest
     */
    public async resolve(manifest: ChromeExtensionManifest): Promise<string[]> {
        /* --------------- VALIDATE MANIFEST.JSON CONTENT --------------- */
        this.validateChromeExtensionManifest(manifest);
        /* --------------- APPLY USER CUSTOM CONFIG --------------- */
        const currentManifest = this.applyExternalManifestConfiguration(manifest);
        /* --------------- CACHE MANIFEST & ENTRIES --------------- */
        this._cache.manifest = currentManifest;
        const modules = (await Promise.all(Array.from(this._processors.values())
            .map(processor => processor.resolve(currentManifest))))
            .flat();
        return Array.from(new Set(modules));
    }

    // if reload manifest.json, then calculate diff and restart sub bundle tasks
    // this method will update cache.manifest and cache.mappings
    public async build(): Promise<void> {
        // start build process
        const output = (await Promise.all(
            Array.from(this._processors)
            .map(async ([key, processor]) => ({
                output: await processor.build(),
                key: key as ChromeExtensionManifestEntryType
            }))))
            .filter(bundle => bundle.output !== undefined)
            .reduce((entries, bundle) => {
                const build = bundle.output as (ChromeExtensionModule &  ChromeExtensionModule[]);
                entries[bundle.key] = build
                return entries;
            }, {} as ChromeExtensionManifestEntries);
        this.updateManifest(output);
    }

    public async updateManifest(bundles: ChromeExtensionManifestEntries): Promise<void> {
        if (!this._cache.manifest) { return; }
        const manifest = this._cache.manifest; // for shortening code
        bundles.background && (manifest.background = { service_worker: bundles.background.bundle });
        if (bundles["content-script"]) {
            manifest.content_scripts?.forEach(group => {
                group.js?.forEach((script, index) => {
                    const output = bundles["content-script"]?.find(s => s.entry === script);
                    output && group.js?.splice(index, 1, output.bundle);
                });
            });
        }
        bundles.popup && (manifest.action = { ...manifest.action, default_popup: bundles.popup.bundle });
        bundles["options"] && (manifest.options_ui
            ? manifest.options_ui = {...manifest.options_ui, page: bundles.options.bundle}
            : manifest.options_page
                ? manifest.options_page = bundles.options.bundle
                : void(0));
        bundles.devtools && (manifest.devtools_page = bundles.devtools.bundle);
        bundles.bookmarks && (manifest.chrome_url_overrides = {...manifest.chrome_url_overrides, bookmarks: bundles.bookmarks.bundle});
        bundles.history && (manifest.chrome_url_overrides = {...manifest.chrome_url_overrides, history: bundles.history.bundle});
        bundles.newtab && (manifest.chrome_url_overrides = {...manifest.chrome_url_overrides, newtab: bundles.newtab.bundle});
        if (bundles["web-accessible-resource"]) {
            manifest.web_accessible_resources?.forEach(group => {
                group.resources?.forEach((resource, index) => {
                    const output = bundles["web-accessible-resource"]?.find(r => r.entry === resource);
                    output && group.resources?.splice(index, 1, output.bundle);
                });
            });
        }
    }

    public toString() {
        return JSON.stringify(this._cache.manifest, null, 4);
    }

    public isDynamicImportedContentScript(referenceId: string) {
        return this.cache2.dynamicImportContentScripts.includes(referenceId);
    }

    public clearCacheById(id: string) {
        if (id.endsWith(manifestName)) {
            // Dump cache.manifest if manifest changes
            delete this._cache.manifest;
            this.cache2.assetChanged = false;
        } else {
            // Force new read of changed asset
            this.cache2.assetChanged = this.cache2.readFile.delete(id);
        }
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
        if (this._cache.manifest) {
            validateManifest(this._cache.manifest)
        } else {
            throw new Error("Manifest cannot be empty");
        }
    }

    private applyExternalManifestConfiguration(manifest: ChromeExtensionManifest): ChromeExtensionManifest {
        if (typeof this._options.extendManifest === "function") {
            return this._options.extendManifest(manifest);
        } else if (typeof this._options.extendManifest === "object") {
            return {
                ...manifest,
                ...this._options.extendManifest,
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

    private normalizeOptions(options: ManifestProcessorOptions) {
        return {
            ...options,
            components: {
                background: options.components?.background || DefaultManifestProcessorOptions.components?.background,
                contentScripts: options.components?.contentScripts || DefaultManifestProcessorOptions.components?.contentScripts,
                popup: options.components?.popup || DefaultManifestProcessorOptions.components?.popup,
                options: options.components?.options || DefaultManifestProcessorOptions.components?.options,
                override: options.components?.override || DefaultManifestProcessorOptions.components?.override,
                devtools: options.components?.devtools || DefaultManifestProcessorOptions.components?.devtools,
                standalone: options.components?.standalone || DefaultManifestProcessorOptions.components?.standalone,
                webAccessibleResources: options.components?.webAccessibleResources || DefaultManifestProcessorOptions.components?.webAccessibleResources,
            },
            extendManifest: options.extendManifest,
        } as ManifestProcessorOptions;
    }

    private initialProcessors(options: ManifestProcessorOptions) {
        // create processors
        // background processor
        if (options.components?.background) {
            const backgroundOptions = options.components.background === true ? {} : options.components.background;
            backgroundOptions.root = this._options.root;
            backgroundOptions.outDir = this._options.outDir;
            this._processors.set("background", new BackgroundProcessor(backgroundOptions));
        }
        // content script processor
        if (options.components?.contentScripts) {
            const contentScriptOptions = options.components.contentScripts === true ? {} : options.components.contentScripts;
            contentScriptOptions.root = this._options.root;
            contentScriptOptions.outDir = this._options.outDir;
            this._processors.set("content-script", new ContentScriptProcessor(contentScriptOptions));
        }
        // popup processor
        if (options.components?.popup) {
            const popupOptions = options.components.popup === true ? {} : options.components.popup;
            popupOptions.root = this._options.root;
            popupOptions.outDir = this._options.outDir;
            this._processors.set("popup", new PopupProcessor(popupOptions));
        }
        options.components?.options && this._processors.set("options", new OptionsProcessor(options.components.options === true ? {} : options.components.options));
        options.components?.devtools && this._processors.set("devtools", new DevtoolsProcessor(options.components.devtools === true ? {} : options.components.devtools));
        if (options.components?.override) {
            if (options.components.override === true) {
                this._processors.set("bookmarks", new OverrideBookmarksProcessor());
                this._processors.set("history", new OverrideHistoryProcessor());
                this._processors.set("newtab", new OverrideNewtabProcessor());
            } else {
                options.components.override.bookmarks && this._processors.set("bookmarks", new OverrideBookmarksProcessor(options.components.override.bookmarks === true ? {} : options.components.override.bookmarks));
                options.components.override.history && this._processors.set("history", new OverrideHistoryProcessor(options.components.override.history === true ? {} : options.components.override.history));
                options.components.override.newtab && this._processors.set("newtab", new OverrideNewtabProcessor(options.components.override.newtab === true ? {} : options.components.override.newtab));
            }
        }
        options.components?.webAccessibleResources && this._processors.set("web-accessible-resource", new WebAccessibleResourceProcessor(options.components.webAccessibleResources === true ? {} : options.components.webAccessibleResources));
    }
}
