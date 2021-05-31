import { ChromeExtensionManifestEntries } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { BackgroundProcessor } from "@/modules/background";
import { ContentScriptProcessor } from "@/modules/content-script";
import { DevtoolsProcessor } from "@/modules/devtools";
import { ChromeExtensionManifestEntryMappings } from "@/modules/manifest/cache";
import { ManifestProcessorOptions } from "@/modules/manifest/option";
import { OptionsProcessor } from "@/modules/options";
import { OverrideBookmarksProcessor, OverrideHistoryProcessor, OverrideNewtabProcessor } from "@/modules/override";
import { PopupProcessor } from "@/modules/popup";
import { WebAccessibleResourceProcessor } from "@/modules/web-accessible-resource";
import { UseCase } from "@root/tests/common/usecase";
import { generateManifest } from "@root/tests/__fixtures__/manifests";

const constructorUseCases: UseCase<ManifestProcessorOptions | undefined, any>[] = [{
    description: "undefined options",
    input: undefined,
    output: [],
}, {
    description: "undefined component options",
    input: {
        root: __dirname,
        alias: [],
    },
    output: [],
}, {
    description: "undefined component options",
    input: {
        root: __dirname,
        alias: [],
        components: undefined,
    },
    output: [],
}, {
    description: "empty component options",
    input: {
        root: __dirname,
        alias: [],
        components: {},
    },
    output: [],
}, {
    description: "background component option only",
    input: {
        root: __dirname,
        alias: [],
        components: {
            background: {},
        },
    },
    output: [
        { key: "background", type: BackgroundProcessor.name },
    ],
}, {
    description: "content-script component option: undefined",
    input: {
        root: __dirname,
        alias: [],
        components: {
            contentScripts: undefined,
        },
    },
    output: [],
}, {
    description: "content-script component option: false",
    input: {
        root: __dirname,
        alias: [],
        components: {
            contentScripts: false,
        },
    },
    output: [],
}, {
    description: "content-script component option: true",
    input: {
        root: __dirname,
        alias: [],
        components: {
            contentScripts: true,
        },
    },
    output: [
        { key: "content-script", type: ContentScriptProcessor.name },
    ],
}, {
    description: "content-script component option: {}",
    input: {
        root: __dirname,
        alias: [],
        components: {
            contentScripts: {},
        },
    },
    output: [
        { key: "content-script", type: ContentScriptProcessor.name },
    ],
}, {
    description: "content-script component option: { watch: true }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            contentScripts: {
                watch: true,
            },
        },
    },
    output: [
        { key: "content-script", type: ContentScriptProcessor.name },
    ],
}, {
    description: "popup component option: undefined",
    input: {
        root: __dirname,
        alias: [],
        components: {
            popup: undefined,
        },
    },
    output: [],
}, {
    description: "popup component option: false",
    input: {
        root: __dirname,
        alias: [],
        components: {
            popup: false,
        },
    },
    output: [],
}, {
    description: "popup component option: true",
    input: {
        root: __dirname,
        alias: [],
        components: {
            popup: true,
        },
    },
    output: [
        { key: "popup", type: PopupProcessor.name },
    ],
}, {
    description: "popup component option: {}",
    input: {
        root: __dirname,
        alias: [],
        components: {
            popup: {},
        },
    },
    output: [
        { key: "popup", type: PopupProcessor.name },
    ],
}, {
    description: "popup component option: { watch: true }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            popup: {
                watch: true,
            },
        },
    },
    output: [
        { key: "popup", type: PopupProcessor.name },
    ],
}, {
    description: "options component option: undefined",
    input: {
        root: __dirname,
        alias: [],
        components: {
            options: undefined,
        },
    },
    output: [],
}, {
    description: "options component option: false",
    input: {
        root: __dirname,
        alias: [],
        components: {
            options: false,
        },
    },
    output: [],
}, {
    description: "options component option: true",
    input: {
        root: __dirname,
        alias: [],
        components: {
            options: true,
        },
    },
    output: [
        { key: "options", type: OptionsProcessor.name },
    ],
}, {
    description: "options component option: {}",
    input: {
        root: __dirname,
        alias: [],
        components: {
            options: {},
        },
    },
    output: [
        { key: "options", type: OptionsProcessor.name },
    ],
}, {
    description: "options component option: { watch: true }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            options: {
                watch: true,
            },
        },
    },
    output: [
        { key: "options", type: OptionsProcessor.name },
    ],
}, {
    description: "devtools component option: undefined",
    input: {
        root: __dirname,
        alias: [],
        components: {
            devtools: undefined,
        },
    },
    output: [],
}, {
    description: "devtools component option: false",
    input: {
        root: __dirname,
        alias: [],
        components: {
            devtools: false,
        },
    },
    output: [],
}, {
    description: "devtools component option: true",
    input: {
        root: __dirname,
        alias: [],
        components: {
            devtools: true,
        },
    },
    output: [
        { key: "devtools", type: DevtoolsProcessor.name },
    ],
}, {
    description: "devtools component option: {}",
    input: {
        root: __dirname,
        alias: [],
        components: {
            devtools: {},
        },
    },
    output: [
        { key: "devtools", type: DevtoolsProcessor.name },
    ],
}, {
    description: "devtools component option: { watch: true }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            devtools: {
                watch: true,
            },
        },
    },
    output: [
        { key: "devtools", type: DevtoolsProcessor.name },
    ],
}, {
    description: "override component option: undefined",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: undefined,
        },
    },
    output: [],
}, {
    description: "override component option: false",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: false,
        },
    },
    output: [],
}, {
    description: "override component option: true",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: true,
        },
    },
    output: [
        { key: "bookmarks", type: OverrideBookmarksProcessor.name },
        { key: "history", type: OverrideHistoryProcessor.name },
        { key: "newtab", type: OverrideNewtabProcessor.name },
    ],
}, {
    description: "override component option: {}",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {},
        },
    },
    output: [],
}, {
    description: "override component option: { bookmarks: undefined, history: undefined, newtab: undefined }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                bookmarks: undefined,
                history: undefined,
                newtab: undefined,
            },
        },
    },
    output: [],
}, {
    description: "override component option: { bookmarks: false, history: false, newtab: false }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                bookmarks: false,
                history: false,
                newtab: false,
            },
        },
    },
    output: [],
}, {
    description: "override component option: { bookmarks: true }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                bookmarks: true,
            },
        },
    },
    output: [{ key: "bookmarks", type: OverrideBookmarksProcessor.name }],
}, {
    description: "override component option: { bookmarks: {} }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                bookmarks: {},
            },
        },
    },
    output: [{ key: "bookmarks", type: OverrideBookmarksProcessor.name }],
}, {
    description: "override component option: { bookmarks: { watch: true } }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                bookmarks: { watch: true },
            },
        },
    },
    output: [{ key: "bookmarks", type: OverrideBookmarksProcessor.name }],
}, {
    description: "override component option: { history: true }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                history: true,
            },
        },
    },
    output: [{ key: "history", type: OverrideHistoryProcessor.name }],
}, {
    description: "override component option: { history: {} }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                history: {},
            },
        },
    },
    output: [{ key: "history", type: OverrideHistoryProcessor.name }],
}, {
    description: "override component option: { history: { watch: true } }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                history: { watch: true },
            },
        },
    },
    output: [{ key: "history", type: OverrideHistoryProcessor.name }],
}, {
    description: "override component option: { newtab: true }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                newtab: true,
            },
        },
    },
    output: [{ key: "newtab", type: OverrideNewtabProcessor.name }],
}, {
    description: "override component option: { newtab: {} }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                newtab: {},
            },
        },
    },
    output: [{ key: "newtab", type: OverrideNewtabProcessor.name }],
}, {
    description: "override component option: { newtab: { watch: true } }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            override: {
                newtab: { watch: true },
            },
        },
    },
    output: [{ key: "newtab", type: OverrideNewtabProcessor.name }],
}, {
    description: "web-accessible-resource component option: undefined",
    input: {
        root: __dirname,
        alias: [],
        components: {
            webAccessibleResources: undefined,
        },
    },
    output: [],
}, {
    description: "web-accessible-resource component option: false",
    input: {
        root: __dirname,
        alias: [],
        components: {
            webAccessibleResources: false,
        },
    },
    output: [],
}, {
    description: "web-accessible-resource component option: true",
    input: {
        root: __dirname,
        alias: [],
        components: {
            webAccessibleResources: true,
        },
    },
    output: [
        { key: "web-accessible-resource", type: WebAccessibleResourceProcessor.name },
    ],
}, {
    description: "web-accessible-resource component option: {}",
    input: {
        root: __dirname,
        alias: [],
        components: {
            webAccessibleResources: {},
        },
    },
    output: [
        { key: "web-accessible-resource", type: WebAccessibleResourceProcessor.name },
    ],
}, {
    description: "web-accessible-resource component option: { watch: true }",
    input: {
        root: __dirname,
        alias: [],
        components: {
            webAccessibleResources: {
                watch: true,
            },
        },
    },
    output: [
        { key: "web-accessible-resource", type: WebAccessibleResourceProcessor.name },
    ],
}];

const resolveUseCases: UseCase<ChromeExtensionManifest, ChromeExtensionManifest>[] = [{
    description: "empty manifest",
    input: generateManifest(),
    output: generateManifest(),
}];

const buildUseCases: UseCase<{
    entries: ChromeExtensionManifestEntries,
    mappings: ChromeExtensionManifestEntryMappings,
}, {
    entries: ChromeExtensionManifestEntries,
    mappings: ChromeExtensionManifestEntryMappings,
}>[] = [];

const updateManifestUseCases: UseCase<{
    manifest?: ChromeExtensionManifest,
    bundles: ChromeExtensionManifestEntries,
}, ChromeExtensionManifest|undefined>[] = [{
    description: "undefined manifest",
    input: {
        manifest: undefined,
        bundles: {},
    },
    output: undefined,
}, {
    description: "undefined manifest with bundles",
    input: {
        manifest: undefined,
        bundles: {
            background: {
                entry: "background.ts",
                bundle: "background.js",
                dependencies: [],
            },
        },
    },
    output: undefined,
}, {
    description: "empty manifest",
    input: {
        manifest: generateManifest(),
        bundles: {},
    },
    output: generateManifest(),
}, {
    description: "update background",
    input: {
        manifest: generateManifest({
            background: {
                service_worker: "background.ts",
            },
        }),
        bundles: {
            background: {
                entry: "background.ts",
                bundle: "background.js",
                dependencies: [],
            },
        },
    },
    output: generateManifest({
        background: {
            service_worker: "background.js"
        },
    }),
}, {
    description: "update content script",
    input: {
        manifest: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
                js: ["content_script.ts"],
            }],
        }),
        bundles: {
            "content-script": [{
                entry: "content_script.ts",
                bundle: "content_script.js",
                dependencies: [],
            }],
        },
    },
    output: generateManifest({
        content_scripts: [{
            matches: ["all_urls"],
            js: ["content_script.js"],
        }],
    }),
}, {
    description: "update content scripts",
    input: {
        manifest: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
                js: ["content_script1.ts", "content_script2.ts"],
            }],
        }),
        bundles: {
            "content-script": [{
                entry: "content_script2.ts",
                bundle: "content_script2.js",
                dependencies: [],
            }, {
                entry: "content_script1.ts",
                bundle: "content_script1.js",
                dependencies: [],
            }],
        },
    },
    output: generateManifest({
        content_scripts: [{
            matches: ["all_urls"],
            js: ["content_script1.js", "content_script2.js"],
        }],
    }),
}, {
    description: "update content script groups",
    input: {
        manifest: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
                js: ["content_script1.ts"],
            }, {
                matches: ["all_urls"],
                js: ["content_script2.ts"],
            }],
        }),
        bundles: {
            "content-script": [{
                entry: "content_script2.ts",
                bundle: "content_script2.js",
                dependencies: [],
            }, {
                entry: "content_script1.ts",
                bundle: "content_script1.js",
                dependencies: [],
            }],
        },
    },
    output: generateManifest({
        content_scripts: [{
            matches: ["all_urls"],
            js: ["content_script1.js"],
        }, {
            matches: ["all_urls"],
            js: ["content_script2.js"],
        }],
    }),
}, {
    description: "update popup",
    input: {
        manifest: generateManifest({
            action: {
                default_popup: "popup.ts",
            },
        }),
        bundles: {
            popup: {
                entry: "popup.ts",
                bundle: "popup.js",
                dependencies: [],
            },
        },
    },
    output: generateManifest({
        action: {
            default_popup: "popup.js",
        },
    }),
}, {
    description: "update options page",
    input: {
        manifest: generateManifest({
            options_page: "options_page.ts"
        }),
        bundles: {
            options: {
                entry: "options_page.ts",
                bundle: "options_page.js",
                dependencies: [],
            },
        },
    },
    output: generateManifest({
        options_page: "options_page.js",
    }),
}, {
    description: "update options ui",
    input: {
        manifest: generateManifest({
            options_ui: {
                page: "options_ui.ts",
            },
        }),
        bundles: {
            options: {
                entry: "options_ui.ts",
                bundle: "options_ui.js",
                dependencies: [],
            },
        },
    },
    output: generateManifest({
        options_ui: {
            page: "options_ui.js",
        },
    }),
}, {
    description: "update devtools",
    input: {
        manifest: generateManifest({
            devtools_page: "devtools.ts",
        }),
        bundles: {
            devtools: {
                entry: "devtools.ts",
                bundle: "devtools.js",
                dependencies: [],
            },
        },
    },
    output: generateManifest({
        devtools_page: "devtools.js",
    }),
}, {
    description: "update bookmarks",
    input: {
        manifest: generateManifest({
            chrome_url_overrides: {
                bookmarks: "bookmarks.ts",
            },
        }),
        bundles: {
            bookmarks: {
                entry: "bookmarks.ts",
                bundle: "bookmarks.js",
                dependencies: [],
            },
        },
    },
    output: generateManifest({
        chrome_url_overrides: {
            bookmarks: "bookmarks.js",
        },
    }),
}, {
    description: "update history",
    input: {
        manifest: generateManifest({
            chrome_url_overrides: {
                history: "history.ts",
            },
        }),
        bundles: {
            history: {
                entry: "history.ts",
                bundle: "history.js",
                dependencies: [],
            },
        },
    },
    output: generateManifest({
        chrome_url_overrides: {
            history: "history.js",
        },
    }),
}, {
    description: "update newtab",
    input: {
        manifest: generateManifest({
            chrome_url_overrides: {
                newtab: "newtab.ts",
            },
        }),
        bundles: {
            newtab: {
                entry: "newtab.ts",
                bundle: "newtab.js",
                dependencies: [],
            },
        },
    },
    output: generateManifest({
        chrome_url_overrides: {
            newtab: "newtab.js",
        },
    }),
}, {
    description: "update web accessible resource",
    input: {
        manifest: generateManifest({
            web_accessible_resources: [{
                matches: ["all_urls"],
                resources: ["web_accessible_resources.ts"],
            }],
        }),
        bundles: {
            "web-accessible-resource": [{
                entry: "web_accessible_resources.ts",
                bundle: "web_accessible_resources.js",
                dependencies: [],
            }],
        },
    },
    output: generateManifest({
        web_accessible_resources: [{
            matches: ["all_urls"],
            resources: ["web_accessible_resources.js"],
        }],
    }),
}, {
    description: "update web accessible resources",
    input: {
        manifest: generateManifest({
            web_accessible_resources: [{
                matches: ["all_urls"],
                resources: ["web_accessible_resources1.ts", "web_accessible_resources2.ts"],
            }],
        }),
        bundles: {
            "web-accessible-resource": [{
                entry: "web_accessible_resources2.ts",
                bundle: "web_accessible_resources2.js",
                dependencies: [],
            }, {
                entry: "web_accessible_resources1.ts",
                bundle: "web_accessible_resources1.js",
                dependencies: [],
            }],
        },
    },
    output: generateManifest({
        web_accessible_resources: [{
            matches: ["all_urls"],
            resources: ["web_accessible_resources1.js", "web_accessible_resources2.js"],
        }],
    }),
}, {
    description: "update web accessible resource groups",
    input: {
        manifest: generateManifest({
            web_accessible_resources: [{
                matches: ["all_urls"],
                resources: ["web_accessible_resources1.ts"],
            }, {
                matches: ["all_urls"],
                resources: ["web_accessible_resources2.ts"],
            }],
        }),
        bundles: {
            "web-accessible-resource": [{
                entry: "web_accessible_resources2.ts",
                bundle: "web_accessible_resources2.js",
                dependencies: [],
            }, {
                entry: "web_accessible_resources1.ts",
                bundle: "web_accessible_resources1.js",
                dependencies: [],
            }],
        },
    },
    output: generateManifest({
        web_accessible_resources: [{
            matches: ["all_urls"],
            resources: ["web_accessible_resources1.js"],
        }, {
            matches: ["all_urls"],
            resources: ["web_accessible_resources2.js"],
        }],
    }),
}];

export default {
    constructor: constructorUseCases,
    resolve: resolveUseCases,
    build: buildUseCases,
    updateManifest: updateManifestUseCases,
}
