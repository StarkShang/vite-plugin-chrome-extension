import { Plugin } from "vite";
import { ChromeExtensionManifest } from "../manifest";

export interface ChromeExtensionComponentOptions {
    plugins?: Plugin[];
}

export interface ChromeExtensionOptions {
    browserPolyfill?:
    | boolean
    | { executeScript: boolean}
    pkg?: {
        description: string
        name: string
        version: string
    }
    extendManifest?:
    | Partial<ChromeExtensionManifest>
    | ((manifest: ChromeExtensionManifest) => ChromeExtensionManifest)
    components?: {
        background?: true | ChromeExtensionComponentOptions,
        popup?: true | ChromeExtensionComponentOptions,
        options?: true | ChromeExtensionComponentOptions,
        contentScripts?: true | ChromeExtensionComponentOptions,
        override?: true | ChromeExtensionComponentOptions,
        standalone?: true | ChromeExtensionComponentOptions,
        devtools?: true | ChromeExtensionComponentOptions,
    };
}

export interface NormalizedChromeExtensionOptions extends ChromeExtensionOptions {
    rootPath?: string;
    manifestPath?: string;
}
