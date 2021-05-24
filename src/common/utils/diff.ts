import { ChromeExtensionManifestEntryPatch } from "@/modules/manifest/types";

export function diff(current: Record<string, any>, last: Record<string, any>, patch: any = {}) {
    const keys = Array.from(new Set<string>([...Object.keys(current), ...Object.keys(last)]));
    for (const key of keys) {
        const currentProp = current[key];
        const lastProp = last[key];
        if (currentProp === undefined && lastProp === undefined) { continue; }
        // Array
        else if (Array.isArray(currentProp)) {
            if (lastProp === undefined || Array.isArray(lastProp)) {
                const propPatch = diffArray(currentProp, lastProp || []);
                Object.keys(propPatch).length > 0 && (patch[key] = propPatch);
            } else {
                throw new Error(`types are not equal. current: ${typeof current}, last: ${typeof last}`);
            }
        }
        // Object
        else if (typeof currentProp === "object") {
            const propPatch = diff(currentProp, lastProp);
            Object.keys(propPatch).length > 0 && (patch[key] = propPatch);
        }
        // Plain value
        else {
            if (currentProp !== lastProp) {
                patch[key] = {
                    before: lastProp,
                    after: currentProp,
                };
            }
        }
    }
    return patch;
}


function diffArray<T>(current: T[], last: T[]): ChromeExtensionManifestEntryPatch<T>[] {
    const patch = [];

    return [];
}
