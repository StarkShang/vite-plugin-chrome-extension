import { resolve, join, sep } from "path";
import { OutputAsset, OutputChunk, OutputBundle } from "rollup";

export const getTestName = (filename: string): string => {
    const result = filename
        .split("__")
        .pop()
        ?.split(".")
        ?.shift();

    if (typeof result === "string") {
        return result;
    } else {
        throw new TypeError(`Invalid filename: ${filename}`);
    }
};

export const getCrxName = (filepath: string): string => {
    const [, crxName, crxParent] = filepath.split(sep).reverse();
    if (crxParent === "extensions") return crxName;
    throw new Error(`This is not a CRX fixture: ${filepath}`);
};

export const getExtPath = (path: string): string =>
    resolve(__dirname, "extensions", path);

export const requireExtFile = <T>(
    currentFilename: string,
    targetFilename: string,
): T => {
    const testName = getTestName(currentFilename);

    return require(getExtPath(join(testName, targetFilename)))
        .default;
};

/**  Make relative to project root */
export const getRelative = (p: string): string =>
    p.replace(process.cwd() + "/", "");

export function byFileName(n: string) {
    return ({ fileName }: OutputAsset | OutputChunk): boolean =>
        fileName === n;
}

/**
 * Get the source of an OutputAsset as a string
 */
export const getAssetSource = (
    key: string,
    bundle: OutputBundle,
): string => {
    const asset = bundle[key] as OutputAsset;

    if (!asset) {
        throw new Error(`Unable to find ${key} in bundle`);
    }

    if (asset.source instanceof Uint8Array) {
        return asset.source.toString();
    } else {
        return asset.source;
    }
};
