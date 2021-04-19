import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { chromeExtension } from "vite-plugin-chrome-extension";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            input: "src/manifest.json"
        }
    },
    plugins: [
        vue(),
        chromeExtension()
    ]
});
