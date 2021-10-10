import {ModuleFormat, OutputBundle, OutputChunk, PluginContext, rollup} from "rollup";
import { mixinPlugin } from "./mixin.plugin";

/**
 * bundle entry chunk and its dependencies into one chunk
 * which will replace the entry chunk
 * @param context: context of parent rollup process
 * @param entry: chunk as entry point
 * @param bundle: chunks bundled by parent rollup process
 * @param format: format of the rollup bundle
 * @returns
 */
export async function mixinChunks(
    context: PluginContext,
    entry: OutputChunk,
    bundle: OutputBundle,
    format?: ModuleFormat,
): Promise<string> {
    const build = await rollup({
        input: entry.fileName,
        plugins: [mixinPlugin(bundle)],
    });
    const outputs = (await build.generate({ format })).output;
    if (outputs.length < 1) {
        throw new Error("");
    } else if (outputs.length > 1) {
        throw new Error("mix content script chunks error: output must contain only one chunk.");
    }
    const outputChunk = outputs[0];
    const referenceId = context.emitFile({
        type: "asset",
        source: outputChunk.code,
        fileName: entry.fileName,
    });
    return context.getFileName(referenceId);
}
