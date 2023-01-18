import { join } from "path";
import { readJSONSync } from "fs-extra";
import { ResolvedConfig } from "vite";
import htmlInputs from "./html-inputs";
import manifestInput from "./manifest-input";
import { logger } from "./utils/logger";
import { validateNames as v } from "./validate-names";
import {
    ChromeExtensionOptions,
    ChromeExtensionPlugin,
    HtmlInputsOptions,
    NormalizedChromeExtensionOptions,
} from "./plugin-options";
import { ManifestProcessor } from "./processors/manifest";
import { ChromeExtensionManifest } from "./manifest";
import { HtmlProcessor } from "./processors/html";
import slash from "slash";

export { simpleReloader } from "./plugin-reloader-simple";

export const stubChunkName = "stub__empty-chrome-extension-manifest";

export const chromeExtension = (
    options = {} as ChromeExtensionOptions,
): ChromeExtensionPlugin => {
    /* --------------- LOAD PACKAGE.JSON --------------- */
    try {
        const packageJsonPath = join(process.cwd(), "package.json");
        options.pkg = options.pkg || readJSONSync(packageJsonPath);
    } catch (error) { }

    /* ----------------- SETUP PLUGINS ----------------- */
    const normalizedOptions = { ...options } as NormalizedChromeExtensionOptions;
    const manifest2 = manifestInput(options);
    const html2 = htmlInputs(normalizedOptions as HtmlInputsOptions);
    const manifestProcessor = new ManifestProcessor(normalizedOptions);
    const htmlProcessor = new HtmlProcessor(normalizedOptions);
    const validate = v();
    let manifest: ChromeExtensionManifest | undefined;
    let viteConfig: ResolvedConfig;
    let isBuilded = false;

    /* ----------------- RETURN PLUGIN ----------------- */
    return {
        name: "chrome-extension",
        // For testing
        _plugins: { manifest: manifest2, html: html2, validate },
        configResolved(config) {
            viteConfig = config;
        },
        async options(options) {
            // Do not reload manifest without changes
            if (!manifestProcessor.manifest) {
                manifest = manifestProcessor.load(options);
                options.input = manifestProcessor.resolveInput(options.input);
            }
            // Rebuild input if the function is executed more than one time (watch mode)
            if(manifestProcessor.manifest && isBuilded) {
                options.input = manifestProcessor.resolveInput(options.input);
            }
            // resolve scripts and assets in html
            options.input = htmlProcessor.resolveInput(options.input);
            logger.logInputFiles(options.input);
            return options;
        },
        async buildStart() {
            manifestProcessor.addWatchFiles(this);
            htmlProcessor.addWatchFiles(this);
            await manifestProcessor.emitFiles(this);
            await htmlProcessor.emitFiles(this);
        },
        resolveId(source) {
            if (source === stubChunkName) {
                return source;
            }
            return null;
        },
        load(id) {
            if (id === stubChunkName) {
                return { code: `console.log("${stubChunkName}")` };
            }
            return null;
        },
        transform(code, id, ssr) {
            return manifestProcessor.transform(this, code, id, ssr);
        },
        watchChange(id) {
            manifestProcessor.clearCacheById(id);
            htmlProcessor.clearCacheById(id);
        },
        resolveFileUrl({ referenceId, fileName }) {
            if (manifestProcessor.isDynamicImportedContentScript(referenceId)) {
                return `"${slash(fileName)}"`;
            }
            return null;
        },
        outputOptions(options) {
            return {
                ...options,
                chunkFileNames: "[name].[hash].js",
                assetFileNames: "[name].[hash].[ext]",
                entryFileNames: "[name].js"
            };
        },
        async generateBundle(options, bundle, isWrite) {
            await manifestProcessor.generateBundle(this, bundle);
            await htmlProcessor.generateBundle(this, bundle);
            // await validate.generateBundle.call(this, options, bundle, isWrite);
        },
    };
};
