import { ChromeExtensionManifest } from "@/manifest";

export const manifestBase: ChromeExtensionManifest = {
    "manifest_version": 3,
    "name": "test",
    "version": "0.1.0",
};

export function generateManifest(settings: Partial<ChromeExtensionManifest> = {}): ChromeExtensionManifest {
    return {
        ...manifestBase,
        ...settings,
    };
}
