import { OutputBundle, OutputChunk, PluginContext, rollup } from "rollup";
import { mixinPlugin } from "./mixin.plugin";

/**
 * bundle entry chunk and its dependences into one IIFE chunk
 * this function will replace the entry chunk
 * @param context: context of parent rollup process
 * @param entry: chunk as entry point
 * @param bundle: chunks bundled by parent rollup process
 * @returns
 */
export async function mixinChunksForIIFE(
    context: PluginContext,
    entry: OutputChunk,
    bundle: OutputBundle
): Promise<string> {
    const build = await rollup({
        input: entry.fileName,
        plugins: [mixinPlugin(bundle)]
    });
    const outputs = (await build.generate({ format: "iife" })).output;
    if (outputs.length < 1) {
        throw new Error("");
    } else if (outputs.length > 1) {
        throw new Error("mix content script chunks error: output must contain only one chunk.");
    }
    const outputChunk = outputs[0];
    const referenceId = context.emitFile({
        type: "asset",
        source: outputChunk.code,
        fileName: entry.fileName
    });
    return context.getFileName(referenceId);
}
