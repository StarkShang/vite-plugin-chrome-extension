import { OutputBundle, PluginContext, TransformPluginContext } from "rollup";
import { resolve, parse, join } from "path";
import { existsSync, readFileSync } from "fs";
import slash from "slash";
import { ChromeExtensionManifest } from "../../manifest";
import { removeFileExtension } from "../../common/utils";
import { findChunkByName } from "../../utils/helpers";
import { mixinChunks } from "../mixin";
import { NormalizedChromeExtensionOptions } from "@root/src/plugin-options";

const dynamicImportAssetRex = /(?<=chrome.scripting.insertCSS\()[\s\S]*?(?=\))/gm;
const dynamicImportScriptRex = /(?<=chrome.scripting.executeScript\()[\s\S]*?(?=\))/gm;

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
        /* ----------------- PROCESS DYNAMICALLY IMPORTED ASSETS -----------------*/
        code.match(dynamicImportAssetRex)
            ?.map(m => m.match(/(?<=(files:\[)?\")[\s\S]*?(?=\]?\")/gm))
            .reduce((f, m) => f.concat(...(m || [])) || [], [] as string[])
            .map(m => { console.log("resolveDynamicImports", m); return m; })
            .forEach(m => {
                const filePath = resolve(this.options.srcDir!, m);
                if (existsSync(filePath)) {
                    context.emitFile({
                        type: "asset",
                        fileName: m,
                        source: readFileSync(filePath),
                    })
                }
            });
        /* ----------------- PROCESS DYNAMICALLY IMPORTED SCRIPTS -----------------*/
        // dynamicImports collects files used by chrome.scripting.executeScript
        const dynamicImports: string[] = [];
        const updatedCode = code.replace(
            dynamicImportScriptRex,
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
                manifest.background.service_worker = slash(await mixinChunks(context, chunk, bundle));
            }
        }
    }
}
