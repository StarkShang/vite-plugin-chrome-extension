import { OutputChunk, PluginContext } from "rollup";
import { OutputChunkBundle } from "../models";
import { ChromeExtensionManifest } from "../../manifest";
import * as permissions from "../../manifest-input/manifest-parser/permissions";

/* ============================================ */
/*              DERIVE PERMISSIONS              */
/* ============================================ */
export const derivePermissions = (
    set: Set<string>,
    { code }: OutputChunk,
) =>
    Object.entries(permissions)
        .filter(([, fn]) => fn(code))
        .map(([key]) => key)
        .reduce((s, p) => s.add(p), set);

export class PermissionProcessorCache {
    public permsHash = "";
    public assetChanged = false;
}

export class PermissionProcessorOptions {
    public verbose = true;
}

export class PermissionProcessor {
    private cache = new PermissionProcessorCache();

    public constructor(private options: PermissionProcessorOptions) {}

    public derivePermissions(
        context: PluginContext,
        chunks: OutputChunkBundle,
        manifest: ChromeExtensionManifest,
    ): void {
        let permissions: string[];
        if (this.cache.assetChanged && this.cache.permsHash) {
            // Permissions did not change
            permissions = JSON.parse(this.cache.permsHash) as string[];
            this.cache.assetChanged = false;
        } else {
            // Permissions may have changed
            permissions = Array.from(
                Object.values(chunks).reduce(derivePermissions, new Set<string>()));
            const permsHash = JSON.stringify(permissions);
            if (this.options.verbose && permissions.length) {
                if (!this.cache.permsHash) {
                    context.warn(
                        `Detected permissions: ${permissions.toString()}`,
                    );
                } else if (permsHash !== this.cache.permsHash) {
                    context.warn(
                        `Detected new permissions: ${permissions.toString()}`,
                    );
                }
            }
            this.cache.permsHash = permsHash;
        }
        // update permissions in manifest.json
        const updatedPermissions = new Set<string>([...manifest.permissions || [], ...permissions]);
        if (updatedPermissions.size > 0) {
            manifest.permissions = Array.from(updatedPermissions);
        } else {
            delete manifest["permissions"];
        }
    }
}
