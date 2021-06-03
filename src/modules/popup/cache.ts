import { ChromeExtensionManifest } from "@/manifest";
import { OutputAsset, OutputChunk } from "rollup";

export class PopupProcessorCache {
    public entry?: string;
    public module?: (OutputChunk | OutputAsset)[];
    public manifest: ChromeExtensionManifest | null = null;
}
