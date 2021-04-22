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
import { contentScriptProcessor } from "./processors/content-script";
import { ChromeExtensionManifest } from "./manifest";
import { HtmlProcessor } from "./processors/html";

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
            if (manifestProcessor.manifest) {
                manifest = manifestProcessor.load(options);
                options.input = manifestProcessor.resolveInput(options.input);
            }
            try {
                // resolve scripts and assets in html
                options.input = htmlProcessor.resolveInput(options.input);
                logger.logInputFiles(options.input);
                return options;
            } catch (error) {
                const manifestError =
                    "The manifest must have at least one script or HTML file.";
                const htmlError =
                    "At least one HTML file must have at least one script.";
                if (
                    error.message === manifestError ||
                    error.message === htmlError
                ) {
                    throw new Error(
                        "A Chrome extension must have at least one script or HTML file.",
                    );
                } else {
                    throw error;
                }
            }
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
        watchChange(id) {
            manifest2.watchChange.call(this, id, { event: "create" });
            html2.watchChange.call(this, id, { event: "create" });
        },
        async generateBundle(options, bundle, isWrite) {
            /* ----------------- UPDATE CONTENT SCRIPTS ----------------- */
            contentScriptProcessor.regenerateBundle(bundle);
            /* ----------------- UPDATE ENTRY PATH IN MANIFEST.JSON ----------------- */
            /* ----------------- UPDATE ENTRY PATH IN MANIFEST.JSON ----------------- */
            await manifest2.generateBundle.call(this, options, bundle, isWrite);
            await html2.generateBundle.call(this, options, bundle, isWrite);
            await validate.generateBundle.call(this, options, bundle, isWrite);
        },
    };
};
