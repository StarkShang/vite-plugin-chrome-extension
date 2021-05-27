import { ChromeExtensionManifest } from "@/manifest";
import { ChromeExtensionManifestEntriesDiff } from "./parser";

export type ChromeExtensionManifestEntryMapping = {
    entry: string;
    bundle: string;
    visited: boolean;
};
export type ChromeExtensionManifestEntryMappings = Map<string, ChromeExtensionManifestEntryMapping>;

export class ChromeExtensionManifestCache {
    public manifest?: ChromeExtensionManifest;
    public mappings: ChromeExtensionManifestEntryMappings = new Map<string, ChromeExtensionManifestEntryMapping>(); // mappings between module and bundle
    public entriesDiff?: ChromeExtensionManifestEntriesDiff;
}
