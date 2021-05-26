import { type } from "node:os";
import { OutputAsset, OutputChunk } from "rollup";

export interface OutputChunkBundle {
    [fileName: string]: OutputChunk;
}
export interface OutputAssetBundle {
    [fileName: string]: OutputAsset;
}

export class BundleMapping {
    public module = "";
    public bundle = "";

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
    [type in Exclude<ChromeExtensionManifestEntryType, "content-script" | "web-accessible-resource">]?: BundleMapping;
} & {
    "content-script"?: BundleMapping[];
    "web-accessible-resource"?: BundleMapping[];
}
