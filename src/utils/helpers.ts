import { OutputOptions } from "rollup";
import { OutputAsset, OutputChunk, OutputBundle } from "rollup";
import slash from "slash";
import { OutputChunkBundle } from "../common/models";
import { ChromeExtensionManifest } from "../manifest.v2";

export const not = <T>(fn: (x: T) => boolean) => (x: T) => !fn(x);

export function isChunk(
    x: OutputChunk | OutputAsset,
): x is OutputChunk {
    return x && x.type === "chunk";
}

export function isOutputOptions(x: any): x is OutputOptions {
    return (
        typeof x === "object" &&
        !Array.isArray(x) &&
        typeof x.format === "string" &&
        ["iife", "es"].includes(x.format)
    );
}

export function isAsset(
    x: OutputChunk | OutputAsset,
): x is OutputAsset {
    return x.type === "asset";
}

export function isString(x: any): x is string {
    return typeof x === "string";
}

export function isJsonFilePath(x: any): x is string {
    return isString(x) && x.endsWith("json");
}

export const normalizeFilename = (p: string) =>
    p.replace(/\.[tj]sx?$/, ".js");

export function getOutputFilenameFromChunk(sourceFileName: string, chunks: OutputChunk[]) {
    const chunk = chunks.find(c => c.facadeModuleId && slash(c.facadeModuleId) === slash(sourceFileName));
    return slash(chunk?.fileName || "");
}
export function findChunkByName(name: string, bundle: OutputBundle): OutputChunk | undefined {
    return Object.values(bundle).find(b => b.name && slash(b.name) === slash(name) && b.type === "chunk") as OutputChunk | undefined;
}
export function findAssetByName(name: string, bundle: OutputBundle): OutputAsset | undefined {
    return Object.values(bundle).find(b => b.name && slash(b.name) === slash(name) && b.type === "asset") as OutputAsset | undefined;
}
export function findChunk(sourceFileName: string, chunks: OutputChunkBundle) {
    return Object.values(chunks).find(c => c.facadeModuleId && slash(c.facadeModuleId) === slash(sourceFileName));
}

/**
 * Update the manifest source in the output bundle
 */
export const updateManifest = (
    updater: (
        manifest: ChromeExtensionManifest,
    ) => ChromeExtensionManifest,
    bundle: OutputBundle,
    handleError?: (message: string) => void,
): OutputBundle => {
    try {
        const manifestKey = "manifest.json";
        const manifestAsset = bundle[manifestKey] as OutputAsset;

        if (!manifestAsset) {
            throw new Error(
                "No manifest.json in the rollup output bundle.",
            );
        }

        const manifest = JSON.parse(
            manifestAsset.source as string,
        ) as ChromeExtensionManifest;

        const result = updater(manifest);

        manifestAsset.source = JSON.stringify(result, undefined, 2);
    } catch (error: any) {
        if (handleError) {
            handleError(error.message);
        } else {
            throw error;
        }
    }

    return bundle;
};
