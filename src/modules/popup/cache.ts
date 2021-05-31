import { OutputAsset, OutputChunk } from "rollup";

export class PopupProcessorCache {
    public entry?: string;
    public module?: (OutputChunk | OutputAsset)[];
}
