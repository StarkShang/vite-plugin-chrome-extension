import { Plugin } from "vite";
import { ChromeExtensionManifest } from "../manifest";
import { BackgroundProcessorOptions } from "../modules/background/processor";
import { ContentScriptProcessorOptions } from "../modules/content-script/processor";
import { PopupProcessorOptions } from "../modules/popup/processor";
import { OptionsProcessorOptions } from "../modules/options/processor";
import { DevtoolsProcessorOptions } from "../modules/devtools/processor";
import { OverrideBookmarksProcessorOptions, OverrideHistoryProcessorOptions, OverrideNewtabProcessorOptions } from "../modules/override/processor";
import { StandaloneProcessorOptions } from "../modules/standalone/processor";
import { WebAccessibleResourceProcessorOptions } from "@/modules/web-accessible-resource/processor";

export interface ChromeExtensionComponentOptions {
    plugins?: Plugin[];
}

export interface ChromeExtensionOptions {
    browserPolyfill?: boolean | { executeScript: boolean };
    pkg?: { description: string, name: string, version: string };
    extendManifest?: Partial<ChromeExtensionManifest> | ((manifest: ChromeExtensionManifest) => ChromeExtensionManifest);
    components?: {
        background?: false | BackgroundProcessorOptions,
        contentScripts?: boolean | ContentScriptProcessorOptions,
        popup?: boolean | PopupProcessorOptions,
        options?: boolean | OptionsProcessorOptions,
        override?: boolean | {
            bookmarks?: boolean | OverrideBookmarksProcessorOptions,
            history?: boolean | OverrideHistoryProcessorOptions,
            newtab?: boolean | OverrideNewtabProcessorOptions,
        },
        devtools?: boolean | DevtoolsProcessorOptions,
        standalone?: boolean | StandaloneProcessorOptions,
        webAccessibleResources?: boolean | WebAccessibleResourceProcessorOptions,
    };
}

export interface NormalizedChromeExtensionOptions extends ChromeExtensionOptions {
    rootPath: string;
    manifestPath: string;
    watch: boolean;
}
