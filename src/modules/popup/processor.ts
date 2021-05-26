import { WatcherOptions } from "rollup";
import { ComponentProcessor } from "../common";
import { Plugin } from "vite";

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

    public resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async build() {
        return "";
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
