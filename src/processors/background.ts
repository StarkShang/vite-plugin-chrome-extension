import { OutputBundle } from "rollup";
import { removeFileExtension } from "../common/utils";
import { Background } from "../manifest";
import { findChunkByName } from "../utils/helpers";

export class BackgroundProcesser {
    public generateBundle(bundle: OutputBundle, background?: Background): Background {
        if (background && background.service_worker) {
            // make background chunk output in the same directory as manifest.json
            const chunk = findChunkByName(removeFileExtension(background.service_worker), bundle);
            if (chunk) {
                // remove original chunk
                delete bundle[chunk.fileName];
                // change background chunk output in the same directory as manifest.json
                chunk.fileName = chunk.fileName.replace(/assets\//, "");
                bundle[chunk.fileName] = chunk;
                background.service_worker = chunk.fileName;
                return background;
            }
        }

        return { service_worker: "" }
    }
}
