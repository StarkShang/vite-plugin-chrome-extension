import { WatcherOptions } from "rollup";

export interface StandaloneProcessorOptions {
    watch?: boolean | WatcherOptions | null;
    plugins?: Plugin[];
}

export interface NormalizedStandaloneProcessorOptions {
    watch: WatcherOptions | null | undefined;
    plugins: [],
}

const DefaultStandaloneProcessorOptions: NormalizedStandaloneProcessorOptions = {
    watch: undefined,
    plugins: [],
};
