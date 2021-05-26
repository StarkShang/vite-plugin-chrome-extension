import { ChromeExtensionManifestEntryMapping, ChromeExtensionManifestEntryMappings } from "../manifest/cache";

export class WebAccessibleResourceProcessorCache {
    public entries: string[] = [];
    public mappings: ChromeExtensionManifestEntryMappings = new Map<string, ChromeExtensionManifestEntryMapping>();
}
