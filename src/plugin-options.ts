import { PluginHooks, ModuleFormat } from "rollup";
import { Plugin } from "vite";
import { DynamicImportWrapperOptions } from "./manifest-input/dynamicImportWrapper";
import { ChromeExtensionManifest } from "./manifest";
import { CheerioFile } from "./html-inputs/cheerio";

/* -------------- MAIN PLUGIN OPTIONS -------------- */

export interface ChromeExtensionOptions {
    browserPolyfill?:
    | boolean
    | {
        executeScript: boolean
    }
    contentScriptWrapper?: boolean
    // TODO: use this option with iifeJsonPaths to enable a preset to support Firefox builds
    crossBrowser?: boolean
    dynamicImportWrapper?: DynamicImportWrapperOptions | false
    extendManifest?:
    | Partial<ChromeExtensionManifest>
    | ((
        manifest: ChromeExtensionManifest,
    ) => ChromeExtensionManifest)
    firstClassManifest?: boolean
    iifeJsonPaths?: string[]
    pkg?: {
        description: string
        name: string
        version: string
    }
    publicKey?: string
    verbose?: boolean
}

export type ChromeExtensionPlugin = Pick<
    Required<Plugin>,
    | "name"
    | "enforce"
    | "options"
    | "configResolved"
    | "transform"
    | "outputOptions"
    | "renderChunk"
>

/* --------- MANIFEST INPUT PLUGIN OPTIONS --------- */

export interface ManifestInputPluginOptions
    extends ChromeExtensionOptions {
    cache?: ManifestInputPluginCache
}

export interface ManifestInputPluginCache {
    assets: string[]
    iife: string[]
    input: string[]
    inputAry: string[]
    inputObj: Record<string, string>
    permsHash: string
    srcDir: string | null;
    dynamicImportContentScripts: string[];
    /** for memoized fs.readFile */
    readFile: Map<string, any>
    manifest?: ChromeExtensionManifest
    assetChanged: boolean
}

type ManifestInputPluginHooks =
    | "options"
    | "generateBundle"

export type ManifestInputPlugin = Pick<
    PluginHooks,
    ManifestInputPluginHooks
> & {
    name: string
    srcDir: string | null
    browserPolyfill?: ChromeExtensionOptions["browserPolyfill"]
    crossBrowser?: ChromeExtensionOptions["crossBrowser"]
    formatMap?: Partial<
        Record<ModuleFormat, string[] | Record<string, string>>
    >
}

/* ----------- HTML INPUTS PLUGIN OPTIONS ---------- */

export interface HtmlInputsOptions {
    browserPolyfill?: ChromeExtensionOptions["browserPolyfill"]
    /** This will change between builds, so cannot destructure */
    readonly srcDir: string | null
}

export interface HtmlInputsPluginCache {
    /** Scripts that should not be bundled */
    scripts: string[]
    /** Scripts that should be bundled */
    js: string[]
    /** Absolute paths for HTML files to emit */
    html: string[]
    /** Html files as Cheerio objects */
    html$: CheerioFile[]
    /** Image files to emit */
    img: string[]
    /** Stylesheets to emit */
    css: string[]
    /** Cache of last options.input, will have other scripts */
    input: string[]
    /** Source dir for calculating relative paths */
    srcDir?: string
}

type HtmlInputsPluginHooks =
    | "name"
    | "generateBundle"

export type HtmlInputsPlugin = Pick<
    Required<Plugin>,
    HtmlInputsPluginHooks
> & { cache: HtmlInputsPluginCache }
