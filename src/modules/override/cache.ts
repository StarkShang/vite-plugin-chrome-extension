import { BundleMapping, ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";

export class OverrideBookmarksProcessorCache {
    public manifest: ChromeExtensionManifest | null = null;
    public entry?: string;
    public module?: ChromeExtensionModule;
}

export class OverrideHistoryProcessorCache {
    public manifest: ChromeExtensionManifest | null = null;
    public entry?: string;
    public module?: ChromeExtensionModule;
}

export class OverrideNewtabProcessorCache {
    public manifest: ChromeExtensionManifest | null = null;
    public entry?: string;
    public module?: ChromeExtensionModule;
}
