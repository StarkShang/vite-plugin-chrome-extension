import { dirname } from "path";
import { cosmiconfigSync } from "cosmiconfig";
import { InputOption, InputOptions } from "rollup";
import { ChromeExtensionManifest } from "../manifest";
import { deriveFiles } from "../manifest-input/manifest-parser";
import { reduceToRecord } from "../manifest-input/reduceToRecord";
import { NormalizedChromeExtensionOptions } from "../plugin-options";
import chalk from "chalk";
import { basename } from "path";

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
    public manifestPath = "";
    public manifest?: ChromeExtensionManifest;

    public constructor(private options = {} as NormalizedChromeExtensionOptions) {}

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
        this.options.srcDir = dirname(this.manifestPath);
        return this.manifest;
    }

    /**
     * Resolve input files for rollup
     * @param input: Input not in manifest.json but specify by user
     * @returns
     */
    public resolveInput(input?: InputOption) {
        if (!this.manifest || !this.options.srcDir) { return; }
        // Derive all resources from manifest
        const { js, html, css, img, others } = deriveFiles(
            this.manifest,
            this.options.srcDir,
        );
        const assets = [...new Set([...css, ...img, ...others])];
        const inputs = Array.isArray(input)
            ? [...input, ...js, ...html].reduce(reduceToRecord(this.options.srcDir), {})
            : typeof input === "object"
                ? [...js, ...html].reduce(reduceToRecord(this.options.srcDir), input)
                : [...js, ...html].reduce(reduceToRecord(this.options.srcDir), {});
        return inputs;
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
                options.input.splice(manifestIndex, 1);
            } else {
                console.log(chalk.red("RollupOptions.input array must contain a Chrome extension manifest with filename 'manifest.json'."));
                throw new Error("RollupOptions.input array must contain a Chrome extension manifest with filename 'manifest.json'.");
            }
        } else if (typeof options.input === "object") {
            if (options.input.manifest) {
                inputManifestPath = options.input.manifest;
                delete options.input["manifest"];
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
}
