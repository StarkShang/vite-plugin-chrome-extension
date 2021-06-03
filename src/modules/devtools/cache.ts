import { ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";

export class DevtoolsProcessorCache {
    public manifest: ChromeExtensionManifest | null = null;
    public entry?: string;
    public module?: ChromeExtensionModule;
}
