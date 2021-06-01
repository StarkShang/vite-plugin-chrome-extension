import { OutputAsset, OutputChunk } from "rollup";

export class WebAccessibleResourceProcessorCache {
    public entries: string[] = [];
    public modules = new Map<string, (OutputChunk | OutputAsset)[]>();
}
