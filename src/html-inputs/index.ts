import "array-flat-polyfill";

import { readFile } from "fs-extra";
import flatten from "lodash.flatten";
import { relative } from "path";

import { isChunk, not } from "../utils/helpers";
import { reduceToRecord } from "../manifest-input/reduceToRecord";
import {
    HtmlInputsOptions,
    HtmlInputsPluginCache,
    HtmlInputsPlugin,
} from "../plugin-options";
import {
    getCssHrefs,
    getImgSrcs,
    getJsAssets,
    getScriptSrc,
    loadHtml,
} from "./cheerio";
import { generateHtml } from "./generateBundle";

const isHtml = (path: string) => /\.html?$/.test(path);

const name = "html-inputs";

/* ============================================ */
/*                  HTML-INPUTS                 */
/* ============================================ */

export default function htmlInputs(
    htmlInputsOptions: HtmlInputsOptions,
    /** Used for testing */
    cache = {
        scripts: [],
        html: [],
        html$: [],
        js: [],
        css: [],
        img: [],
        input: [],
    } as HtmlInputsPluginCache,
): HtmlInputsPlugin {
    return {
        name,
        cache,

        /* ============================================ */
        /*                 OPTIONS HOOK                 */
        /* ============================================ */

        options(options) {
            // srcDir may be initialized by another plugin
            const { srcDir } = htmlInputsOptions;

            if (srcDir) {
                cache.srcDir = srcDir;
            } else {
                throw new TypeError("options.srcDir not initialized");
            }

            // Skip if cache.input exists
            // cache is dumped in watchChange hook

            // Parse options.input to array
            let input: string[];
            if (typeof options.input === "string") {
                input = [options.input];
            } else if (Array.isArray(options.input)) {
                input = [...options.input];
            } else if (typeof options.input === "object") {
                input = Object.values(options.input);
            } else {
                throw new TypeError(
                    `options.input cannot be ${typeof options.input}`,
                );
            }

            /* ------------------------------------------------- */
            /*                 HANDLE HTML FILES                 */
            /* ------------------------------------------------- */

            // Filter htm and html files
            cache.html = input.filter(isHtml);

            // If no html files, do nothing
            if (cache.html.length === 0) return options;

            // If the cache has been dumped, reload from files
            if (cache.html$.length === 0) {
                // This is all done once
                cache.html$ = cache.html.map(loadHtml(srcDir));

                cache.js = flatten(cache.html$.map(getScriptSrc));
                cache.css = flatten(cache.html$.map(getCssHrefs));
                cache.img = flatten(cache.html$.map(getImgSrcs));
                cache.scripts = flatten(cache.html$.map(getJsAssets));

                // Cache jsEntries with existing options.input
                cache.input = input.filter(not(isHtml)).concat(cache.js);

                if (cache.input.length === 0) {
                    throw new Error(
                        "At least one HTML file must have at least one script.",
                    );
                }
            }

            // TODO: simply remove HTML files from options.input
            // - Parse HTML and emit chunks and assets in buildStart
            return {
                ...options,
                input: cache.input.reduce(
                    reduceToRecord(htmlInputsOptions.srcDir),
                    {},
                ),
            };
        },

        /* ============================================ */
        /*              HANDLE FILE CHANGES             */
        /* ============================================ */

        /**
         * Output asset files in html
         * css, img, script(not local import)
         */
        async buildStart() {
            const { srcDir } = htmlInputsOptions;

            if (srcDir) {
                cache.srcDir = srcDir;
            } else {
                throw new TypeError("options.srcDir not initialized");
            }

            const assets = [
                ...cache.css,
                ...cache.img,
                ...cache.scripts,
            ];

            assets.concat(cache.html).forEach((asset) => {
                this.addWatchFile(asset);
            });

            const emitting = assets.map(async (asset) => {
                // Read these files as Buffers
                const source = await readFile(asset);
                const fileName = relative(srcDir, asset);

                this.emitFile({
                    type: "asset",
                    source, // Buffer
                    fileName,
                });
            });

            await Promise.all(emitting);
        },

        watchChange(id) {
            if (id.endsWith(".html") || id.endsWith("manifest.json")) {
                // Dump cache if html file or manifest changes
                cache.html$ = [];
            }
        },

        generateBundle(options, bundle) {
            if (!cache.srcDir) {
                throw new TypeError("cache.srcDir not initialized");
            }
            const chunks = Object.values(bundle).filter(isChunk);
            generateHtml(this, cache.html$, chunks, htmlInputsOptions, cache.srcDir);
        },
    };
}
