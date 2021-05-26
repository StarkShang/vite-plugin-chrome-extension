import { NormalizedChromeExtensionOptions } from "@/configs/options";
import { ChromeExtensionManifest } from "@/manifest";
import { BackgroundProcessor } from "@/modules/background";
import { ContentScriptProcessor } from "@/modules/content-script";
import { DevtoolsProcessor } from "@/modules/devtools";
import { ChromeExtensionManifestEntryMapping, ChromeExtensionManifestEntryMappings } from "@/modules/manifest/cache";
import { ChromeExtensionManifestEntries } from "@/modules/manifest/parser";
import { OptionsProcessor } from "@/modules/options";
import { OverrideBookmarksProcessor, OverrideHistoryProcessor, OverrideNewtabProcessor } from "@/modules/override";
import { PopupProcessor } from "@/modules/popup";
import { WebAccessibleResourceProcessor } from "@/modules/web-accessible-resource";
import { UseCase } from "@root/tests/common/usecase";
import { generateManifest } from "@root/tests/__fixtures__/manifests";

const constructorUseCases: UseCase<NormalizedChromeExtensionOptions | undefined, any>[] = [{
    description: "undefined options",
    input: undefined,
    output: [],
}, {
    description: "undefined component options",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
    },
    output: [],
}, {
    description: "undefined component options",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: undefined,
    },
    output: [],
}, {
    description: "empty component options",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {},
    },
    output: [],
}, {
    description: "background component option only",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            background: { rootPath: __dirname },
        },
    },
    output: [
        { key: "background", type: BackgroundProcessor.name },
    ],
}, {
    description: "content-script component option: undefined",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            contentScripts: undefined,
        },
    },
    output: [],
}, {
    description: "content-script component option: false",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            contentScripts: false,
        },
    },
    output: [],
}, {
    description: "content-script component option: true",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            popup: undefined,
        },
    },
    output: [],
}, {
    description: "popup component option: false",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            popup: false,
        },
    },
    output: [],
}, {
    description: "popup component option: true",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            options: undefined,
        },
    },
    output: [],
}, {
    description: "options component option: false",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            options: false,
        },
    },
    output: [],
}, {
    description: "options component option: true",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            devtools: undefined,
        },
    },
    output: [],
}, {
    description: "devtools component option: false",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            devtools: false,
        },
    },
    output: [],
}, {
    description: "devtools component option: true",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            override: undefined,
        },
    },
    output: [],
}, {
    description: "override component option: false",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            override: false,
        },
    },
    output: [],
}, {
    description: "override component option: true",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            override: {},
        },
    },
    output: [],
}, {
    description: "override component option: { bookmarks: undefined, history: undefined, newtab: undefined }",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            webAccessibleResources: undefined,
        },
    },
    output: [],
}, {
    description: "web-accessible-resource component option: false",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
        components: {
            webAccessibleResources: false,
        },
    },
    output: [],
}, {
    description: "web-accessible-resource component option: true",
    input: {
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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
        rootPath: __dirname,
        manifestPath: __dirname,
        watch: false,
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

const resolveUseCases: UseCase<ChromeExtensionManifest, {
    manifest: ChromeExtensionManifest,
    entries: ChromeExtensionManifestEntries
}>[] = [{
    description: "empty entries",
    input: generateManifest(),
    output: {
        manifest: generateManifest(),
        entries: [],
    },
}, {
    description: "background entry",
    input: generateManifest({
        background: { service_worker: "background.ts" }
    }),
    output: {
        manifest: generateManifest({
            background: { service_worker: "background.ts" }
        }),
        entries: [{
            key: "background:background.ts",
            type: "background",
            module: "background.ts",
        }],
    },
}, {
    description: "content-scripts entry",
    input: generateManifest({
        content_scripts: [{
            matches: ["all_urls"],
            js: ["content_script.ts"]
        }],
    }),
    output: {
        manifest: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
                js: ["content_script.ts"]
            }],
        }),
        entries: [{
            key: "content-script:content_script.ts",
            type: "content-script",
            module: "content_script.ts",
        }],
    },
}, {
    description: "options-page entry",
    input: generateManifest({
        options_page: "options_page.ts",
    }),
    output: {
        manifest: generateManifest({
            options_page: "options_page.ts",
        }),
        entries: [{
            key: "options-page:options_page.ts",
            type: "options-page",
            module: "options_page.ts",
        }],
    },
}, {
    description: "options-ui entry",
    input: generateManifest({
        options_ui: {
            page: "options_ui.ts",
        },
    }),
    output: {
        manifest: generateManifest({
            options_ui: {
                page: "options_ui.ts",
            },
        }),
        entries: [{
            key: "options-ui:options_ui.ts",
            type: "options-ui",
            module: "options_ui.ts",
        }],
    },
}, {
    description: "popup entry",
    input: generateManifest({
        action: {
            default_popup: "popup.ts",
        },
    }),
    output: {
        manifest: generateManifest({
            action: {
                default_popup: "popup.ts",
            },
        }),
        entries: [{
            key: "popup:popup.ts",
            type: "popup",
            module: "popup.ts",
        }],
    },
}, {
    description: "bookmarks entry",
    input: generateManifest({
        chrome_url_overrides: {
            bookmarks: "bookmarks.ts",
        },
    }),
    output: {
        manifest: generateManifest({
            chrome_url_overrides: {
                bookmarks: "bookmarks.ts",
            },
        }),
        entries: [{
            key: "bookmarks:bookmarks.ts",
            type: "bookmarks",
            module: "bookmarks.ts",
        }],
    },
}, {
    description: "history entry",
    input: generateManifest({
        chrome_url_overrides: {
            history: "history.ts",
        },
    }),
    output: {
        manifest: generateManifest({
            chrome_url_overrides:{
                history: "history.ts",
            },
        }),
        entries: [{
            key: "history:history.ts",
            type: "history",
            module: "history.ts",
        }],
    },
}, {
    description: "newtab entry",
    input: generateManifest({
        chrome_url_overrides: {
            newtab: "newtab.ts",
        },
    }),
    output: {
        manifest: generateManifest({
            chrome_url_overrides: {
                newtab: "newtab.ts",
            },
        }),
        entries: [{
            key: "newtab:newtab.ts",
            type: "newtab",
            module: "newtab.ts",
        }],
    },
}, {
    description: "devtools entry",
    input: generateManifest({
        devtools_page: "devtools.ts",
    }),
    output: {
        manifest: generateManifest({
            devtools_page: "devtools.ts",
        }),
        entries: [{
            key: "devtools:devtools.ts",
            type: "devtools",
            module: "devtools.ts",
        }],
    },
}, {
    description: "web-accessible-resources entry",
    input: generateManifest({
        web_accessible_resources: [{
            matches: ["all_urls"],
            resources: ["web_accessible_resource.ts"],
        }],
    }),
    output: {
        manifest: generateManifest({
            web_accessible_resources: [{
                matches: ["all_urls"],
                resources: ["web_accessible_resource.ts"],
            }],
        }),
        entries: [{
            key: "web-accessible-resource:web_accessible_resource.ts",
            type: "web-accessible-resource",
            module: "web_accessible_resource.ts",
        }],
    },
}];

const buildUseCases: UseCase<{
    entries: ChromeExtensionManifestEntries,
    mappings: ChromeExtensionManifestEntryMappings,
}, {
    entries: ChromeExtensionManifestEntries,
    mappings: ChromeExtensionManifestEntryMappings,
}>[] = [{
    description: "empty entries",
    input: {
        entries: [],
        mappings: new Map<string, ChromeExtensionManifestEntryMapping>(),
    },
    output: {
        entries: [],
        mappings: new Map<string, ChromeExtensionManifestEntryMapping>(),
    },
}];

export default {
    constructor: constructorUseCases,
    resolve: resolveUseCases,
    build: buildUseCases,
}
