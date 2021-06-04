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
    public mappings = new Map<string, Set<string>>(); // mappings between module watched and processor
    public entriesDiff?: ChromeExtensionManifestEntriesDiff;
}
