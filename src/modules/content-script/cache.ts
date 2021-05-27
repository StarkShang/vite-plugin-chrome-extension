import { MarkableChromeExtensionModule } from "@/common/models";

export class ContentScriptProcessorCache {
    public entries: string[] = [];
    public modules = new Map<string, MarkableChromeExtensionModule>();
}
