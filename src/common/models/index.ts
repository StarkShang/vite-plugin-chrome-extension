import { OutputAsset, OutputChunk } from "rollup";

export interface OutputChunkBundle {
    [fileName: string]: OutputChunk;
}
export interface OutputAssetBundle {
    [fileName: string]: OutputAsset;
}
