import { MarkableChromeExtensionModule } from "@/common/models";

export class WebAccessibleResourceProcessorCache {
    public entries: string[] = [];
    public modules = new Map<string, MarkableChromeExtensionModule>();
}
