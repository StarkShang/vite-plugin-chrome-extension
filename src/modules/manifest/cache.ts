import { ChromeExtensionManifest } from "@/manifest";
import { ChromeExtensionManifestEntries, ChromeExtensionManifestEntriesDiff } from "./parser";

export class ChromeExtensionManifestCache {
    public manifest?: ChromeExtensionManifest;
    public entries?: ChromeExtensionManifestEntries;
    public entriesDiff?: ChromeExtensionManifestEntriesDiff;
}
