import { cosmiconfigSync } from "cosmiconfig";
import { JSONPath } from "jsonpath-plus";
import path from "path";
import { EmittedAsset } from "rollup";
import {
    findChunk,
    getOutputFilenameFromChunk,
    isJsonFilePath,
} from "../utils/helpers";
import { ChromeExtensionManifest } from "../manifest";
import {
    ManifestInputPlugin,
    ManifestInputPluginCache,
    ManifestInputPluginOptions,
} from "../plugin-options";
import { cloneObject } from "../utils/cloneObject";
import { manifestName } from "./common/constants";
import { generateManifest } from "./generateBundle";
import { combinePerms } from "./manifest-parser/combine";
import {
    deriveFiles,
} from "../processors/manifest/parser";
import {
    validateManifest,
    ValidationErrorsArray,
} from "./manifest-parser/validate";
import { reduceToRecord } from "./reduceToRecord";
import { join } from "path";
import { getAssets, getChunk } from "../utils/bundle";
import slash from "slash";

export const explorer = cosmiconfigSync("manifest", {
    cache: false,
});

const name = "manifest-input";

const npmPkgDetails =
    process.env.npm_package_name &&
        process.env.npm_package_version &&
        process.env.npm_package_description
        ? {
            name: process.env.npm_package_name,
            version: process.env.npm_package_version,
            description: process.env.npm_package_description,
        }
        : {
            name: "",
            version: "",
            description: "",
        };

/* ============================================ */
/*                MANIFEST-INPUT                */
/* ============================================ */

export function manifestInput(
    {
        browserPolyfill = false,
        contentScriptWrapper = true,
        crossBrowser = false,
        dynamicImportWrapper = {},
        extendManifest = {},
        firstClassManifest = true,
        iifeJsonPaths = [],
        pkg = npmPkgDetails,
        publicKey,
        cache = {
            assetChanged: false,
            assets: [],
            iife: [],
            input: [],
            inputAry: [],
            inputObj: {},
            permsHash: "",
            readFile: new Map<string, any>(),
            srcDir: null,
            dynamicImportContentScripts: []
        } as ManifestInputPluginCache,
    } = {} as ManifestInputPluginOptions,
): ManifestInputPlugin {

    /* ----------- HOOKS CLOSURES START ----------- */
    let manifestPath: string;
    /* ------------ HOOKS CLOSURES END ------------ */

    /* --------------- plugin object -------------- */
    return {
        name,

        browserPolyfill,
        crossBrowser,

        get srcDir() {
            return cache.srcDir;
        },

        get formatMap() {
            return { iife: cache.iife };
        },

        /* ============================================ */
        /*                 OPTIONS HOOK                 */
        /* ============================================ */

        options(options) {
            // Do not reload manifest without changes
            if (!cache.manifest) {
                /* ----------- LOAD AND PROCESS MANIFEST ----------- */
                let inputManifestPath: string | undefined;
                if (Array.isArray(options.input)) {
                    const manifestIndex = options.input.findIndex(
                        isJsonFilePath,
                    );
                    inputManifestPath = options.input[manifestIndex];
                    cache.inputAry = [
                        ...options.input.slice(0, manifestIndex),
                        ...options.input.slice(manifestIndex + 1),
                    ];
                } else if (typeof options.input === "object") {
                    inputManifestPath = options.input.manifest;
                    cache.inputObj = cloneObject(options.input);
                    delete cache.inputObj["manifest"];
                } else {
                    inputManifestPath = options.input;
                }

                if (!isJsonFilePath(inputManifestPath)) {
                    throw new TypeError(
                        "RollupOptions.input must be a single Chrome extension manifest.",
                    );
                }

                // Load content of manifest.json
                const configResult = explorer.load(
                    inputManifestPath,
                ) as {
                    filepath: string,
                    config: ChromeExtensionManifest,
                    isEmpty?: true,
                };
                if (configResult.isEmpty) {
                    throw new Error(`${options.input} is an empty file.`);
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

                manifestPath = configResult.filepath;

                if (typeof extendManifest === "function") {
                    cache.manifest = extendManifest(configResult.config);
                } else if (typeof extendManifest === "object") {
                    cache.manifest = {
                        ...configResult.config,
                        ...extendManifest,
                    };
                } else {
                    cache.manifest = configResult.config;
                }

                cache.srcDir = path.dirname(manifestPath);

                if (firstClassManifest) {
                    cache.iife = iifeJsonPaths
                        .map((jsonPath) => {
                            const result = JSONPath({
                                path: jsonPath,
                                json: cache.manifest!,
                            });

                            return result;
                        })
                        .flat(Infinity);

                    // Derive entry paths from manifest
                    const { js, html, css, img, others } = deriveFiles(
                        cache.manifest,
                        cache.srcDir,
                    );

                    // Cache derived inputs
                    cache.input = [...cache.inputAry, ...js, ...html];

                    cache.assets = [
                        // Dedupe assets
                        ...new Set([...css, ...img, ...others]),
                    ];
                }

                /* --------------- END LOAD MANIFEST --------------- */
            }
            const finalInput = cache.input.reduce(
                reduceToRecord(cache.srcDir),
                cache.inputObj,
            );
            return { ...options, input: finalInput };
        },

        /* ============================================ */
        /*                GENERATEBUNDLE                */
        /* ============================================ */

        generateBundle(options, bundle) {
            /* ----------------- GET CHUNKS -----------------*/
            const chunks = getChunk(bundle);
            const assets = getAssets(bundle);

            if (Object.keys(bundle).length === 0) {
                throw new Error(
                    "The manifest must have at least one asset (html or css) or script file.",
                );
            }

            try {
                // Clone cache.manifest
                if (!cache.manifest)
                    // This is a programming error, so it should throw
                    throw new TypeError(`cache.manifest is ${typeof cache.manifest}`);

                const clonedManifest = cloneObject(cache.manifest);

                const manifestBody: ChromeExtensionManifest = validateManifest({
                    description: pkg.description,
                    ...clonedManifest,
                    permissions: combinePerms(
                        clonedManifest.permissions || [],
                    ),
                } as ChromeExtensionManifest);

                const {
                    content_scripts: cts = [],
                    web_accessible_resources: war = [],
                    background: { service_worker: sw = "" } = {},
                } = manifestBody;
                /* ------------- SETUP CONTENT SCRIPTS ------------- */
                manifestBody.content_scripts = cts.map(
                    ({ js, ...rest }) => typeof js === "undefined"
                        ? rest
                        : {
                            js: js
                                .map(filename => getOutputFilenameFromChunk(join(cache.srcDir!, filename), Object.values(chunks)))
                                .filter(filename => !!filename)
                                .map((p) => slash(p)),
                            ...rest,
                        },
                );
                /* ------------ SETUP BACKGROUND SCRIPTS ----------- */
                if (sw && manifestBody.background && manifestBody.background.service_worker) {
                    // make background chunk output in the same directory as manifest.json
                    const chunk = findChunk(join(cache.srcDir!, manifestBody.background.service_worker), chunks);
                    if (chunk) {
                        // remove original chunk
                        delete bundle[chunk.fileName];
                        // change background chunk output in the same directory as manifest.json
                        chunk.fileName = chunk.fileName.replace(/assets\//, "");
                        bundle[chunk.fileName] = chunk;
                        manifestBody.background.service_worker = chunk.fileName;
                    }
                }
                /* ------------ SETUP ASSETS IN WEB ACCESSIBLE RESOURCES ----------- */
                manifestBody.web_accessible_resources = [
                    ...war, {
                    resources: Object.keys(assets),
                    matches: ["<all_urls>"]
                }];
                /* --------- STABLE EXTENSION ID -------- */
                if (publicKey) manifestBody.key = publicKey;
                /* ----------- OUTPUT MANIFEST.JSON ---------- */
                generateManifest(this, manifestBody);
            } catch (error) {
                // Catch here because we need the validated result in scope
                if (error.name !== "ValidationError") throw error;
                const errors = error.errors as ValidationErrorsArray;
                if (errors) {
                    errors.forEach((err) => {
                        // FIXME: make a better validation error message
                        // https://github.com/atlassian/better-ajv-errors
                        this.warn(JSON.stringify(err, undefined, 2));
                    });
                }
                this.error(error.message);
            }
        },
    };
}

export default manifestInput;
