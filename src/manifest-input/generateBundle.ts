import { basename, join } from "path";
import { OutputChunk, PluginContext } from "rollup";
import slash from "slash";
import memoize from "mem";
import { findChunk, getOutputFilenameFromChunk } from "../utils/helpers";
import { ChromeExtensionManifest, ContentScript, WebAccessibleResource } from "../manifest";
import { DynamicImportWrapperOptions, prepImportWrapperScript } from "./dynamicImportWrapper";
import { code as ctWrapperScript } from "code ./browser/contentScriptWrapper.ts";
import { backgroundScriptName, manifestName } from "./common/constants";
import { replaceContentScriptsPath } from "./utils/manifest";
import { OutputChunkBundle } from "../common/models";

export function dedupe<T>(x: T[]): T[] {
    return [...new Set(x)];
}

export function processContentScripts(
    manifest: ChromeExtensionManifest,
    chunks: OutputChunkBundle,
    srcDir: string,
) {
    replaceContentScriptsPath(manifest, path => {
        const chunk = findChunk(join(srcDir, path), chunks);
        return chunk?.fileName || "";
    });
}

export function generateContentScriptsWrapper(
    context: PluginContext,
    content_scripts: ContentScript[],
    web_accessible_resources: WebAccessibleResource[],
    manifest: ChromeExtensionManifest,
    chunks: OutputChunk[],
    srcDir: string,
): void {
    // Flatten all js file form /content_scripts/*/js/* into an array named contentScripts
    const contentScripts = content_scripts.reduce(
        (r, { js = [] }) => [...r, ...js],
        [] as string[],
    );
    if (!contentScripts.length) { return; }

    const memoizedEmitter = memoize(
        (scriptPath: string) => {
            const source = ctWrapperScript.replace(
                "%PATH%",
                // Fix path slashes to support Windows
                JSON.stringify(slash(scriptPath)),
            );
            // output content script wrapper
            const assetId = context.emitFile({
                type: "asset",
                source,
                name: basename(scriptPath),
            });
            return context.getFileName(assetId);
        },
    );
    // Setup content script import wrapper
    manifest.content_scripts = content_scripts.map(
        ({ js, ...rest }) => typeof js === "undefined"
            ? rest
            : {
                js: js
                    .map(filename => getOutputFilenameFromChunk(join(srcDir, filename), chunks))
                    .filter(filename => !!filename)
                    .map(memoizedEmitter)
                    .map((p) => slash(p)),
                ...rest,
            },
    );
    // make all imports & dynamic imports web_acc_res
    const imports = chunks.reduce(
        (r, { isEntry, fileName }) =>
            // Get imported filenames
            !isEntry ? [...r, fileName] : r,
        [] as string[],
    );
    // Get compiled content scripts, not wrapper
    const compiled_content_scripts = content_scripts
        .filter(cs => !!cs.js)
        .reduce((scripts, js_scripts) => [...scripts, ...js_scripts.js!], [] as string[])
        .map(filename => getOutputFilenameFromChunk(join(srcDir, filename), chunks));
    const webAccessResourcesFileNames = dedupe([
        // FEATURE: filter out imports for background?
        ...imports,
        // Need to be web accessible b/c of import
        ...compiled_content_scripts,
    ]).map((p) => slash(p));
    manifest.web_accessible_resources = [
        {
            resources: [...webAccessResourcesFileNames],
            matches: ["<all_urls>"],
        } as WebAccessibleResource,
        ...dedupe(web_accessible_resources).map(resource => {
            resource.resources = resource.resources.map(p => slash(p));
            return resource;
        }),
    ];
}

/**
 * Create a dynamic import wrapper for background.js
 * @export
 * @param {PluginContext} context
 * @param {string} service_worker_path: the original path for service_work_path in original manifest.json
 * @param {DynamicImportWrapperOptions} dynamicImportWrapper: options for dynamic import wrapper
 * @param {OutputChunk[]} chunks: compiled chunks from rollup
 * @param {string} srcDir: absolute path for original manifest.json
 * @return {*} : path for generated wrapper file
 */
export function generateBackgroundScriptWrapper(
    context: PluginContext,
    service_worker_path: string,
    dynamicImportWrapper: DynamicImportWrapperOptions,
    chunks: OutputChunk[],
    srcDir: string,
): string {
    // Emit background script wrapper
    const wrapperScript = prepImportWrapperScript(dynamicImportWrapper);
    // Get compiled background service work script file path from chunk
    const scriptPath = getOutputFilenameFromChunk(join(srcDir, service_worker_path), chunks);
    // code file
    const source = wrapperScript.replace(
        // Path to module being loaded
        "%PATH%",
        // Fix path slashes to support Windows
        JSON.stringify(slash(scriptPath)),
    );
    // output background wrapper
    const assetId = context.emitFile({
        type: "asset",
        source,
        fileName: backgroundScriptName,
    });
    return slash(context.getFileName(assetId));
}

export function generateManifest(
    context: PluginContext,
    manifest: ChromeExtensionManifest,
) {
    const manifestJson = JSON.stringify(manifest, null, 4)
        // SMELL: is this necessary?
        .replace(/\.[jt]sx?"/g, '.js"');
    // Emit manifest.json
    context.emitFile({
        type: "asset",
        fileName: manifestName,
        source: manifestJson,
    });
}
