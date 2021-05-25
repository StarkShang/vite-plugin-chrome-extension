import { diffStringArray } from "@/common/utils/diff";
import { ChromeExtensionManifest, ContentScript } from "@/manifest";
import { ChromeExtensionManifestContentScriptPatch, ChromeExtensionManifestPatch } from "./types";

export function diffBackground(
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
    patch: ChromeExtensionManifestPatch,
): void {
    if (current.background?.service_worker !== last.background?.service_worker)
        patch.background = {
            service_work:{
                before: last.background?.service_worker,
                after: current.background?.service_worker,
            }
        };
}

function mergeContentScripts(scripts: ContentScript[]) {
    return scripts.reduce((dict, item) => {
        const key = item.matches.sort().toString();
        if (dict.has(key)) {
            const group = dict.get(key)!;
            if (item.js) { group.js = group.js ? group.js.concat(item.js) : item.js; }
            if (item.css) { group.css = group.css ? group.css.concat(item.css) : item.css; }
        } else {
            dict.set(key, item);
        }
        return dict;
    }, new Map<string, ContentScript>());
}
export function diffContentScript(
    current?: ContentScript,
    last?: ContentScript,
): ChromeExtensionManifestContentScriptPatch | undefined {
    if (current === undefined) {
        if (last === undefined) {
            return undefined;
        } else {
            // delete
            const patch = {} as ChromeExtensionManifestContentScriptPatch;
            const jsPatch = last.js?.map(js => ({ before: js, after: undefined }));
            jsPatch && jsPatch.length > 0 && (patch.js = jsPatch);
            const cssPatch = last.css?.map(css => ({ before: css, after: undefined }));
            cssPatch && cssPatch.length > 0 && (patch.css = cssPatch);
            const matchPatch = last.matches.map(match => ({ before: match, after: undefined }));
            matchPatch && matchPatch.length > 0 && (patch.matches = matchPatch);
            if (last.match_about_blank !== undefined)
                patch.match_about_blank = ({ before: last.match_about_blank, after: undefined });
            return Object.keys(patch).length > 0 ? patch : undefined;
        }
    } else {
        if (last === undefined) {
            // add
            const patch = {} as ChromeExtensionManifestContentScriptPatch;
            const jsPatch = current.js?.map(js => ({ before: undefined, after: js }));
            jsPatch && jsPatch.length > 0 && (patch.js = jsPatch);
            const cssPatch = current.css?.map(css => ({ before: undefined, after: css }));
            cssPatch && cssPatch.length > 0 && (patch.css = cssPatch);
            const matchPatch = current.matches.map(match => ({ before: undefined, after: match }));
            matchPatch && matchPatch.length > 0 && (patch.matches = matchPatch);
            if (current.match_about_blank !== undefined)
                patch.match_about_blank = ({ before: undefined, after: current.match_about_blank });
            return Object.keys(patch).length > 0 ? patch : undefined;
        } else {
            // update
            const patch = {} as ChromeExtensionManifestContentScriptPatch;
            const jsPatch = diffStringArray(current.js, last.js);
            jsPatch && jsPatch.length > 0 && (patch.js = jsPatch);
            const cssPatch = diffStringArray(current.css, last.css);
            cssPatch && cssPatch.length > 0 && (patch.css = cssPatch);
            const matchPatch = diffStringArray(current.matches, last.matches);
            matchPatch && matchPatch.length > 0 && (patch.matches = matchPatch);
            if (current.match_about_blank !== last.match_about_blank)
                patch.match_about_blank = ({ before: last.match_about_blank, after: current.match_about_blank });
            return Object.keys(patch).length > 0 ? patch : undefined;
        }
    }
}

export function diffContentScripts(
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
    patch: ChromeExtensionManifestPatch,
): void {
    const currentContentScripts = current.content_scripts || [];
    const lastContentScripts = last.content_scripts || [];
    for (let index = 0; index < Math.max(currentContentScripts.length, lastContentScripts.length); index++) {
        const scriptDiff = diffContentScript(currentContentScripts[index], lastContentScripts[index]);
        if (scriptDiff) {
            patch.content_scripts
                ? patch.content_scripts.push(scriptDiff)
                : patch.content_scripts = [scriptDiff];
        }
    }
}

export function diffOptions(current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
    patch: ChromeExtensionManifestPatch,
): void {
    if (current.options_page !== last.options_page) {
        patch.options_page = {
            before: last.options_page,
            after: current.options_page,
        };
    }
    if (current.options_ui?.page !== last.options_ui?.page) {
        const pagePatch = {
            before: last.options_ui?.page,
            after: current.options_ui?.page,
        };
        patch.options_ui
            ? patch.options_ui.page = pagePatch
            : patch.options_ui = { page: pagePatch };
    }
    if (current.options_ui?.open_in_tab !== last.options_ui?.open_in_tab) {
        const pagePatch = {
            before: last.options_ui?.open_in_tab,
            after: current.options_ui?.open_in_tab,
        };
        patch.options_ui
            ? patch.options_ui.open_in_tab = pagePatch
            : patch.options_ui = { open_in_tab: pagePatch };
    }
}

export function diffPopup(
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
    patch: ChromeExtensionManifestPatch,
): void {

}

export function diffOverride(
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
    patch: ChromeExtensionManifestPatch,
): void {
    const result = {} as NonNullable<ChromeExtensionManifestPatch["chrome_url_overrides"]>;
    if (current.chrome_url_overrides?.bookmarks !== last.chrome_url_overrides?.bookmarks) {
        result.bookmarks = {
            before: last.chrome_url_overrides?.bookmarks,
            after: current.chrome_url_overrides?.bookmarks,
        };
    }
    if (current.chrome_url_overrides?.history !== last.chrome_url_overrides?.history) {
        result.history = {
            before: last.chrome_url_overrides?.history,
            after: current.chrome_url_overrides?.history,
        };
    }
    if (current.chrome_url_overrides?.newtab !== last.chrome_url_overrides?.newtab) {
        result.newtab = {
            before: last.chrome_url_overrides?.newtab,
            after: current.chrome_url_overrides?.newtab,
        };
    }

    if (Object.keys(result).length > 0) {
        patch.chrome_url_overrides = result;
    }
}

export function diffDevtools(
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
    patch: ChromeExtensionManifestPatch,
): void {
    if (current.devtools_page !== last.devtools_page)
        patch.devtools_page = {
            before: last.devtools_page,
            after: current.devtools_page,
        };
}

export function diffWebAccessibleResources(
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
    patch: ChromeExtensionManifestPatch,
): void {

}
