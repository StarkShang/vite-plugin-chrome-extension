import path from "path";
import { readJSONSync } from "fs-extra";
import { ResolvedConfig } from "vite";
import { ManifestProcessor } from "./modules/manifest";
import { ChromeExtensionPlugin } from "./plugin-options";
import { ChromeExtensionOptions, NormalizedChromeExtensionOptions } from "@/configs/options";
import { NormalizedOutputOptions, OutputOptions, RenderedChunk } from "rollup";
export { simpleReloader } from "./plugin-reloader-simple";
export const stubChunkName = "stub__empty-chrome-extension-manifest";
export const chromeExtensionPluginName = "chrome-extension";

export const chromeExtension = (
    options = {} as ChromeExtensionOptions,
): ChromeExtensionPlugin => {
    /* ----------------- PREPARE PLUGIN ----------------- */
    // load package.json
    options.pkg = options.pkg || loadPackageJson();
    const manifestProcessor = new ManifestProcessor(options as NormalizedChromeExtensionOptions);
    /* ----------------- RETURN PLUGIN ----------------- */
    return {
        name: chromeExtensionPluginName,
        enforce: "pre",
        configResolved(config: ResolvedConfig) {
            // resolve manifest.json path
            const rootPath = path.join(config.root || process.cwd(), "src");
            const manifestJsonPath = path.resolve(rootPath, "manifest.json");
            // update plugin options
            (options as NormalizedChromeExtensionOptions).rootPath = rootPath;
            (options as NormalizedChromeExtensionOptions).manifestPath = manifestJsonPath;
            (options as NormalizedChromeExtensionOptions).watch = !!config.build.watch;
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
            // main logic here
            await manifestProcessor.resolve(JSON.parse(code));
            return "console.log('chrome-extension')"; // eliminate warning for empty chunk
        },
        outputOptions(options: OutputOptions): OutputOptions {
            const outputFile = path.resolve(options.dir || path.join(process.cwd(), "dist") , "manifest.json");
            return { file: outputFile, format: "es", exports: "none", sourcemap: false };
        },
        async renderChunk(_code: string, chunk: RenderedChunk, _options: NormalizedOutputOptions) {
            if (chunk.facadeModuleId === manifestProcessor.filePath) {
                // build components
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
