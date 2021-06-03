import { ChromeExtensionManifest } from "@/manifest";
import { OutputAsset, OutputChunk } from "rollup";

export class OptionsProcessorCache {
    public manifest: ChromeExtensionManifest | null = null;
    public entry?: string;
    public module?: (OutputChunk | OutputAsset)[];
}
