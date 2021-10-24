import "@/common/utils/prototype";
import path from "path";
import slash from "slash";
import { readJSONSync } from "fs-extra";
import { ConfigEnv, ResolvedConfig, UserConfig } from "vite";
import { ManifestProcessor, ManifestProcessorOptions } from "./modules/manifest";
import { ChromeExtensionPlugin } from "@/common/types";
import { ChromeExtensionOptions } from "@/configs/options";
import { NormalizedOutputOptions, OutputOptions, RenderedChunk } from "rollup";
export const stubChunkName = "stub__empty-chrome-extension-manifest";
export const chromeExtensionPluginName = "chrome-extension";

// The main process will only parse and update manifest.json
// The bundle logic for each entry excuted in its own processor
export const chromeExtension = (
    options = {} as ChromeExtensionOptions,
): ChromeExtensionPlugin => {
    /* ----------------- PREPARE PLUGIN ----------------- */
    // load package.json
    options.pkg = options.pkg || loadPackageJson();
    let viteConfig: ResolvedConfig;
    let manifestProcessor : ManifestProcessor;
    /* ----------------- RETURN PLUGIN ----------------- */
    return {
        name: chromeExtensionPluginName,
        enforce: "pre",
        // set default root path to src
        config(config: UserConfig, env: ConfigEnv) {
            return config.root ? null : {
                root: "src",
                build: {
                    outDir: "../dist",
                    emptyOutDir: true,
                },
            };
        },
        // create and initialize ManifestProcessor
        configResolved(config: ResolvedConfig) {
            viteConfig = config;
            // resolve manifest.json path
            const manifestJsonPath = path.resolve(config.root, "manifest.json");
            // normalize source directory path
            const sourcePath = slash(config.root);
            // normalize output directory path
            const outputPath = path.isAbsolute(config.build.outDir)
                ? slash(config.build.outDir)
                : slash(path.resolve(config.root, config.build.outDir));
            // create manifest processor
            manifestProcessor = new ManifestProcessor({
                root:  sourcePath,
                outDir: outputPath,
                alias: config.resolve.alias,
                extendManifest: options.extendManifest,
                components: options.components,
            } as ManifestProcessorOptions);
            manifestProcessor.filePath = manifestJsonPath;
            // override input file path
            // using manifest.json as input
            config.build.rollupOptions.input = manifestProcessor.filePath;
        },
        // clear default plugins added by vite
        // only alias, commonjs, and chrome-extension is left
        options(options) {
            if (options.plugins) {
                options.plugins = options.plugins.filter(plugin => ["alias", "commonjs", "chrome-extension"].includes(plugin.name));
            }
            return options;
        },
        async transform(code, _id) {
            // main logic for resolve entries here
            // manifestProcessor resolve paths of files needed watch
            const modules = await manifestProcessor.resolve(JSON.parse(code));
            // add files need to be watched
            // need not remove unused file because rollup will automatically remove them
            if (viteConfig.build.watch) {
                modules.forEach(module => {
                    this.addWatchFile(module);
                });
            }
            return "console.log('chrome-extension')"; // eliminate warning for empty chunk
        },
        // clear cache of changed file
        watchChange(id) {
            manifestProcessor.clearCacheById(id);
        },
        outputOptions(options: OutputOptions): OutputOptions {
            const outputFile = path.resolve(options.dir || path.join(process.cwd(), "dist") , "manifest.json");
            return { file: outputFile, format: "es", exports: "none", sourcemap: false };
        },
        // generate new manifest json content
        async renderChunk(_code: string, chunk: RenderedChunk, _options: NormalizedOutputOptions) {
            if (chunk.facadeModuleId === manifestProcessor.filePath) {
                await manifestProcessor.build();
                return { code: manifestProcessor.toString() };
            }
            return null;
        },
    };
};

function loadPackageJson() {
    try {
        const packageJsonPath = path.join(process.cwd(), "package.json");
        return readJSONSync(packageJsonPath);
    } catch (error) {
        return undefined;
    }
}
