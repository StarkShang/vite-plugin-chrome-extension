import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const { dependencies } = require("./package.json");
const external = Object.keys(dependencies).concat(
    "firebase/app",
    "firebase/auth",
    "firebase/functions",
    "path",
    "fs",
);

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            fileName: "index",
            formats: ["es", "cjs"]
        },
        outDir: path.resolve(__dirname, "lib"),
        rollupOptions: {
            external,
        },
    },
    plugins: [
        tsconfigPaths(),
    ],
});
