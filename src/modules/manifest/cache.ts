import { ChromeExtensionManifest } from "@/manifest";
import { ChromeExtensionManifestEntries, ChromeExtensionManifestEntriesDiff } from "./parser";

export class ChromeExtensionManifestCache {
    public manifest?: ChromeExtensionManifest;
    public mappings?: Map<string, string>; // mappings between module and bundle
    public entries?: ChromeExtensionManifestEntries;
    public entriesDiff?: ChromeExtensionManifestEntriesDiff;
}
