import { OutputAsset, OutputChunk } from "rollup";

export class ContentScriptProcessorCache {
    public entries: string[] = [];
    public modules = new Map<string, (OutputChunk | OutputAsset)[]>();
}
