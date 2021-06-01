import path from "path";
import { readJSONSync } from "fs-extra";
import { ConfigEnv, ResolvedConfig, UserConfig } from "vite";
import { ManifestProcessor } from "./modules/manifest";
import { ChromeExtensionPlugin } from "./plugin-options";
import { ChromeExtensionOptions } from "@/configs/options";
import { NormalizedOutputOptions, OutputOptions, RenderedChunk } from "rollup";
import { ManifestProcessorOptions } from "./modules/manifest/option";
export const stubChunkName = "stub__empty-chrome-extension-manifest";
export const chromeExtensionPluginName = "chrome-extension";

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
        configResolved(config: ResolvedConfig) {
            viteConfig = config;
            // resolve manifest.json path
            const manifestJsonPath = path.resolve(config.root, "manifest.json");
            // create manifest processor
            manifestProcessor = new ManifestProcessor({
                root:  config.root,
                outDir: config.build.outDir,
                alias: config.resolve.alias,
                extendManifest: options.extendManifest,
                components: options.components,
            } as ManifestProcessorOptions);
            manifestProcessor.filePath = manifestJsonPath;
            // override input file path
            config.build.rollupOptions.input = manifestProcessor.filePath;
        },
        options(options) {
            if (options.plugins) {
                options.plugins = options.plugins.filter(plugin => ["alias", "commonjs", "chrome-extension"].includes(plugin.name));
            }
            return options;
        },
        async transform(code, id) {
            // main logic for resolve entries here
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
        outputOptions(options: OutputOptions): OutputOptions {
            const outputFile = path.resolve(options.dir || path.join(process.cwd(), "dist") , "manifest.json");
            return { file: outputFile, format: "es", exports: "none", sourcemap: false };
        },
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
