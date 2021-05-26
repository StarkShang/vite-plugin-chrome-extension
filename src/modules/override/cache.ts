import { BundleMapping } from "@/common/models";

export class OverrideBookmarksProcessorCache {
    public entry?: string;
    public mapping = BundleMapping.Empty;
}

export class OverrideHistoryProcessorCache {
    public entry?: string;
    public mapping = BundleMapping.Empty;
}

export class OverrideNewtabProcessorCache {
    public entry?: string;
    public mapping = BundleMapping.Empty;
}
