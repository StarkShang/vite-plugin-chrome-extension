import { BundleMapping, ChromeExtensionModule } from "@/common/models";

export class OverrideBookmarksProcessorCache {
    public entry?: string;
    public module = new ChromeExtensionModule();
}

export class OverrideHistoryProcessorCache {
    public entry?: string;
    public module = new ChromeExtensionModule();
}

export class OverrideNewtabProcessorCache {
    public entry?: string;
    public module = new ChromeExtensionModule();
}
