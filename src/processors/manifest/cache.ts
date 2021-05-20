import { ChromeExtensionManifest } from "@root/src/manifest";
import { ChromeExtensionManifestEntries } from "./parser";

export class ChromeExtensionManifestCache {
    public manifest?: ChromeExtensionManifest;
    public entries?: ChromeExtensionManifestEntries;
}
