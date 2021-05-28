/* eslint-env node */

// import typescript from "@rollup/plugin-typescript"
import sucrase from "@rollup/plugin-sucrase";
import bundleImports from "rollup-plugin-bundle-imports";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import resolve from "@rollup/plugin-node-resolve";

const { dependencies } = require("./package.json");

const external = Object.keys(dependencies).concat(
    "firebase/app",
    "firebase/auth",
    "firebase/functions",
    "path",
    "fs",
)

// Was used for typescript plugin
// const {
//   compilerOptions,
// } = require("./tsconfigs/tsconfig-base.json")

const plugins = [
    alias({
        entries: {
            "@": "src",
        },
    }), {
        name: "beforeResolve",
        resolveId(source, importer, options) {
            console.log("beforeResolve: ", {source, importer, options});
            return null;
        },
    },
    resolve({
        extensions: [".js", ".ts"],
    }), {
        name: "afterResolve",
        resolveId(source, importer, options) {
            console.log("afterResolve: ",  {source, importer, options});
            return null;
        },
    },
    json(),
    sucrase({
        exclude: ["node_modules/**"],
        transforms: ["typescript"],
    }),
    bundleImports({
        useVirtualModule: true,
        options: {
            external: ["%PATH%"],
        },
    }),
];

export default [{
    input: "src/index.ts",
    output: [
        {
            file: "lib/index-esm.js",
            format: "esm",
            sourcemap: "inline",
        },
        {
            file: "lib/index-cjs.js",
            format: "cjs",
            sourcemap: "inline",
        },
    ],
    external,
    plugins,
}]
