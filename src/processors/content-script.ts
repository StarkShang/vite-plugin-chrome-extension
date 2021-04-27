import { resolve } from "path";
import { OutputBundle, PluginContext, RenderedModule } from "rollup";
import { ContentScript } from "../manifest";
import { NormalizedChromeExtensionOptions } from "../plugin-options";
import { getAssets, getChunk } from "../utils/bundle";
import { findChunk } from "../utils/helpers";

export class ContentScriptProcessor {
    constructor(private options: NormalizedChromeExtensionOptions) {}
    generateBundle(
        context: PluginContext,
        bundle: OutputBundle,
        content_scripts: ContentScript[]
    ): ContentScript[] {
        const chunks = getChunk(bundle);
        const assets = getAssets(bundle);
        console.log(Object.keys(chunks).reduce((result, key) => {
            result[key] = {...chunks[key], code: ""}; return result; }, {} as any));
        console.log(Object.keys(assets).reduce((result, key) => {
            result[key] = {...assets[key], source: ""}; return result; }, {} as any));
        content_scripts.map(scripts => {
            scripts.js?.forEach(script => {
                const chunk = findChunk(resolve(this.options.srcDir!, script), chunks);
                const chunkModules = ({...chunk, code: ""}).modules as { [id: string]: RenderedModule };
                Object.keys(chunkModules).forEach(key => {
                    console.log({...chunkModules[key], code: "" });
                });
            })
        })
        return [];
    }
}
