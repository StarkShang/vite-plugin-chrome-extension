import { NormalizedChromeExtensionOptions } from "@/configs/options";
import { BackgroundProcesser } from "@/modules/background";
import { ContentScriptProcessor } from "@/modules/content-script";
import { DevtoolsProcessor } from "@/modules/devtools";
import { OptionsProcessor } from "@/modules/options";
import { OverrideBookmarksProcessor, OverrideHistoryProcessor, OverrideNewtabProcessor } from "@/modules/override";
import { PopupProcessor } from "@/modules/popup";
import { WebAccessibleResourceProcessor } from "@/modules/web-accessible-resource";
import { UseCase } from "@root/tests/common/usecase";

const constructor: UseCase<NormalizedChromeExtensionOptions | undefined, any>[] = [{
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
        { key: "background", type: BackgroundProcesser.name },
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

export default {
    constructor,
}
