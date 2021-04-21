import { dirname } from "path";
import { cosmiconfigSync } from "cosmiconfig";
import { InputOption } from "rollup";
import { ChromeExtensionManifest } from "../manifest";
import { deriveFiles } from "../manifest-input/manifest-parser";
import { isJsonFilePath } from "../utils/helpers";
import { reduceToRecord } from "../manifest-input/reduceToRecord";

export const explorer = cosmiconfigSync("manifest", {
    cache: false,
});

export type ExtendManifest =
    | Partial<ChromeExtensionManifest>
    | ((manifest: ChromeExtensionManifest) => ChromeExtensionManifest);

export class ManifestProcessor {
    public rootPath = "";
    public manifestPath = "";
    public extendManifest: ExtendManifest = {};
    public manifest?: ChromeExtensionManifest;

    public constructor() {

    }

    /**
     * Load content from manifest.json
     * @param option 
     */
    public load(option?: InputOption) {
        /* --------------- GET MANIFEST.JSON PATH --------------- */
        let inputManifestPath: string | undefined;
        if (Array.isArray(option)) {
            const manifestIndex = option.findIndex(isJsonFilePath);
            inputManifestPath = option[manifestIndex];
            option.splice(manifestIndex, 1);
        } else if (typeof option === "object") {
            inputManifestPath = option.manifest;
            delete option["manifest"];
        } else {
            inputManifestPath = option;
        }

        /* --------------- VALIDATE MANIFEST.JSON PATH --------------- */
        if (!isJsonFilePath(inputManifestPath)) {
            throw new TypeError("RollupOptions.input must be a single Chrome extension manifest.");
        }

        /* --------------- LOAD CONTENT FROM MANIFEST.JSON --------------- */
        const configResult = explorer.load(
            inputManifestPath,
        ) as {
            filepath: string,
            config: ChromeExtensionManifest,
            isEmpty?: true,
        };

        /* --------------- VALIDATE MANIFEST.JSON CONTENT --------------- */
        if (configResult.isEmpty) {
            throw new Error(`${option} is an empty file.`);
        }
        const { options_page, options_ui } = configResult.config;
        if (
            options_page !== undefined &&
            options_ui !== undefined
        ) {
            throw new Error(
                "options_ui and options_page cannot both be defined in manifest.json.",
            );
        }

        /* --------------- RECORD MANIFEST.JSON PATH --------------- */
        this.manifestPath = configResult.filepath;

        /* --------------- APPLY USER CUSTOM CONFIG --------------- */
        if (typeof this.extendManifest === "function") {
            this.manifest = this.extendManifest(configResult.config);
        } else if (typeof this.extendManifest === "object") {
            this.manifest = {
                ...configResult.config,
                ...this.extendManifest,
            };
        } else {
            this.manifest = configResult.config;
        }
        this.rootPath = dirname(this.manifestPath);
        return this.manifest;
    }

    public resolveInput(input?: InputOption) {
        if (!this.manifest) { return; }
        // Derive entry paths from manifest
        const { js, html, css, img, others } = deriveFiles(
            this.manifest,
            this.rootPath,
        );
        const assets = [...new Set([...css, ...img, ...others])];
        const inputs = Array.isArray(input)
            ? [...input, ...js, ...html].reduce(reduceToRecord(this.rootPath), {})
            : typeof input === "object"
                ? [...js, ...html].reduce(reduceToRecord(this.rootPath), input)
                : [...js, ...html].reduce(reduceToRecord(this.rootPath), {});
        return inputs;
    }
}

export const manifestProcessor = new ManifestProcessor();