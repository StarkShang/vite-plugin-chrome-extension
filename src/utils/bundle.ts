import { OutputBundle, OutputChunk } from "rollup";
import { OutputChunkBundle } from "../common/models";
import { isAsset, isChunk } from "./helpers";

export function getChunk(bundle: OutputBundle) {
    return Object.keys(bundle)
        .filter(key => isChunk(bundle[key]))
        .reduce((b, k) => {
            b[k] = bundle[k] as OutputChunk;
            return b;
        }, {} as OutputChunkBundle);
}

export function getAssets(bundle: OutputBundle) {
    return Object.keys(bundle)
        .filter(key => isAsset(bundle[key]))
        .reduce((b, k) => {
            b[k] = bundle[k] as OutputChunk;
            return b;
        }, {} as OutputChunkBundle);
}
