import { WatcherOptions } from "rollup";
import { Plugin } from "vite";
import { ComponentProcessor } from "../common";

export interface WebAccessibleResourceProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedWebAccessibleResourceProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[],
}

const DefaultWebAccessibleResourceProcessorOptions: NormalizedWebAccessibleResourceProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class WebAccessibleResourceProcessor extends ComponentProcessor {
    private _options: NormalizedWebAccessibleResourceProcessorOptions;

    public resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public async build() {
        return "";
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public constructor(options: WebAccessibleResourceProcessorOptions = {}) {
        super();
        this._options = this.normalizeOptions(options);
    }

    private normalizeOptions(options: WebAccessibleResourceProcessorOptions): NormalizedWebAccessibleResourceProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultWebAccessibleResourceProcessorOptions.plugins; }
        return normalizedOptions as NormalizedWebAccessibleResourceProcessorOptions;
    }
}
