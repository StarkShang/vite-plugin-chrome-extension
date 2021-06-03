import { ChromeExtensionManifest } from "@/manifest";
import { OutputAsset, OutputChunk } from "rollup";

export class BackgroundProcessorCache {
    public entry?: string;
    public module?: (OutputChunk | OutputAsset)[];
    public manifest: ChromeExtensionManifest | null = null;
}
