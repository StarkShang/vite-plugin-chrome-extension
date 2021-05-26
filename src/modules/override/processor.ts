import { WatcherOptions } from "rollup";
import { Plugin } from "vite";
import { ComponentProcessor } from "../common";

export interface OverrideBookmarksProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedOverrideBookmarksProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[],
}

const DefaultOverrideBookmarksProcessorOptions: NormalizedOverrideBookmarksProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class OverrideBookmarksProcessor extends ComponentProcessor {
    private _options: NormalizedOverrideBookmarksProcessorOptions;
    public resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public async build() {
        return "";
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public constructor(options: OverrideBookmarksProcessorOptions = {}) {
        super();
        this._options = this.normalizeOptions(options);
    }
    private normalizeOptions(options: OverrideBookmarksProcessorOptions): NormalizedOverrideBookmarksProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultOverrideBookmarksProcessorOptions.plugins; }
        return normalizedOptions as NormalizedOverrideBookmarksProcessorOptions;
    }
}

export interface OverrideHistoryProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedOverrideHistoryProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[],
}

const DefaultOverrideHistoryProcessorOptions: NormalizedOverrideHistoryProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class OverrideHistoryProcessor extends ComponentProcessor {
    private _options: NormalizedOverrideHistoryProcessorOptions;
    public resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public async build() {
        return "";
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public constructor(options: OverrideHistoryProcessorOptions = {}) {
        super();
        this._options = this.normalizeOptions(options);
    }
    private normalizeOptions(options: OverrideHistoryProcessorOptions): NormalizedOverrideHistoryProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultOverrideHistoryProcessorOptions.plugins; }
        return normalizedOptions as NormalizedOverrideHistoryProcessorOptions;
    }
}

export interface OverrideNewtabProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedOverrideNewtabProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: Plugin[],
}

const DefaultOverrideNewtabProcessorOptions: NormalizedOverrideNewtabProcessorOptions = {
    watch: undefined,
    plugins: [],
};

export class OverrideNewtabProcessor extends ComponentProcessor {
    private _options: NormalizedOverrideNewtabProcessorOptions;
    public resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public async build() {
        return "";
    }

    public stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public constructor(options: OverrideNewtabProcessorOptions = {}) {
        super();
        this._options = this.normalizeOptions(options);
    }
    private normalizeOptions(options: OverrideNewtabProcessorOptions): NormalizedOverrideNewtabProcessorOptions {
        const normalizedOptions = { ...options };
        if (normalizedOptions.watch === false || normalizedOptions.watch === undefined) {
            normalizedOptions.watch = undefined;
        } else if (normalizedOptions.watch === true) {
            normalizedOptions.watch = {};
        }
        if (!normalizedOptions.plugins) { normalizedOptions.plugins = DefaultOverrideNewtabProcessorOptions.plugins; }
        return normalizedOptions as NormalizedOverrideNewtabProcessorOptions;
    }
}
