import { join } from "path";
import { OutputAsset } from "rollup";
import slash from "slash";

const cssUrlRE = /((?<=url *\( *' *)[^']+(?= *' *\))|(?<=url *\( *" *)[^"]+(?= *" *\))|(?<=url *\( *)[^'")]+(?= *\)))/g

export function replaceCssUrl(code: string) {
    return code.replace(cssUrlRE, (substring) =>
        substring.trim()
            ? slash(join("chrome-extension://__MSG_@@extension_id__", substring.trim()))
            : ""
    );
}

export function updateCss(asset: OutputAsset) {
    if (typeof asset.source === "string") {
        asset.source = replaceCssUrl(asset.source)
    }
    return asset;
}
