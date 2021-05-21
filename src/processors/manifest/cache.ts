import { ChromeExtensionManifest } from "@root/src/manifest";
import { ChromeExtensionManifestEntries, ChromeExtensionManifestEntriesDiff } from "./parser";

export class ChromeExtensionManifestCache {
    public manifest?: ChromeExtensionManifest;
    public entries?: ChromeExtensionManifestEntries;
    public entriesDiff?: ChromeExtensionManifestEntriesDiff;
}
