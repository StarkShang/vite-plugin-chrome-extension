import { OutputBundle, PluginContext, RollupWatcher, TransformPluginContext } from "rollup";
import { resolve, parse, join } from "path";
import { existsSync, readFileSync } from "fs";
import slash from "slash";
import { ChromeExtensionManifest } from "../../manifest";
import { removeFileExtension } from "../../common/utils";
import { findChunkByName } from "../../utils/helpers";
import { mixinChunksForIIFE } from "../mixin";
import { NormalizedChromeExtensionOptions } from "@/configs/options";
import vite from "vite";
import { EventEmitter } from "events";
import { IComponentProcessor } from "../common";

const dynamicImportAssetRex = /(?<=chrome.scripting.insertCSS\()[\s\S]*?(?=\))/gm;
const dynamicImportScriptRex = /(?<=chrome.scripting.executeScript\()[\s\S]*?(?=\))/gm;

export interface BackgroundDynamicImport {
    code: string;
    imports: string[];
}

export class BackgroundProcesser implements IComponentProcessor {
    private entryPath = "";
    private watcher: RollupWatcher | null = null;
    constructor(private options: NormalizedChromeExtensionOptions) {}

    public async resolve(entryPath: string) {
        this.entryPath = entryPath;
        return await this.build();
    }

    public async stop() {
        this.watcher?.close();
        this.watcher = null;
    }

    public async build(): Promise<string> {
        return new Promise(resolve => {
            // stop previous watcher
            this.stop();
            vite.build({
                build: {
                    rollupOptions: {
                        input: this.entryPath,
                    },
                    emptyOutDir: false,
                    watch: this.options.watch
                        ? { clearScreen: true }
                        : null,
                },
                plugins: [{
                    name: "test",
                    generateBundle(_options, bundle, _isWrite) {
                        const entry = Object.entries(bundle)
                            .find(entry => entry[1].type === "chunk" && entry[1].isEntry);
                        resolve(entry ? entry[0] : "");
                    },
                }],
                configFile: false, // must set to false, to avoid load config from vite.config.ts
            }).then(output => {
                if (output instanceof EventEmitter) {
                    const watcher = output as RollupWatcher;
                    this.watcher = watcher;
                }
            });
        });
    }

    public resolveDynamicImports(context: TransformPluginContext, code: string): BackgroundDynamicImport {
        if (!this.options.rootPath) {
            throw new TypeError("BackgroundProcesser: options.srcDir is not initialized");
        }
        /* ----------------- PROCESS DYNAMICALLY IMPORTED ASSETS -----------------*/
        code.match(dynamicImportAssetRex)
            ?.map(m => m.match(/(?<=(files:\[)?\")[\s\S]*?(?=\]?\")/gm))
            .reduce((f, m) => f.concat(...(m || [])) || [], [] as string[])
            .map(m => { console.log("resolveDynamicImports", m); return m; })
            .forEach(m => {
                const filePath = resolve(this.options.rootPath!, m);
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
                const filePath = resolve(this.options.rootPath!, file.dir, file.base);
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
