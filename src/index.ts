import path from "path";
import { readJSONSync } from "fs-extra";
import { Plugin, ResolvedConfig } from "vite";
import htmlInputs from "./html-inputs";
import manifestInput from "./manifest-input";
import { logger } from "./utils/logger";
import { validateNames as v } from "./validate-names";
import { ManifestProcessor } from "./processors/manifest";
import { HtmlProcessor } from "./processors/html";
import {
    ChromeExtensionOptions,
    ChromeExtensionPlugin,
    HtmlInputsOptions,
    NormalizedChromeExtensionOptions,
} from "./plugin-options";
import { ChromeExtensionManifest } from "./manifest";
export { simpleReloader } from "./plugin-reloader-simple";

export const stubChunkName = "stub__empty-chrome-extension-manifest";
export const chromeExtensionPluginName = "chrome-extension";

export const chromeExtension = (
    options = {} as ChromeExtensionOptions,
): ChromeExtensionPlugin => {
    /* --------------- LOAD PACKAGE.JSON --------------- */
    try {
        const packageJsonPath = path.join(process.cwd(), "package.json");
        options.pkg = options.pkg || readJSONSync(packageJsonPath);
    } catch (error) { }

    /* ----------------- SETUP PLUGINS ----------------- */
    let manifestJsonPath = "";
    let manifestProcessor: ManifestProcessor;
    let viteConfig: ResolvedConfig;
    let vitePlugins: Plugin[] = [];

    /* ----------------- RETURN PLUGIN ----------------- */
    return {
        name: "chrome-extension",
        enforce: "pre",
        configResolved(config) {
            viteConfig = config;
            // resolve manifest.json path
            const rootPath = viteConfig.root || process.cwd();
            manifestJsonPath = path.resolve(rootPath, "manifest.json");
            config.build.rollupOptions.input = manifestJsonPath;
            // create manifest processor
            manifestProcessor = new ManifestProcessor({
                ...options,
                srcDir: rootPath,
                manifestPath: manifestJsonPath
            } as NormalizedChromeExtensionOptions);
        },
        options(options) {
            // backup plugins
            if (options.plugins) {
                vitePlugins = options.plugins.filter(plugin => plugin.name !== "chrome-extension");
                options.plugins = options.plugins.filter(plugin => ["alias", "commonjs", "chrome-extension"].includes(plugin.name));
            }
            return options;
        },
        transform(code, id) {
            if (id !== manifestJsonPath) { return; }
            manifestProcessor.load(JSON.parse(code));
            return "export default manifest.json";
        },
        outputOptions(options) {
            const outputFile = path.resolve(options.dir || path.resolve(process.cwd(), "dist") , "manifest.json");
            return { file: outputFile, format: "es", exports: "none", sourcemap: false };
        },
        renderChunk(_code, chunk, _options) {
            return chunk.facadeModuleId === manifestJsonPath
                ? manifestProcessor.toString()
                : null;
        },
    };
};
