import { ChromeExtensionManifest } from "@/manifest";
import { ChromeExtensionManifestEntries, ChromeExtensionManifestEntriesDiff } from "./parser";
export type ChromeExtensionManifestEntryMapping = {
    entry: string;
    bundle: string;
    visited: boolean;
};
export type ChromeExtensionManifestEntryMappings = Map<string, ChromeExtensionManifestEntryMapping>;

export class ChromeExtensionManifestCache {
    public manifest?: ChromeExtensionManifest;
    public mappings: ChromeExtensionManifestEntryMappings = new Map<string, ChromeExtensionManifestEntryMapping>(); // mappings between module and bundle
    public entries: ChromeExtensionManifestEntries = [];
    public entriesDiff?: ChromeExtensionManifestEntriesDiff;
}
