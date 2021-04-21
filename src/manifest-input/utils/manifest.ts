import slash from "slash";
import { ChromeExtensionManifest } from "../../manifest";

export function replaceServiceWorkerPath(
    manifest: ChromeExtensionManifest,
    replace: (path: string) => string,
): ChromeExtensionManifest {
    if (manifest.background && manifest.background.service_worker) {
        manifest.background.service_worker = replace(manifest.background.service_worker);
    }
    return manifest;
}

export function replaceContentScriptsPath(
    manifest: ChromeExtensionManifest,
    replace: (path: string) => string,
): ChromeExtensionManifest {
    if (manifest.content_scripts) {
        manifest.content_scripts = manifest.content_scripts.map(
            ({ js, ...rest }) => typeof js === "undefined"
                ? rest
                : {
                    js: js.map((p) => slash(replace(p))),
                    ...rest,
                },
        );
    }
    return manifest;
}
