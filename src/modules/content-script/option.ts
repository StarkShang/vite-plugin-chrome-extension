import { AliasOptions } from "vite";

export interface ContentScriptProcessorOptions {
    root?: string;
    outDir?: string;
    alias?: AliasOptions;
    plugins?: Plugin[];
}

export interface ContentScriptProcessorInternalOptions extends ContentScriptProcessorOptions {
    root: string;
    outputRoot: string;
}

export interface ContentScriptProcessorNormalizedOptions {
    root: string;
    outDir: string;
    outputRoot: string;
    alias: AliasOptions;
    plugins: Plugin[],
}

export const DefaultContentScriptProcessorOptions: Omit<ContentScriptProcessorNormalizedOptions, "root" | "outputRoot"> = {
    outDir: "content-scripts",
    alias: [],
    plugins: [],
};
