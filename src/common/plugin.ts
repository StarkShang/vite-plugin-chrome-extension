import { replaceCssUrl } from "@/common/utils/css";
import { createFilter } from "@rollup/pluginutils";
import { Plugin } from "vite";

export function ChromeExtensionAssetPlugin(): Plugin {
    const filter = createFilter(["*.css"], []);

    return {
        name: "ChromeExtensionAssetPlugin",
        transform(code, id, _ssr) {
            // if (!filter(id)) { return; }
            if (id.endsWith(".css")) {
                const { code: updatedCode } = replaceCssUrl(code);
                return updatedCode;
            }
            return undefined;
        }
    }
}
