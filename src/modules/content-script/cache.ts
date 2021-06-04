import { ChromeExtensionManifest } from "@/manifest";
import { OutputAsset, OutputChunk } from "rollup";

export class ContentScriptProcessorCache {
    public manifest: ChromeExtensionManifest | null = null;
    public entries: string[] = [];
    public modules = new Map<string, (OutputChunk | OutputAsset)[]>();
    public mappings = new Map<string, string>(); // key: file path, value: entry path
}
