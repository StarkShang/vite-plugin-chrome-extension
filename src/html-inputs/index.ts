import "array-flat-polyfill";

import { readFile } from "fs-extra";

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
