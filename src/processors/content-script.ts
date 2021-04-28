import { OutputBundle, PluginContext } from "rollup";
import slash from "slash";
import { removeFileExtension } from "../common/utils";
import { ContentScript } from "../manifest";
import { NormalizedChromeExtensionOptions } from "../plugin-options";
import { findAssetByName, findChunkByName } from "../utils/helpers";

export class ContentScriptProcessor {
    constructor(private options: NormalizedChromeExtensionOptions) {}
    generateBundle(
        context: PluginContext,
        bundle: OutputBundle,
        content_scripts: ContentScript[]
    ): ContentScript[] {
        return content_scripts.map(({js, css, ...rest}) => typeof js === "undefined"
            ? { css, ...rest }
            : {
                js: js
                    .map(name => findChunkByName(removeFileExtension(name), bundle)?.fileName as string)
                    .filter(filename => !!filename)
                    .map(p => slash(p)),
                css: [
                    ...js.map(name => findAssetByName(`${removeFileExtension(name)}.css`, bundle)?.fileName as string)
                        .filter(filename => !!filename)
                        .map(p => slash(p)),
                    ...(css || [])
                ],
                ...rest,
            });
    }
}
