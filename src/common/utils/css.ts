import { join } from "path";
import { OutputAsset } from "rollup";
import slash from "slash";

const cssUrlRE = /((?<=url *\( *' *)[^(data:)][^']+(?= *' *\))|(?<=url *\( *" *)[^(data:)][^"]+(?= *" *\))|(?<=url *\( *)[^(data:)][^'")]+(?= *\)))/g

export function replaceCssUrl(code: string) {
    const resources = new Set<string>();
    const updatedCode = code.replace(cssUrlRE, (substring) => {
        const url = substring.trim();
        if (url) {
            resources.add(url);
            return "chrome-extension://" + slash(join("__MSG_@@extension_id__", substring.trim()));
        } else {
            return "";
        }
    });
    return resources.size > 0
        ? { code: updatedCode, resources: Array.from(resources) }
        : { code: updatedCode };
}

export function updateCss(asset: OutputAsset) {
    if (typeof asset.source === "string") {
        // update url() in css
        const { code, resources } = replaceCssUrl(asset.source);
        asset.source = code;
        return { asset, resources };
    }
    return { asset };
}
