import { Plugin } from "vite";

export type ChromeExtensionPlugin = Pick<
    Required<Plugin>,
    | "name"
    | "enforce"
    | "config"
    | "configResolved"
    | "options"
    | "transform"
    | "watchChange"
    | "outputOptions"
    | "renderChunk"
>
