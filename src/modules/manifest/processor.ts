import path from "path";
import fs, { ensureDir, ensureDirSync } from "fs-extra";
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
import { ContentScriptProcessor, ContentScriptProcessorInternalOptions } from "../content-script";
import { OptionsProcessor } from "../options/processor";
import { DevtoolsProcessor } from "../devtools";
import { PopupProcessor, PopupProcessorInternalOptions } from "../popup";
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
        const modules = (await Promise.all(Array.from(this._processors)
            .map(async ([key, processor]) => {
                const filesNeedWatch = await processor.resolve(currentManifest);
                filesNeedWatch.forEach(file => {
                    const mapping = this._cache.mappings.get(file);
                    if (mapping) {
                        mapping.add(key);
                    } else {
                        this._cache.mappings.set(file, new Set<string>([key]));
                    }
                });
                return filesNeedWatch;
            })))
            .flat();
        return Array.from(new Set(modules));
    }

    public async build(): Promise<void> {
        // start build process
        await Promise.all(
            Array.from(this._processors.values())
                .map(processor => processor.build()));
    }

    public async updateManifest(bundles: ChromeExtensionManifestEntries): Promise<void> {
        if (!this._cache.manifest) { return; }
        const manifest = this._cache.manifest; // for shortening code
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
        const processorKeys = this._cache.mappings.get(id);
        if (processorKeys) {
            processorKeys.forEach(key => {
                this._processors.get(key)?.clearCacheByFilePath(id);
            });
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
        let rootPath = options.root;
        let outputPath = options.outDir;
        return {
            ...options,
            root: rootPath,
            outDir: outputPath,
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
            const contentScriptOptions =
                options.components.contentScripts === true
                    ? {} as ContentScriptProcessorInternalOptions
                    : options.components.contentScripts as ContentScriptProcessorInternalOptions;
            contentScriptOptions.root = this._options.root;
            contentScriptOptions.outputRoot = this._options.outDir;
            this._processors.set("content-script", new ContentScriptProcessor(contentScriptOptions));
        }
        // popup processor
        if (options.components?.popup) {
            const popupOptions =
                options.components.popup === true
                    ? {} as PopupProcessorInternalOptions
                    : options.components.popup as PopupProcessorInternalOptions;
            popupOptions.root = this._options.root;
            popupOptions.outputRoot = this._options.outDir;
            this._processors.set("popup", new PopupProcessor(popupOptions));
        }
        // options processor
        if (options.components?.options) {
            const optionsOptions = options.components.options === true ? {} : options.components.options;
            optionsOptions.root = this._options.root;
            optionsOptions.outDir = this._options.outDir;
            this._processors.set("options", new OptionsProcessor(optionsOptions));
        }
        // devtools processor
        if (options.components?.devtools) {
            this._processors.set("devtools", new DevtoolsProcessor(options.components.devtools === true ? {} : options.components.devtools));
        }
        // override processor
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
        // web accessible resource processor
        if (options.components?.webAccessibleResources) {
            const webAccessibleResourceOptions = options.components.webAccessibleResources === true ? {} : options.components.webAccessibleResources;
            webAccessibleResourceOptions.root = this._options.root;
            webAccessibleResourceOptions.outDir = this._options.outDir;
            this._processors.set("web-accessible-resource", new WebAccessibleResourceProcessor(webAccessibleResourceOptions));
        }
        // other resource processor
        this._processors.set("resource", new ResourceProcessor({
            root: this._options.root,
            outDir: this._options.outDir,
        }));
    }
}

class ResourceProcessor implements IComponentProcessor {
    private _modules = new Map<string, Buffer>();
    constructor(private _options: { root: string, outDir: string }) {}

    public async resolve(manifest: ChromeExtensionManifest): Promise<string[]> {
        if (manifest.action?.default_icon) {
            (Object.values(manifest.action.default_icon) as string[])
                .forEach(resource => {
                    if (!this._modules.has(resource)) {
                        const inputFilePath = path.resolve(this._options.root, resource);
                        this._modules.set(resource, fs.readFileSync(inputFilePath));
                    }
                });
        }
        if (manifest.icons) {
            (Object.values(manifest.icons) as string[])
                .forEach(resource => {
                    if (!this._modules.has(resource)) {
                        const inputFilePath = path.resolve(this._options.root, resource);
                        this._modules.set(resource, fs.readFileSync(inputFilePath));
                    }
                });
        }
        return Array.from(this._modules.keys());
    }

    public async build(): Promise<void> {
        const outputPath = path.resolve(this._options.root, this._options.outDir);
        await ensureDir(outputPath);
        this._modules.forEach((asset, resource) => {
            const outputFilePath = path.resolve(outputPath, resource);
            ensureDirSync(path.dirname(outputFilePath));
            fs.writeFileSync(outputFilePath, asset);
        });
    }

    public clearCacheByFilePath(file: string): void {
        if (this._modules.has(file)) {
            this._modules.delete(file);
        }
    }
}
