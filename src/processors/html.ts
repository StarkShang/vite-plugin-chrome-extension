import { InputOption } from "rollup";
import flatten from "lodash.flatten";
import { flattenRollupInput } from "../common/utils/rollup";
import { getCssHrefs, getImgSrcs, getJsAssets, getScriptSrc, loadHtml } from "../html-inputs/cheerio";
import { HtmlInputsPluginCache, NormalizedChromeExtensionOptions } from "../plugin-options";
import { not } from "../utils/helpers";
import { reduceToRecord } from "../manifest-input/reduceToRecord";

const isHtml = (path: string) => /\.html?$/.test(path);

export class HtmlProcessor {
    private cache = {
        scripts: [],
        html: [],
        html$: [],
        js: [],
        css: [],
        img: [],
        input: [],
    } as HtmlInputsPluginCache;

    constructor(private options: NormalizedChromeExtensionOptions) { }

    public resolveInput(input?: InputOption) {
        // srcDir may be initialized by another plugin
        const { srcDir } = this.options;
        if (srcDir) {
            this.cache.srcDir = srcDir;
        } else {
            throw new TypeError("options.srcDir not initialized");
        }

        // Skip if cache.input exists
        // cache is dumped in watchChange hook

        // Flatten input to array
        const inputArray = flattenRollupInput(input);

        /* ------------------------------------------------- */
        /*                 HANDLE HTML FILES                 */
        /* ------------------------------------------------- */

        // Filter htm and html files
        this.cache.html = inputArray.filter(isHtml);

        // If no html files, do nothing
        if (this.cache.html.length === 0) return input;

        // If the cache has been dumped, reload from files
        if (this.cache.html$.length === 0) {
            // This is all done once
            this.cache.html$ = this.cache.html.map(loadHtml(srcDir));
            this.cache.js = flatten(this.cache.html$.map(getScriptSrc));
            this.cache.css = flatten(this.cache.html$.map(getCssHrefs));
            this.cache.img = flatten(this.cache.html$.map(getImgSrcs));
            this.cache.scripts = flatten(this.cache.html$.map(getJsAssets));

            // Remove HTML files from input
            // Cache jsEntries with existing input
            this.cache.input = inputArray.filter(not(isHtml)).concat(this.cache.js);

            if (this.cache.input.length === 0) {
                throw new Error("At least one HTML file must have at least one script.");
            }
        }

        // - Parse HTML and emit chunks and assets in buildStart
        return this.cache.input.reduce(reduceToRecord(srcDir), {});
    }
}
