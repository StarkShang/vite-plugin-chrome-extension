import { WatcherOptions } from "rollup";
import { ComponentProcessor } from "../common";
import { Plugin } from "vite";
import { PopupProcessorCache } from "./cache";
import { ChromeExtensionManifest } from "@/manifest";
import { BundleMapping } from "@/common/models";

export interface PopupProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedPopupProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[],
}

const DefaultPopupProcessorOptions: NormalizedPopupProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class PopupProcessor extends ComponentProcessor {
    private _options: NormalizedPopupProcessorOptions;
    private _cache = new PopupProcessorCache();

    public resolve(manifest: ChromeExtensionManifest): void {
        manifest.action?.default_popup && (this._cache.entry = manifest.action.default_popup);
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async build(): Promise<BundleMapping> {
        if (this._cache.mapping.module === this._cache.entry) {
            return this._cache.mapping;
        } else {
            throw new Error("Method not implemented.");
        }
    }

    public constructor(options: PopupProcessorOptions = {}) {
        super();
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: PopupProcessorOptions): NormalizedPopupProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultPopupProcessorOptions.plugins; }
        return normalizedOptions as NormalizedPopupProcessorOptions;
    }
}
