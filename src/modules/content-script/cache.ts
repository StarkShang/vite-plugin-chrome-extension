import { ChromeExtensionManifestEntryMapping, ChromeExtensionManifestEntryMappings } from "../manifest/cache";

export class ContentScriptProcessorCache {
    public entries: string[] = [];
    public mappings: ChromeExtensionManifestEntryMappings = new Map<string, ChromeExtensionManifestEntryMapping>();
}
