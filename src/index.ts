import { join } from "path";
import { readJSONSync } from "fs-extra";
import { rollup } from "rollup";
import { ResolvedConfig } from "vite";
import htmlInputs from "./html-inputs";
import manifestInput from "./manifest-input";
import { logger } from "./utils/logger";
import { browserPolyfill as b } from "./browser-polyfill";
import { validateNames as v } from "./validate-names";
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
    let entries: string[] = [];
    let viteConfig: ResolvedConfig;

    /* ----------------- RETURN PLUGIN ----------------- */
    return {
        name: "chrome-extension",

        // For testing
        _plugins: { manifest, html, validate },

        configResolved(config) {
            viteConfig = config;
        },

        async options(options) {
            try {
                entries = Object.values((await [manifest, html].reduce(async (opts, plugin) => {
                    const result = await plugin.options.call(this, await opts);
                    return result || options;
                }, Promise.resolve(options))).input || {});
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

        async generateBundle(options, bundle, isWrite) {
            // output all input files
            logger.logInputFiles(entries);
            const plugins = [...viteConfig.plugins as Plugin[]].filter(plugin => plugin.name !== "chrome-extension");
            await Promise.all(entries.map(async entry => {
                const build = await rollup({
                    ...viteConfig.build.rollupOptions,
                    input: entry,
                    preserveEntrySignatures: "strict",
                    plugins: plugins,
                });
                const output = await build.write({ format: "iife", dir: viteConfig.build.outDir });
                return output;
            }));
            // await manifest.generateBundle.call(this, ...args);
            // await html.generateBundle.call(this, ...args);
            // await validate.generateBundle.call(this, ...args);
            // await browser.generateBundle.call(this, ...args);
            // // TODO: should skip this if not needed
            // await mixedFormat.generateBundle.call(this, ...args);
        },
    };
};
