import slash from "slash";
import { OutputAsset, OutputBundle, OutputChunk, PluginContext, rollup } from "rollup";
import { removeFileExtension } from "../../common/utils";
import { ChromeExtensionManifest, ContentScript, WebAccessibleResource } from "../../manifest";
import { NormalizedChromeExtensionOptions } from "../../plugin-options";
import { findAssetByName, findChunkByName } from "../../utils/helpers";
import { contentScriptPlugin } from "./plugin";
import { updateCss } from "../../common/utils/css";

export class ContentScriptProcessor {
    constructor(private options: NormalizedChromeExtensionOptions) {}
    public async generateBundle(
        context: PluginContext,
        bundle: OutputBundle,
        manifest: ChromeExtensionManifest
    ): Promise<void> {
        for (const content_script of manifest.content_scripts || []) {
            const {js, css, ...rest} = content_script
            if (typeof js === "undefined") { continue; }
            // process related css
            js.map(name => findAssetByName(`${removeFileExtension(name)}.css`, bundle) as OutputAsset)
                .filter(asset => !!asset)
                .map(asset => {
                    const { asset: ast, resources } = updateCss(asset);
                    // add resource to web_accessible_resources
                    if (resources) {
                        const web_accessible_resources: WebAccessibleResource = {
                            resources,
                            matches: rest.matches
                        }
                        if (!manifest.web_accessible_resources) {
                            manifest.web_accessible_resources = [web_accessible_resources];
                        } else {
                            manifest.web_accessible_resources.push(web_accessible_resources);
                        }
                    }
                    return ast;
                })
                .forEach(asset => css?.push(slash(asset.fileName)));
            // mixin related js
            content_script.js = [];
            for (const jsName of js) {
                const chunk = findChunkByName(removeFileExtension(jsName), bundle);
                if (chunk) {
                    content_script.js.push(slash(await this.mixJsChunks(context, chunk, bundle)));
                }
            }
        }
    }

    private async mixJsChunks(
        context: PluginContext,
        entry: OutputChunk,
        bundle: OutputBundle
    ): Promise<string> {
        const build = await rollup({
            input: entry.fileName,
            plugins: [contentScriptPlugin(bundle)]
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
}
