import "array-flat-polyfill";

import { readFile } from "fs-extra";


import { isChunk, not } from "../common/utils/helpers";
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

        generateBundle(options, bundle) {
            if (!cache.srcDir) {
                throw new TypeError("cache.srcDir not initialized");
            }
            const chunks = Object.values(bundle).filter(isChunk);
            generateHtml(this, cache.html$, chunks, htmlInputsOptions, cache.srcDir);
        },
    };
}
