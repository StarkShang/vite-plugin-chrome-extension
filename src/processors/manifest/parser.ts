import glob from "glob";
import get from "lodash.get";
import diff from "lodash.difference";
import path from "path";

import {
    ChromeExtensionManifest,
    ContentScript,
    WebAccessibleResource,
} from "../../manifest";

export interface ChromeExtensionManifestEntries {
    background?: string;
    content_scripts?: string[];
    options_page?: string;
    options_ui?: string;
    popup?: string;
    override?: { bookmarks?:string, history?:string, newtab?:string };
    devtools?: string;
    web_accessible_resources?: string[];
}

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

/* -------------------------------------------- */
/*                 DERIVE FILES                 */
/* -------------------------------------------- */

export class ChromeExtensionManifestParser {
    public entries(manifest: ChromeExtensionManifest, srcPath: string): ChromeExtensionManifestEntries {
        const entries: ChromeExtensionManifestEntries = {};
        // background service worker
        const background = this.backgroundEntry(manifest, srcPath);
        background && (entries.background = background);
        // content scripts
        const content_scripts = this.contentScriptEntries(manifest, srcPath);
        content_scripts && (entries.content_scripts = content_scripts);
        // options page
        const options_page = this.optionsPageEntry(manifest, srcPath)
        options_page && (entries.options_page = options_page);
        // options ui
        const options_ui = this.optionsUiEntry(manifest, srcPath);
        options_ui && (entries.options_ui = options_ui);
        // popup
        const popup = this.popupEntry(manifest, srcPath);
        popup && (entries.popup = popup);
        // override
        const override = this.overrideEntries(manifest, srcPath);
        override && (entries.override = override);
        // TODO: standalone
        // devtools
        const devtools = this.devtoolsEntry(manifest, srcPath);
        devtools && (entries.devtools = devtools);
        // web accessible resources
        const web_accessible_resources = this.webAccessibleResourceEntries(manifest, srcPath);
        web_accessible_resources && (entries.web_accessible_resources = web_accessible_resources);
        return entries;
    }

    public diffEntries(
        last: ChromeExtensionManifestEntries,
        current: ChromeExtensionManifestEntries,
    ): ChromeExtensionManifestEntriesDiff {
        const result: ChromeExtensionManifestEntriesDiff = {};
        // background
        const background = this.diffSingleEntryComponent(last.background, current.background);
        background && (result.background = background);
        // content_scripts
        const content_scripts = this.diffArrayEntriesComponent(last.content_scripts, current.content_scripts);
        if (content_scripts) {
            const content_scripts_diff: any = {};
            content_scripts.create && content_scripts.create.length > 0 && (content_scripts_diff.create = content_scripts.create);
            content_scripts.delete && content_scripts.delete.length > 0 && (content_scripts_diff.delete = content_scripts.delete);
            (Object.keys(content_scripts_diff).length > 0) && (result.content_scripts = content_scripts_diff);
        }
        // options_page
        const options_page = this.diffSingleEntryComponent(last.options_page, current.options_page);
        options_page && (result.options_page = options_page);
        // options_ui
        const options_ui = this.diffSingleEntryComponent(last.options_ui, current.options_ui);
        options_ui && (result.options_ui = options_ui);
        // popup
        const popup = this.diffSingleEntryComponent(last.popup, current.popup);
        popup && (result.popup = popup);
        // override
        const bookmarks = this.diffSingleEntryComponent(last.override?.bookmarks, current.override?.bookmarks);
        const history = this.diffSingleEntryComponent(last.override?.history, current.override?.history);
        const newtab = this.diffSingleEntryComponent(last.override?.newtab, current.override?.newtab);
        const override: any = {};
        bookmarks && (override.bookmarks = bookmarks);
        history && (override.history = history);
        newtab && (override.newtab = newtab);
        (Object.keys(override).length > 0) && (result.override = override);
        // devtools
        const devtools = this.diffSingleEntryComponent(last.devtools, current.devtools);
        devtools && (result.devtools = devtools);
        // web_accessible_resources
        const web_accessible_resources = this.diffArrayEntriesComponent(last.web_accessible_resources, current.web_accessible_resources);
        if (web_accessible_resources) {
            const web_accessible_resources_diff: any = {};
            web_accessible_resources.create && web_accessible_resources.create.length > 0 && (web_accessible_resources_diff.create = web_accessible_resources.create);
            web_accessible_resources.delete && web_accessible_resources.delete.length > 0 && (web_accessible_resources_diff.delete = web_accessible_resources.delete);
            (Object.keys(web_accessible_resources_diff).length > 0) && (result.web_accessible_resources = web_accessible_resources_diff);
        }
        return result;
    }

    public static entriesToDiff(entries: ChromeExtensionManifestEntries): ChromeExtensionManifestEntriesDiff {
        return {
            background: entries.background ? { status: "create", entry: entries.background } : undefined,
            content_scripts: entries.content_scripts ? { create: entries.content_scripts } : undefined,
            options_page: entries.options_page ? { status: "create", entry: entries.options_page } : undefined,
            options_ui: entries.options_ui ? { status: "create", entry: entries.options_ui } : undefined,
            popup: entries.popup ? { status: "create", entry: entries.popup } : undefined,
            devtools: entries.devtools ? { status: "create", entry: entries.devtools } : undefined,
            override: entries.override ? {
                bookmarks: entries.override.bookmarks ? { status: "create", entry: entries.override.bookmarks } : undefined,
                history: entries.override.history ? { status: "create", entry: entries.override.history } : undefined,
                newtab: entries.override.newtab ? { status: "create", entry: entries.override.newtab } : undefined,
            } : undefined,
            web_accessible_resources: entries.web_accessible_resources ? { create: entries.web_accessible_resources } : undefined,
        }
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

    public backgroundEntry(manifest: ChromeExtensionManifest, srcPath: string) {
        return (manifest.background && manifest.background.service_worker)
            ? path.resolve(srcPath, manifest.background.service_worker)
            : undefined;
    }

    public contentScriptEntries(manifest: ChromeExtensionManifest, srcPath: string) {
        const scripts = manifest.content_scripts?.map(script => script.js || [])
            .reduce((arr, item) => arr.concat(item), [])
            .map(script => path.resolve(srcPath, script));
        return scripts && scripts.length <= 0 ? undefined : scripts;
    }

    public optionsPageEntry(manifest: ChromeExtensionManifest, srcPath: string) {
        return manifest.options_page ? path.resolve(srcPath, manifest.options_page) : undefined;
    }

    public optionsUiEntry(manifest: ChromeExtensionManifest, srcPath: string) {
        return manifest.options_ui ? path.resolve(srcPath, manifest.options_ui.page) : undefined;
    }

    public popupEntry(manifest: ChromeExtensionManifest, srcPath: string) {
        return manifest.action?.default_popup ? path.resolve(srcPath, manifest.action.default_popup) : undefined;
    }

    public overrideEntries(manifest: ChromeExtensionManifest, srcPath: string) {
        if (!manifest.chrome_url_overrides) { return undefined; }
        const override: any = {};
        manifest.chrome_url_overrides.bookmarks && (override.bookmarks = path.resolve(srcPath, manifest.chrome_url_overrides.bookmarks));
        manifest.chrome_url_overrides.history && (override.history = path.resolve(srcPath, manifest.chrome_url_overrides.history));
        manifest.chrome_url_overrides.newtab && (override.history = path.resolve(srcPath, manifest.chrome_url_overrides.newtab));
        return Object.keys(override).length > 0 ? override : undefined;
    }

    public standaloneEntry(manifest: ChromeExtensionManifest, srcPath: string) {
        // TODO: add standalone entry parser
    }

    public devtoolsEntry(manifest: ChromeExtensionManifest, srcPath: string) {
        return manifest.devtools_page ? path.resolve(srcPath, manifest.devtools_page) : undefined;
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
