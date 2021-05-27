import { OutputAsset, OutputChunk } from "rollup";

export interface OutputChunkBundle {
    [fileName: string]: OutputChunk;
}
export interface OutputAssetBundle {
    [fileName: string]: OutputAsset;
}

export class BundleMapping {
    public entry = "";
    public bundle = "";
    public modules: string[] = [];
    public static get Empty() { return new BundleMapping(); }
}

export type ChromeExtensionManifestEntryType =
    | "background"
    | "content-script"
    | "options"
    | "popup"
    | "bookmarks"
    | "history"
    | "newtab"
    | "devtools"
    | "web-accessible-resource";

export type ChromeExtensionManifestEntries = {
    [type in Exclude<ChromeExtensionManifestEntryType, "content-script" | "web-accessible-resource">]?: ChromeExtensionModule;
} & {
    "content-script"?: ChromeExtensionModule[];
    "web-accessible-resource"?: ChromeExtensionModule[];
}

export class ChromeExtensionModule {
    public entry = "";
    public bundle = "";
    public dependencies: string[] = [];

    public static get Empty() {
        return new ChromeExtensionModule();
    }
}

export interface MarkableChromeExtensionModule extends ChromeExtensionModule {
    visited: boolean;
}
