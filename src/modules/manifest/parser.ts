import glob from "glob";
import get from "lodash.get";
import diff from "lodash.difference";
import path from "path";

import {
    ChromeExtensionManifest,
    ContentScript,
    WebAccessibleResource,
} from "@/manifest";
import { ChromeExtensionManifestPatch } from "./types";
import { diffBackground, diffContentScripts, diffDevtools, diffOptions, diffOverride, diffPopup, diffWebAccessibleResources } from "./diff";
import { ChromeExtensionManifestEntryMapping } from "./cache";

// export interface ChromeExtensionManifestEntries {
//     background?: string;
//     content_scripts?: string[];
//     options_page?: string;
//     options_ui?: string;
//     popup?: string;
//     override?: { bookmarks?:string, history?:string, newtab?:string };
//     devtools?: string;
//     web_accessible_resources?: string[];
// }

type ChromeExtensionManifestEntryType =
    | "background"
    | "content-script"
    | "options-page"
    | "options-ui"
    | "popup"
    | "bookmarks"
    | "history"
    | "newtab"
    | "devtools"
    | "web-accessible-resource";

export interface ChromeExtensionManifestEntry {
    key: string;
    type: ChromeExtensionManifestEntryType;
    module: string;
    bundle?: string;
}

export type ChromeExtensionManifestEntries = ChromeExtensionManifestEntry[];

export type ChromeExtensionManifestEntryDiffStatus = "create" | "update" | "delete";
export interface ChromeExtensionManifestEntryDiff {
    status: ChromeExtensionManifestEntryDiffStatus;
    entry?: string;
}
export interface ChromeExtensionManifestEntryArrayDiff {
    create?: string[],
    delete?: string[],
}
export interface ChromeExtensionManifestEntriesDiff {
    background?: ChromeExtensionManifestEntryDiff;
    content_scripts?: ChromeExtensionManifestEntryArrayDiff;
    options_page?: ChromeExtensionManifestEntryDiff;
    options_ui?: ChromeExtensionManifestEntryDiff;
    popup?: ChromeExtensionManifestEntryDiff;
    devtools?: ChromeExtensionManifestEntryDiff;
    override?: {
        bookmarks?: ChromeExtensionManifestEntryDiff,
        history?:ChromeExtensionManifestEntryDiff,
        newtab?:ChromeExtensionManifestEntryDiff
    };
    web_accessible_resources?: ChromeExtensionManifestEntryArrayDiff;
}

export class ChromeExtensionManifestParser {
    public diff(
        current: ChromeExtensionManifest = {} as ChromeExtensionManifest,
        last: ChromeExtensionManifest = {} as ChromeExtensionManifest,
    ): Partial<ChromeExtensionManifest> {
        const patch = {} as ChromeExtensionManifestPatch;
        // name
        if (current.name !== last.name) patch.name = { before: last.name, after: current.name };
        // version
        if (current.version !== current.version) patch.version = { before: last.version, after: current.version };
        // action
        // default_locale
        // description
        // icons
        // author
        // automation
        // chrome_settings_overrides
        // commands
        // content_capabilities
        // content_security_policy
        // converted_from_user_script
        // current_locale
        // declarative_net_request
        // differential_fingerprint
        // event_rules
        // externally_connectable
        // file_browser_handlers
        // file_system_provider_capabilities
        // homepage_url
        // host_permissions
        // import
        // incognito
        // input_components
        // key
        // minimum_chrome_version
        // nacl_modules
        // natively_connectable
        // oauth2
        // offline_enabled
        // omnibox
        // optional_permissions
        // permissions
        // platforms
        // replacement_web_app
        // requirements
        // sandbox
        // short_name
        // storage
        // system_indicator
        // tts_engine
        // update_url
        // version_name
        /* --------------- UI ENTRIES --------------- */
        // background service worker
        diffBackground(current, last, patch);
        // content scripts
        diffContentScripts(current, last, patch);
        // options: options_page && options_ui
        diffOptions(current, last, patch);
        // popup
        diffPopup(current, last, patch);
        // chrome_url_overrides
        diffOverride(current, last, patch);
        // TODO: standalone
        // devtools
        diffDevtools(current, last, patch);
        // web accessible resources
        diffWebAccessibleResources(current, last, patch);
        return {};
    }

    public entries(manifest: ChromeExtensionManifest): ChromeExtensionManifestEntries {
        const entries = [] as ChromeExtensionManifestEntry[];
        // background service worker
        manifest.background && manifest.background.service_worker && entries.push({
            key: `background:${manifest.background.service_worker}`,
            type: "background",
            module: manifest.background.service_worker,
        });
        // content scripts
        manifest.content_scripts?.map(group => group.js || [])
            .forEach(scripts => {
                scripts.forEach(script => entries.push({
                    key: `content-script:${script}`,
                    type: "content-script",
                    module: script,
                }));
            });
        // options page
        manifest.options_page && entries.push({
            key: `options-page:${manifest.options_page}`,
            type: "options-page",
            module: manifest.options_page,
        });
        // options ui
        manifest.options_ui?.page && entries.push({
            key: `options-ui:${manifest.options_ui.page}`,
            type: "options-ui",
            module: manifest.options_ui.page,
        });
        // popup
        manifest.action?.default_popup && entries.push({
            key: `popup:${manifest.action.default_popup}`,
            type: "popup",
            module: manifest.action.default_popup,
        });
        // override
        manifest.chrome_url_overrides?.bookmarks && entries.push({
            key: `bookmarks:${manifest.chrome_url_overrides.bookmarks}`,
            type: "bookmarks",
            module: manifest.chrome_url_overrides.bookmarks,
        });
        manifest.chrome_url_overrides?.history && entries.push({
            key: `history:${manifest.chrome_url_overrides.history}`,
            type: "history",
            module: manifest.chrome_url_overrides.history,
        });
        manifest.chrome_url_overrides?.newtab && entries.push({
            key: `newtab:${manifest.chrome_url_overrides.newtab}`,
            type: "newtab",
            module: manifest.chrome_url_overrides.newtab,
        });
        // TODO: standalone
        // devtools
        manifest.devtools_page && entries.push({
            key: `devtools:${manifest.devtools_page}`,
            type: "devtools",
            module: manifest.devtools_page,
        });
        // web accessible resources
        manifest.web_accessible_resources?.map(group => group.resources || [])
            .forEach(scripts => {
                scripts.forEach(script => entries.push({
                    key: `web-accessible-resource:${script}`,
                    type: "web-accessible-resource",
                    module: script,
                }));
            });
        return entries;
    }

    private diffSingleEntryComponent(
        last: string | undefined,
        current: string | undefined,
    ): ChromeExtensionManifestEntryDiff | undefined {
        if (!last && current) {
            return { status: "create", entry: current };
        } else if (last && !current) {
            return { status: "delete", entry: last };
        } else if (current !== last) {
            return { status: "update", entry: current };
        }
        return;
    }

    private diffArrayEntriesComponent(
        last: string[] | undefined,
        current: string[] | undefined,
    ): ChromeExtensionManifestEntryArrayDiff {
        return {
            create: current?.filter(item => !last?.includes(item)),
            delete: last?.filter(item => !current?.includes(item))
        }
    }

    public standaloneEntry(manifest: ChromeExtensionManifest, srcPath: string) {
        // TODO: add standalone entry parser
    }
    public webAccessibleResourceEntries(manifest: ChromeExtensionManifest, srcPath: string) {
        const resources = manifest.web_accessible_resources?.map(resource => resource.resources)
            .reduce((arr, item) => arr.concat(item), [])
            .map(resource => path.resolve(srcPath, resource));
        return resources && resources.length <= 0 ? undefined : resources;
    }
}

export function deriveFiles(
    manifest: ChromeExtensionManifest,
    srcDir: string,
) {
    // get resources from section web_accessible_resources
    const web_accessible_resources = get(
        manifest,
        "web_accessible_resources",
        [] as WebAccessibleResource[],
    ).reduce((resource_paths, web_accessible_resource) =>
        web_accessible_resource.resources.reduce((r, x) => {
            if (glob.hasMagic(x)) {
                const files = glob.sync(x, { cwd: srcDir });
                return [...r, ...files.map((f) => f.replace(srcDir, ""))];
            } else {
                return [...r, x];
            }
        }, resource_paths),
    [] as string[]);

    /**
     * js files come from:
     *  - web_accessible_resources
     *  - background.service_worker
     *  - content_scripts
     */
    const js = [
        ...web_accessible_resources.filter((f: string) => /\.[jt]sx?$/.test(f)),
        get(manifest, "background.service_worker"),
        ...get(
            manifest,
            "content_scripts",
            [] as ContentScript[],
        ).reduce((r, { js = [] }) => [...r, ...js], [] as string[]),
    ];

    /**
     * html files come from:
     *  - web_accessible_resources
     *  - options_page
     *  - options_ui.page
     *  - devtools_page
     *  - action.default_popup
     *  - chrome_url_overrides
     */
    const html = [
        ...web_accessible_resources.filter((f: string) => /\.html?$/.test(f)),
        get(manifest, "options_page"),
        get(manifest, "options_ui.page"),
        get(manifest, "devtools_page"),
        get(manifest, "action.default_popup"),
        ...Object.values(get(manifest, "chrome_url_overrides", {})),
    ];

    /**
     * css files come from:
     *  - web_accessible_resources
     *  - content_scripts
     */
    const css = [
        ...web_accessible_resources.filter((f: string) => f.endsWith(".css")),
        ...get(
            manifest,
            "content_scripts",
            [] as ContentScript[],
        ).reduce(
            (r, { css = [] }) => [...r, ...css],
            [] as string[],
        ),
    ];

    /**
     * action icons come from:
     *  - web_accessible_resources
     *  - content_scripts
     */
    const actionIconSet = new Set<string>();
    const default_icons: string | { [size: string]: string } = get(
        manifest,
        "action.default_icon",
        {} as any,
    );
    if (typeof default_icons === "string") {
        actionIconSet.add(default_icons);
    } else {
        Object.values(default_icons).forEach((x) => actionIconSet.add(x));
    }

    /**
     * image files come from:
     *  - web_accessible_resources
     *  - action.default_icon
     *  - icons
     */
    const img = [
        ...actionIconSet,
        ...web_accessible_resources.filter((f) =>
            /\.(jpe?g|png|svg|tiff?|gif|webp|bmp|ico)$/i.test(f),
        ),
        ...Object.values(get(manifest, "icons", {})),
    ];

    // Files like fonts, things that are not expected
    const others = diff(web_accessible_resources, css, js, html, img);

    return {
        css: validate(css),
        js: validate(js),
        html: validate(html),
        img: validate(img),
        others: validate(others),
    };

    function validate(ary: any[]) {
        return [...new Set(ary.filter(isString))].map((x) =>
            path.join(srcDir, x),
        );
    }

    function isString(x: any): x is string {
        return typeof x === "string";
    }
}
