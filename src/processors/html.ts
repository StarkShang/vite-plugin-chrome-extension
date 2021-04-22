import { relative } from "path";
import { InputOption, PluginContext } from "rollup";
import flatten from "lodash.flatten";
import { readFile } from "fs-extra";
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

    public addWatchFiles(context: PluginContext) {
        [
            ...this.cache.css,
            ...this.cache.img,
            ...this.cache.scripts,
            ...this.cache.html,
        ].concat(this.cache.html).forEach((asset) => {
            context.addWatchFile(asset);
        });
    }

    /**
     * Output asset files in html
     * css, img, script(not local import)
     */
    public async emitFiles(context: PluginContext) {
        const assets = [
            ...this.cache.css,
            ...this.cache.img,
            ...this.cache.scripts,
        ];
        const emitting = assets.map(async (asset) => {
            // Read these files as Buffers
            const source = await readFile(asset);
            const fileName = relative(this.options.srcDir!, asset);
            context.emitFile({
                type: "asset",
                source, // Buffer
                fileName,
            });
        });
        await Promise.all(emitting);
    }

    public clearCacheById(id: string) {
        if (id.endsWith(".html") || id.endsWith("manifest.json")) {
            // Dump cache if html file or manifest changes
            this.cache.html$ = [];
        }
    }
}
