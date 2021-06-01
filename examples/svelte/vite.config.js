import { defineConfig } from "vite";
import svelte from "@sveltejs/vite-plugin-svelte";
import { chromeExtension } from "vite-plugin-chrome-extension";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        chromeExtension({
            components: {
                popup: {
                    plugins: [svelte()]
                },
                options: {
                    plugins: [svelte()]
                }
            }
        }),
    ]
});
