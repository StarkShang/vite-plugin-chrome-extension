import { OutputAsset, OutputChunk } from "rollup";

export class BackgroundProcessorCache {
    public entry?: string;
    public module?: (OutputChunk | OutputAsset)[];
}
