import { OutputAsset, OutputChunk } from "rollup";

export class OptionsProcessorCache {
    public entry?: string;
    public module?: (OutputChunk | OutputAsset)[];
}
