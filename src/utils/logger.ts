import { InputOption } from "rollup";

function logInputFiles(entries?: InputOption) {
    console.log("\x1B[36m%s", "\nFind entry files");
    if (!entries) {
        console.log("\x1B[33m%s\x1B[0m", "Empty entry files.");
    }
    if (typeof entries === "string") {
        console.log("\x1B[32m%s\x1B[0m", entries);
    } else if (Array.isArray(entries)) {
        entries.forEach(input => {
            console.log("\x1B[32m%s\x1B[0m", input);
        });
    } else {
        for (const alias in entries) {
            if (Object.prototype.hasOwnProperty.call(entries, alias)) {
                console.log("\x1B[0m%s: \x1B[32m%s\x1B[0m", alias, entries[alias]);
            }
        }
    }
    console.log();
}


export const logger = {
    info: (msg: string) => console.log("\x1B[32m%s\x1B[0m", msg),
    error: (msg: string) => console.log("\x1B[31m%s\x1B[0m", msg),
    warn: (msg: string) => console.log("\x1B[33m%s\x1B[0m", msg),
    logInputFiles,
};
