import { WatcherOptions } from "rollup";
import { Plugin } from "vite";
import { ComponentProcessor } from "../common";

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

    public resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async build() {
        return "";
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
