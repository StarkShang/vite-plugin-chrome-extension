import { BundleMapping, ChromeExtensionModule } from "@/common/models";

export class BackgroundProcessorCache {
    public entry?: string;
    public module = ChromeExtensionModule.Empty;
}
