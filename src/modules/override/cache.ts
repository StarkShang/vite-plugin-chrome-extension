import { BundleMapping, ChromeExtensionModule } from "@/common/models";

export class OverrideBookmarksProcessorCache {
    public entry?: string;
    public module = ChromeExtensionModule.Empty;
}

export class OverrideHistoryProcessorCache {
    public entry?: string;
    public module = ChromeExtensionModule.Empty;
}

export class OverrideNewtabProcessorCache {
    public entry?: string;
    public module = ChromeExtensionModule.Empty;
}
