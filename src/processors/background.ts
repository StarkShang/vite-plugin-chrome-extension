import { OutputBundle } from "rollup";
import { removeFileExtension } from "../common/utils";
import { Background, ChromeExtensionManifest } from "../manifest";
import { findChunkByName } from "../utils/helpers";

export class BackgroundProcesser {
    public generateBundle(bundle: OutputBundle, manifest: ChromeExtensionManifest): void {
        if (manifest.background?.service_worker) {
            // make background chunk output in the same directory as manifest.json
            const chunk = findChunkByName(removeFileExtension(manifest.background.service_worker), bundle);
            if (chunk) {
                // remove original chunk
                delete bundle[chunk.fileName];
                // change background chunk output in the same directory as manifest.json
                chunk.fileName = chunk.fileName.replace(/assets\//, "");
                bundle[chunk.fileName] = chunk;
                manifest.background.service_worker = chunk.fileName;
            }
        }
    }
}
