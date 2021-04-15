import htmlInputs from "./html-inputs";
import manifestInput from "./manifest-input";
import { browserPolyfill as b } from "./browser-polyfill";
import { validateNames as v } from "./validate-names";
import { readJSONSync } from "fs-extra";
import { join } from "path";
import { logger } from "./utils/logger";
import {
    ChromeExtensionOptions,
    ChromeExtensionPlugin,
} from "./plugin-options";
import { mixedFormat as m } from "./mixed-format";

export { simpleReloader } from "./plugin-reloader-simple";

export const chromeExtension = (
    options = {} as ChromeExtensionOptions,
): ChromeExtensionPlugin => {
    /* --------------- LOAD PACKAGE.JSON --------------- */
    try {
        const packageJsonPath = join(process.cwd(), "package.json");
        options.pkg = options.pkg || readJSONSync(packageJsonPath);
    } catch (error) { }

    /* ----------------- SETUP PLUGINS ----------------- */
    const manifest = manifestInput(options);
    const html = htmlInputs(manifest);
    const validate = v();
    const browser = b(manifest);
    const mixedFormat = m(manifest);

    /* ----------------- RETURN PLUGIN ----------------- */
    return {
        name: "chrome-extension",

        // For testing
        _plugins: { manifest, html, validate },

        async options(options) {
            try {
                const inputs = await [manifest, html].reduce(async (opts, plugin) => {
                    const result = await plugin.options.call(this, await opts);
                    return result || options;
                }, Promise.resolve(options));
                // output all input files
                logger.logInputFiles(inputs.input);
                return inputs;
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
                manifest.buildStart.call(this, options),
                html.buildStart.call(this, options),
            ]);
        },

        async resolveId(source, importer) {
            return manifest.resolveId.call(this, source, importer, {});
        },

        async load(id) {
            return manifest.load.call(this, id);
        },

        watchChange(id) {
            manifest.watchChange.call(this, id, { event: "create" });
            html.watchChange.call(this, id, { event: "create" });
        },

        async generateBundle(...args) {
            await manifest.generateBundle.call(this, ...args);
            await html.generateBundle.call(this, ...args);
            await validate.generateBundle.call(this, ...args);
            await browser.generateBundle.call(this, ...args);
            // TODO: should skip this if not needed
            await mixedFormat.generateBundle.call(this, ...args);
        },
    };
};
