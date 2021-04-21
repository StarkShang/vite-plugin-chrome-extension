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
} from "./plugin-options";
import { ManifestProcessor } from "./processors/manifest";
import { contentScriptProcessor } from "./processors/content-script";
import { ChromeExtensionManifest } from "./manifest";

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
    const manifest2 = manifestInput(options);
    const manifestProcessor = new ManifestProcessor();
    const html = htmlInputs(manifest2);
    const validate = v();
    let manifest: ChromeExtensionManifest | undefined;
    let viteConfig: ResolvedConfig;

    /* ----------------- RETURN PLUGIN ----------------- */
    return {
        name: "chrome-extension",

        // For testing
        _plugins: { manifest: manifest2, html, validate },

        configResolved(config) {
            viteConfig = config;
        },

        async options(options) {
            manifest = manifestProcessor.load(options.input);
            try {
                options.input = manifestProcessor.resolveInput(options.input);
                const newOptions = await html.options.call(this, options);
                logger.logInputFiles(newOptions?.input);
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

        async buildStart(options) {
            await Promise.all([
                manifest2.buildStart.call(this, options),
                html.buildStart.call(this, options),
            ]);
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
            html.watchChange.call(this, id, { event: "create" });
        },

        async generateBundle(options, bundle, isWrite) {
            /* ----------------- UPDATE CONTENT SCRIPTS ----------------- */
            contentScriptProcessor.regenerateBundle(bundle);
            /* ----------------- UPDATE ENTRY PATH IN MANIFEST.JSON ----------------- */
            /* ----------------- UPDATE ENTRY PATH IN MANIFEST.JSON ----------------- */
            await manifest2.generateBundle.call(this, options, bundle, isWrite);
            await html.generateBundle.call(this, options, bundle, isWrite);
            await validate.generateBundle.call(this, options, bundle, isWrite);
        },
    };
};
