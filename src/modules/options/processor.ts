import { ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { WatcherOptions } from "rollup";
import { Plugin } from "vite";
import { ComponentProcessor } from "../common";
import { OptionsProcessorCache } from "./cache";

export interface OptionsProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedOptionsProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[],
}

const DefaultOptionsProcessorOptions: NormalizedOptionsProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class OptionsProcessor extends ComponentProcessor {
    private _options: NormalizedOptionsProcessorOptions;
    private _cache = new OptionsProcessorCache();

    public resolve(manifest: ChromeExtensionManifest): void {
        if (manifest.options_ui?.page) {
            this._cache.entry = manifest.options_ui.page;
        } else if (manifest.options_page) {
            this._cache.entry = manifest.options_page;
        }
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async build(): Promise<ChromeExtensionModule> {
        if (this._cache.entry && this._cache.module.entry !== this._cache.entry) {
            throw new Error("Method not implemented.");
        }
        return this._cache.module;
    }

    public constructor(options: OptionsProcessorOptions = {}) {
        super();
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: OptionsProcessorOptions): NormalizedOptionsProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultOptionsProcessorOptions.plugins; }
        return normalizedOptions as NormalizedOptionsProcessorOptions;
    }
}
