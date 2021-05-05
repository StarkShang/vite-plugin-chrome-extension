import { OutputBundle, PluginContext, TransformPluginContext } from "rollup";
import { resolve, parse, join } from "path";
import { existsSync } from "fs";
import slash from "slash";
import { ChromeExtensionManifest } from "../../manifest";
import { removeFileExtension } from "../../common/utils";
import { findChunkByName } from "../../utils/helpers";
import { mixinChunksForIIFE } from "../mixin";
import { NormalizedChromeExtensionOptions } from "@root/src/plugin-options";

const dynamicImportsRex = /(?<=chrome.scripting.executeScript\()[\s\S]*?(?=\))/gm;

export interface BackgroundDynamicImport {
    code: string;
    imports: string[];
}

export class BackgroundProcesser {
    constructor(private options: NormalizedChromeExtensionOptions) {}

    public resolveDynamicImports(context: TransformPluginContext, code: string): BackgroundDynamicImport {
        if (!this.options.srcDir) {
            throw new TypeError("BackgroundProcesser: options.srcDir is not initialized");
        }
        // dynamicImports collects files used by chrome.scripting.executeScript
        const dynamicImports: string[] = [];
        const updatedCode = code.replace(
            dynamicImportsRex,
            match => match.replace(/(?<=(files:\[)?)\"[\s\S]*?\"(?=\]?)/gm, fileStr => {
                const file = parse(fileStr.replace(/\"/g, "").trim());
                const filePath = resolve(this.options.srcDir!, file.dir, file.base);
                if (existsSync(filePath)) {
                    const referenceId = context.emitFile({
                        id: filePath,
                        type: "chunk",
                        name: join(file.dir, file.name)
                    });
                    dynamicImports.push(referenceId);
                    return `import.meta.ROLLUP_FILE_URL_${referenceId}`;
                } else {
                    return fileStr;
                }
            })
        );
        return { code: updatedCode, imports: dynamicImports };
    }

    public async generateBundle(
        context: PluginContext,
        bundle: OutputBundle,
        manifest: ChromeExtensionManifest
    ): Promise<void> {
        if (manifest.background?.service_worker) {
            // make background chunk output in the same directory as manifest.json
            const chunk = findChunkByName(removeFileExtension(manifest.background.service_worker), bundle);
            if (chunk) {
                // mixin all dependent chunks
                // change background chunk output in the same directory as manifest.json
                chunk.fileName = chunk.fileName.replace(/assets\//, "");
                manifest.background.service_worker = slash(await mixinChunksForIIFE(context, chunk, bundle));
            }
        }
    }
}
