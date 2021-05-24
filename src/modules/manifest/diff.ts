import { ChromeExtensionManifest } from "@/manifest";
import { ChromeExtensionManifestPatch } from "./types";

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

export function diffContentScripts(
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
    patch: ChromeExtensionManifestPatch,
): void {

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
