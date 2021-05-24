import { WatcherOptions } from "rollup";
import { IComponentProcessor } from "../common";

export interface OptionsProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedOptionsProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: [],
}

const DefaultOptionsProcessorOptions: NormalizedOptionsProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class OptionsPageProcessor implements IComponentProcessor {
    private _options: NormalizedOptionsProcessorOptions;
    public resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public constructor(options: OptionsProcessorOptions = {}) {
        this._options = this.normalizeOptions(options);
    }
    private normalizeOptions(options: OptionsProcessorOptions): NormalizedOptionsProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultOptionsProcessorOptions.plugins; }
        return normalizedOptions as NormalizedOptionsProcessorOptions;
    }
}

export class OptionsProcessor implements IComponentProcessor {
    private _options: NormalizedOptionsProcessorOptions;

    public resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public constructor(options: OptionsProcessorOptions = {}) {
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: OptionsProcessorOptions): NormalizedOptionsProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultOptionsProcessorOptions.plugins; }
        return normalizedOptions as NormalizedOptionsProcessorOptions;
    }
}
