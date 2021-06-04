import { EventEmitter } from "events";
import { ChromeExtensionManifest } from "@/manifest";
import { ChromeExtensionModule } from "@/common/models";

export interface IComponentProcessor {
    resolve(entry: ChromeExtensionManifest): Promise<string[]>;
    build(): Promise<void>;
    clearCacheByFilePath(file: string): void;
}
