import { ChromeExtensionManifest } from "@/manifest";

export interface IComponentProcessor {
    resolve(entry: ChromeExtensionManifest): Promise<string[]>;
    build(): Promise<void>;
    clearCacheByFilePath(file: string): void;
}
