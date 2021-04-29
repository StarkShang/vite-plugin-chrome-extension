import fs from "fs-extra";
import chalk from "chalk";
import memoize from "mem";
import { dirname, relative, basename } from "path";
import { cosmiconfigSync } from "cosmiconfig";
import { EmittedAsset, InputOption, InputOptions, OutputBundle, PluginContext } from "rollup";
import { ChromeExtensionManifest, Background } from "../manifest";
import { deriveFiles } from "../manifest-input/manifest-parser";
import { reduceToRecord } from "../manifest-input/reduceToRecord";
import { ManifestInputPluginCache, NormalizedChromeExtensionOptions } from "../plugin-options";
import { cloneObject } from "../utils/cloneObject";
import { manifestName } from "../manifest-input/common/constants";
import { getAssets, getChunk } from "../utils/bundle";
import {
    validateManifest,
    ValidationErrorsArray,
} from "../manifest-input/manifest-parser/validate";
import { ContentScriptProcessor } from "./content-script/content-script";
import { PermissionProcessor, PermissionProcessorOptions } from "./permission";
import { BackgroundProcesser } from "./background";

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
        this.backgroundProcessor = new BackgroundProcesser();
    }

    /**
     * Load content from manifest.json
     * @param options: rollup input options
     */
    public load(options: InputOptions) {
        /* --------------- GET MANIFEST.JSON PATH --------------- */
        const inputManifestPath = this.resolveManifestPath(options);
        /* --------------- LOAD CONTENT FROM MANIFEST.JSON --------------- */
        const configResult = explorer.load(inputManifestPath) as ChromeExtensionConfigurationInfo;
        /* --------------- VALIDATE MANIFEST.JSON CONTENT --------------- */
        this.validateManifestContent(configResult);
        /* --------------- APPLY USER CUSTOM CONFIG --------------- */
        this.manifest = this.applyExternalManifestConfiguration(configResult);
        /* --------------- RECORD OPTIONS --------------- */
        this.options.manifestPath = configResult.filepath;
        this.options.srcDir = dirname(this.options.manifestPath);
        return this.manifest;
    }

    /**
     * Resolve input files for rollup
     * @param input: Input not in manifest.json but specify by user
     * @returns
     */
    public resolveInput(input?: InputOption): {
        [entryAlias: string]: string;
    } {
        if (!this.manifest || !this.options.srcDir) {
            throw new TypeError("manifest and options.srcDir not initialized");
        }
        // Derive all resources from manifest
        const { js, html, css, img, others } = deriveFiles(
            this.manifest,
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
        this.manifest.permissions = this.permissionProcessor.derivePermissions(context, chunks);
        /* ----------------- UPDATE CONTENT SCRIPTS ----------------- */
        await this.contentScriptProcessor.generateBundle(context, bundle, this.manifest);
        /* ----------------- SETUP BACKGROUND SCRIPTS ----------------- */
        this.manifest.background = this.backgroundProcessor.generateBundle(bundle, this.manifest.background);
        /* ----------------- SETUP ASSETS IN WEB ACCESSIBLE RESOURCES ----------------- */

        /* ----------------- STABLE EXTENSION ID ----------------- */
        /* ----------------- OUTPUT MANIFEST.JSON ----------------- */
        /* ----------- OUTPUT MANIFEST.JSON ---------- */
        this.generateManifest(context, this.manifest);
        // validate manifest
        this.validateManifest();
    }

    private resolveManifestPath(options: InputOptions): string {
        if (!options.input) {
            console.log(chalk.red("No input is provided."))
            throw new Error("No input is provided.")
        }
        let inputManifestPath: string | undefined;
        if (Array.isArray(options.input)) {
            const manifestIndex = options.input.findIndex(i => basename(i) === "manifest.json");
            if (manifestIndex > -1) {
                inputManifestPath = options.input[manifestIndex];
                this.cache.inputAry = options.input.splice(manifestIndex, 1);
            } else {
                console.log(chalk.red("RollupOptions.input array must contain a Chrome extension manifest with filename 'manifest.json'."));
                throw new Error("RollupOptions.input array must contain a Chrome extension manifest with filename 'manifest.json'.");
            }
        } else if (typeof options.input === "object") {
            if (options.input.manifest) {
                inputManifestPath = options.input.manifest;
                delete options.input["manifest"];
                this.cache.inputObj = cloneObject(options.input);
            } else {
                console.log(chalk.red("RollupOptions.input object must contain a Chrome extension manifest with Key manifest."));
                throw new Error("RollupOptions.input object must contain a Chrome extension manifest with Key manifest.");
            }
        } else {
            inputManifestPath = options.input;
            delete options.input;
        }
        /* --------------- VALIDATE MANIFEST.JSON PATH --------------- */
        if (basename(inputManifestPath) !== "manifest.json") {
            throw new TypeError("Input for a Chrome extension manifest must have filename 'manifest.json'.");
        }
        return inputManifestPath;
    }

    private validateManifestContent(config: ChromeExtensionConfigurationInfo) {
        if (config.isEmpty) {
            throw new Error(`${config.filepath} is an empty file.`);
        }
        const { options_page, options_ui } = config.config;
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

    private applyExternalManifestConfiguration(
        config: ChromeExtensionConfigurationInfo
    ): ChromeExtensionManifest {
        if (typeof this.options.extendManifest === "function") {
            return this.options.extendManifest(config.config);
        } else if (typeof this.options.extendManifest === "object") {
            return {
                ...config.config,
                ...this.options.extendManifest,
            };
        } else {
            return config.config;
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
