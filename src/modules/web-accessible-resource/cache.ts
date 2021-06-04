import { ChromeExtensionManifest } from "@/manifest";
import { OutputAsset, OutputChunk } from "rollup";

export class WebAccessibleResourceProcessorCache {
    public manifest: ChromeExtensionManifest | null = null;
    public entries: string[] = [];
    public modules = new Map<string, (OutputChunk | OutputAsset)[]>();
    public mappings = new Map<string, string>(); // key: file path, value: entry path
}
