import { join, relative, resolve, dirname } from "path";
import { readJSONSync } from "fs-extra";
import { rollup } from "rollup";
import { ResolvedConfig } from "vite";
import htmlInputs from "./html-inputs";
import manifestInput from "./manifest-input";
import { logger } from "./utils/logger";
import { validateNames as v } from "./validate-names";
import {
    ChromeExtensionOptions,
    ChromeExtensionPlugin,
} from "./plugin-options";
import { isChunk } from "./utils/helpers";

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
    const manifest = manifestInput(options);
    const html = htmlInputs(manifest);
    const validate = v();
    let entries: string[] = [];
    let viteConfig: ResolvedConfig;
    let sourcePath = "";

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
                if (options.input && typeof options.input === "string") {
                    sourcePath = dirname(resolve(viteConfig.root, options.input));
                }
                // add stub input
                options.input = stubChunkName;
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
            manifest.watchChange.call(this, id, { event: "create" });
            html.watchChange.call(this, id, { event: "create" });
        },

        async generateBundle(options, bundle, isWrite) {
            /* ----------------- CLEAN UP STUB ----------------- */
            const stubChunkKey = Object.keys(bundle).find(key => key.includes(stubChunkName));
            if (stubChunkKey) {
                delete bundle[stubChunkKey];
            }
            /* ----------------- GENERATE BUNDLES FOR ALL ENTRIES ----------------- */
            logger.logInputFiles(entries);
            const plugins = [...viteConfig.plugins as Plugin[]].filter(plugin => plugin.name !== "chrome-extension");
            const outputs = await Promise.all(entries.map(async entry => {
                const build = await rollup({
                    ...viteConfig.build.rollupOptions,
                    input: entry,
                    preserveEntrySignatures: "strict",
                    plugins: plugins,
                });
                const { output } = await build.generate({ format: "iife", dir: viteConfig.build.outDir });
                return output;
            }));
            outputs.reduce((b, outs) => {
                outs.forEach(o => {
                    if (isChunk(o) && o.facadeModuleId) {
                        const filePath = relative(sourcePath, resolve(dirname(o.facadeModuleId), o.fileName));
                        o.fileName = filePath;
                        b[filePath] = o;
                    } else {
                        b[o.fileName] = o;
                    }
                });
                return b;
            }, bundle);
            /* ----------------- UPDATE ENTRY PATH IN MANIFEST.JSON ----------------- */
            await manifest.generateBundle.call(this, options, bundle, isWrite);
            await html.generateBundle.call(this, options, bundle, isWrite);
            await validate.generateBundle.call(this, options, bundle, isWrite);
        },
    };
};
