import { ChromeExtensionManifest } from "@/manifest";
import { AliasOptions } from "vite";
import { BackgroundProcessorOptions } from "../background";
import { ContentScriptProcessorOptions } from "../content-script";
import { DevtoolsProcessorOptions } from "../devtools";
import { OptionsProcessorOptions } from "../options";
import { OverrideBookmarksProcessorOptions, OverrideHistoryProcessorOptions, OverrideNewtabProcessorOptions } from "../override";
import { PopupProcessorOptions } from "../popup";
import { StandaloneProcessorOptions } from "../standalone/processor";
import { WebAccessibleResourceProcessorOptions } from "../web-accessible-resource";

export interface ManifestProcessorOptions {
    root: string;
    outDir: string;
    alias:  AliasOptions;
    extendManifest?: Partial<ChromeExtensionManifest> | ((manifest: ChromeExtensionManifest) => ChromeExtensionManifest);
    components?: {
        background?: boolean | BackgroundProcessorOptions,
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

export const DefaultManifestProcessorOptions: ManifestProcessorOptions = {
    root: "",
    outDir: "",
    alias: [],
    components: {
        background: true,
        contentScripts: true,
        popup: true,
        options: true,
        override: true,
        devtools: true,
        standalone: true,
        webAccessibleResources: true,
    },
};
