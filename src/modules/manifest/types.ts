import { ChromeExtensionManifest } from "@/manifest";

export interface ChromeExtensionManifestEntryPatch<T> {
    before: T;
    after: T;
}

export type ChromeExtensionManifestContentScriptPatch = {
    js?: ChromeExtensionManifestEntryPatch<string | undefined>[],
    css?: ChromeExtensionManifestEntryPatch<string | undefined>[],
    matches?: ChromeExtensionManifestEntryPatch<string | undefined>[],
    match_about_blank?: ChromeExtensionManifestEntryPatch<boolean | undefined>,
}
type ChromeExtensionManifestPatch_1 = {
    [key in keyof ChromeExtensionManifest]: ChromeExtensionManifestEntryPatch<ChromeExtensionManifest[key]>
};
type ChromeExtensionManifestPatch_2 = {
    manifest_version?: ChromeExtensionManifestEntryPatch<3 | undefined>,
    name?: ChromeExtensionManifestEntryPatch<string | undefined>,
    version?: ChromeExtensionManifestEntryPatch<string | undefined>,
    background?: {
        service_work: ChromeExtensionManifestEntryPatch<string | undefined>,
    },
    content_scripts?: ChromeExtensionManifestContentScriptPatch[],
    chrome_url_overrides?: {
        bookmarks?: ChromeExtensionManifestEntryPatch<string | undefined>,
        history?: ChromeExtensionManifestEntryPatch<string | undefined>,
        newtab?: ChromeExtensionManifestEntryPatch<string | undefined>,
    },
    options_ui?: {
        page?: ChromeExtensionManifestEntryPatch<string | undefined>,
        open_in_tab?: ChromeExtensionManifestEntryPatch<boolean | undefined>,
    },
};
export type ChromeExtensionManifestPatch = Pick<
    ChromeExtensionManifestPatch_1,
    Exclude<keyof ChromeExtensionManifestPatch_1, keyof ChromeExtensionManifestPatch_2>
> & ChromeExtensionManifestPatch_2;
