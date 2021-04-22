import { InputOption } from "rollup";

export function flattenRollupInput(input?: InputOption): string[] {
    let inputArray: string[];
    if (typeof input === "string") {
        inputArray = [input];
    } else if (Array.isArray(input)) {
        inputArray = [...input];
    } else if (typeof input === "object") {
        inputArray = Object.values(input);
    } else {
        throw new TypeError(
            `options.input cannot be ${typeof input}`,
        );
    }
    return inputArray;
}
