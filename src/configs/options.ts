import { Plugin } from "vite";
import { ChromeExtensionManifest } from "../manifest";

export interface ChromeExtensionComponentOptions {
    plugins?: Plugin[];
}

export interface ChromeExtensionOptions {
    browserPolyfill?: boolean | { executeScript: boolean };
    pkg?: { description: string, name: string, version: string };
    extendManifest?: Partial<ChromeExtensionManifest> | ((manifest: ChromeExtensionManifest) => ChromeExtensionManifest);
    components?: {
        background?: boolean | ChromeExtensionComponentOptions,
        popup?: boolean | ChromeExtensionComponentOptions,
        options?: boolean | ChromeExtensionComponentOptions,
        contentScripts?: boolean | ChromeExtensionComponentOptions,
        override?: boolean | ChromeExtensionComponentOptions,
        standalone?: boolean | ChromeExtensionComponentOptions,
        devtools?: boolean | ChromeExtensionComponentOptions,
    };
}

export interface NormalizedChromeExtensionOptions extends ChromeExtensionOptions {
    rootPath: string;
    manifestPath: string;
    watch: boolean;
}
