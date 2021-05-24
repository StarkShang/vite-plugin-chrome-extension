import { Plugin } from "vite";
import { ChromeExtensionManifest } from "../manifest";
import { BackgroundProcessorOptions } from "../processors/background/processor";
import { ContentScriptProcessorOptions } from "../processors/content-script/processor";
import { PopupProcessorOptions } from "../processors/popup/processor";
import { OptionsProcessorOptions } from "../processors/options/processor";
import { DevtoolsProcessorOptions } from "../processors/devtools/processor";
import { OverrideBookmarksProcessorOptions, OverrideHistoryProcessorOptions, OverrideNewtabProcessorOptions } from "../processors/override/processor";
import { StandaloneProcessorOptions } from "../processors/standalone/processor";

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
    };
}

export interface NormalizedChromeExtensionOptions extends ChromeExtensionOptions {
    rootPath: string;
    manifestPath: string;
    watch: boolean;
}
