import { resolve } from "path";
import { defineConfig } from "vite";
import { chromeExtension } from "vite-plugin-chrome-extension";
import probe from "rollup-plugin-probe";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    build: {
        rollupOptions: {
            input: "src/manifest.json"
        }
    },
    plugins: [
        chromeExtension(),
        probe({
            hooks: {
                options: {},
                transform: {},
                generateBundle: {},
            }
        })
    ],
})
