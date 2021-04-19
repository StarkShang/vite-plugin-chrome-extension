import { resolve, dirname, relative } from "path";
import { OutputChunk, PluginContext } from "rollup";
import { HtmlInputsOptions } from "../plugin-options";
import { getOutputFilenameFromChunk } from "../utils/helpers";
import { CheerioFile, formatHtml, getScriptElems } from "./cheerio";

export function generateHtml(
    context: PluginContext,
    htmls: CheerioFile[],
    chunks: OutputChunk[],
    options: HtmlInputsOptions,
    srcDir: string,
) {
    htmls.map($ => replaceImportScriptPath($, chunks, srcDir, options.browserPolyfill))
        .map($ => {
            const source = formatHtml($);
            const fileName = relative(srcDir, $.filePath);
            context.emitFile({
                type: "asset",
                source, // String
                fileName,
        });
    });
}

function replaceImportScriptPath(
    $: CheerioFile,
    chunks: OutputChunk[],
    srcDir: string,
    browserPolyfill?: boolean | { executeScript: boolean },
) {
    getScriptElems($)
        .attr("type", "module")
        .attr("src", (i, value) => {
            const basePath = dirname($.filePath);
            const chunkName = getOutputFilenameFromChunk(resolve(basePath, value as unknown as string), chunks);
            return relative(basePath, resolve(srcDir, chunkName));
        });

    if (browserPolyfill) {
        const head = $("head");
        if (
            browserPolyfill === true ||
            (typeof browserPolyfill === "object" &&
                browserPolyfill.executeScript)
        ) {
            head.prepend(
                '<script src="/assets/browser-polyfill-executeScript.js"></script>',
            );
        }

        head.prepend(
            '<script src="/assets/browser-polyfill.js"></script>',
        );
    }

    return $;
}
