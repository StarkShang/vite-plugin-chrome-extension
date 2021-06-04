import { AliasOptions } from "vite";

export interface PopupProcessorOptions {
    root?: string;
    outDir?: string;
    alias?: AliasOptions;
    plugins?: Plugin[];
}

export interface PopupProcessorInternalOptions extends PopupProcessorOptions {
    root: string;
    outputRoot: string;
}

export interface PopupProcessorNormalizedOptions {
    root: string;
    outDir: string;
    alias: AliasOptions;
    plugins: Plugin[];
}

export const DefaultPopupProcessorOptions: Omit<PopupProcessorNormalizedOptions, "root" | "outputRoot"> = {
    outDir: "popup",
    alias: [],
    plugins: [],
};
