import { ChromeExtensionManifest } from "@/manifest";

export interface ChromeExtensionManifestEntryPatch<T> {
    before: T;
    after: T;
}


type ChromeExtensionManifestPatch_1 = {
    [key in keyof ChromeExtensionManifest]: ChromeExtensionManifestEntryPatch<ChromeExtensionManifest[key]>
};
type ChromeExtensionManifestPatch_2 = {
    background?: {
        service_work: ChromeExtensionManifestEntryPatch<string | undefined>,
    },
    chrome_url_overrides?: {
        bookmarks?: ChromeExtensionManifestEntryPatch<string | undefined>,
        history?: ChromeExtensionManifestEntryPatch<string | undefined>,
        newtab?: ChromeExtensionManifestEntryPatch<string | undefined>,
    },
    options_ui: {
        page?: ChromeExtensionManifestEntryPatch<string | undefined>,
        open_in_tab?: ChromeExtensionManifestEntryPatch<boolean | undefined>,
    },
};
export type ChromeExtensionManifestPatch = Pick<
    ChromeExtensionManifestPatch_1,
    Exclude<keyof ChromeExtensionManifestPatch_1, keyof ChromeExtensionManifestPatch_2>
> & ChromeExtensionManifestPatch_2;
