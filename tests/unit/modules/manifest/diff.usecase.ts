import { ChromeExtensionManifest, ContentScript } from "@/manifest";
import { ChromeExtensionManifestContentScriptPatch, ChromeExtensionManifestPatch } from "@/modules/manifest/types";
import { UseCase } from "@root/tests/common/usecase";
import { generateManifest } from "@root/tests/__fixtures__/manifests";

const diffBackgroundUseCases: UseCase<{
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
}, ChromeExtensionManifestPatch>[] = [{
    description: "undefined background",
    input: {
        current: generateManifest({ background: undefined }),
        last: generateManifest({ background: undefined }),
    },
    output: {},
}, {
    description: "create background",
    input: {
        current: generateManifest({ background: { service_worker: "background.js" } }),
        last: generateManifest({ background: undefined }),
    },
    output: {
        background: {
            service_work: { before: undefined, after: "background.js" },
        },
    },
}, {
    description: "delete background",
    input: {
        current: generateManifest({ background: undefined }),
        last: generateManifest({ background: { service_worker: "background.js" } }),
    },
    output: {
        background: {
            service_work: { before: "background.js", after: undefined },
        },
    },
}, {
    description: "update background",
    input: {
        current: generateManifest({ background: { service_worker: "background2.js" } }),
        last: generateManifest({ background: { service_worker: "background1.js" } }),
    },
    output: {
        background: {
            service_work: { before: "background1.js", after: "background2.js" },
        },
    },
}];

const diffContentScriptEmptyUseCases: {
    current?: ContentScript,
    last?: ContentScript,
}[] = [{}, {
    current: undefined,
},{
    last: undefined,
}, {
    current: undefined,
    last: undefined,
}, {
    current: { matches: ["<all_urls>"] },
    last: { matches: ["<all_urls>"] },
}, {
    current: {
        matches: ["<all_urls>"],
        js: undefined,
    },
    last: {
        matches: ["<all_urls>"],
    },
}, {
    current: {
        matches: ["<all_urls>"],
        js: [],
    },
    last: {
        matches: ["<all_urls>"],
    },
}, {
    current: {
        matches: ["<all_urls>"],
        js: [],
    },
    last: {
        matches: ["<all_urls>"],
        js: [],
    },
}, {
    current: {
        matches: ["<all_urls>"],
        css: undefined,
    },
    last: {
        matches: ["<all_urls>"],
    },
}, {
    current: {
        matches: ["<all_urls>"],
        css: [],
    },
    last: {
        matches: ["<all_urls>"],
    },
}, {
    current: {
        matches: ["<all_urls>"],
        css: [],
    },
    last: {
        matches: ["<all_urls>"],
        css: [],
    },
}, {
    current: {
        matches: ["<all_urls>"],
        match_about_blank: undefined,
    },
    last: {
        matches: ["<all_urls>"],
    },
}, {
    current: {
        matches: ["<all_urls>"],
        match_about_blank: undefined,
    },
    last: {
        matches: ["<all_urls>"],
        match_about_blank: undefined,
    },
}, {
    current: {
        matches: ["<all_urls>"],
        match_about_blank: true,
    },
    last: {
        matches: ["<all_urls>"],
        match_about_blank: true,
    },
}, {
    current: {
        matches: ["<all_urls>"],
        match_about_blank: false,
    },
    last: {
        matches: ["<all_urls>"],
        match_about_blank: false,
    },
}];

const diffContentScriptUseCases: UseCase<{
    current?: ContentScript,
    last?: ContentScript
}, ChromeExtensionManifestContentScriptPatch | undefined>[] = [{
    description: "add content_script entry",
    input: {
        current: {
            matches: ["<all_urls>"],
        },
        last: undefined,
    },
    output: {
        matches: [{
            before: undefined,
            after: "<all_urls>",
        }],
    },
}, {
    description: "add js: undefined to [content_script.js]",
    input: {
        current: {
            matches: ["<all_urls>"],
            js: ["content_script.js"],
        },
        last: {
            matches: ["<all_urls>"],
        },
    },
    output: {
        js: [{
            before: undefined,
            after: "content_script.js",
        }],
    },
}, {
    description: "add js: [] to [content_script.js]",
    input: {
        current: {
            matches: ["<all_urls>"],
            js: ["content_script.js"],
        },
        last: {
            matches: ["<all_urls>"],
            js: [],
        },
    },
    output: {
        js: [{
            before: undefined,
            after: "content_script.js",
        }],
    },
}, {
    description: "add js: [content_script1.js] to [content_script1.js, content_script2.js]",
    input: {
        current: {
            matches: ["<all_urls>"],
            js: ["content_script1.js", "content_script2.js"],
        },
        last: {
            matches: ["<all_urls>"],
            js: ["content_script1.js"],
        },
    },
    output: {
        js: [{
            before: undefined,
            after: "content_script2.js",
        }],
    },
}, {
    description: "add js: [content_script1.js] to [content_script1.js, content_script2.js, content_script3.js]",
    input: {
        current: {
            matches: ["<all_urls>"],
            js: [
                "content_script1.js",
                "content_script2.js",
                "content_script3.js",
            ],
        },
        last: {
            matches: ["<all_urls>"],
            js: ["content_script1.js"],
        },
    },
    output: {
        js: [{
            before: undefined,
            after: "content_script2.js",
        }, {
            before: undefined,
            after: "content_script3.js",
        }],
    },
}, {
    description: "delete js: [content_script.js] to undefined",
    input: {
        current: {
            matches: ["<all_urls>"],
        },
        last: {
            matches: ["<all_urls>"],
            js: ["content_script.js"],
        },
    },
    output: {
        js: [{
            before: "content_script.js",
            after: undefined,
        }],
    },
}, {
    description: "delete js: [content_script.js] to []",
    input: {
        current: {
            matches: ["<all_urls>"],
            js: [],
        },
        last: {
            matches: ["<all_urls>"],
            js: ["content_script.js"],
        },
    },
    output: {
        js: [{
            before: "content_script.js",
            after: undefined,
        }],
    },
}, {
    description: "delete js: [content_script1.js, content_script2.js] to [content_script1.js]",
    input: {
        current: {
            matches: ["<all_urls>"],
            js: ["content_script1.js"],
        },
        last: {
            matches: ["<all_urls>"],
            js: ["content_script1.js", "content_script2.js"],
        },
    },
    output: {
        js: [{
            before: "content_script2.js",
            after: undefined,
        }],
    },
}, {
    description: "delete js: [content_script1.js, content_script2.js, content_script3.js] to [content_script1.js]",
    input: {
        current: {
            matches: ["<all_urls>"],
            js: ["content_script1.js"],
        },
        last: {
            matches: ["<all_urls>"],
            js: [
                "content_script1.js",
                "content_script2.js",
                "content_script3.js",
            ],
        },
    },
    output: {
        js: [{
            before: "content_script2.js",
            after: undefined,
        }, {
            before: "content_script3.js",
            after: undefined,
        }],
    },
}, {
    description: "add css: undefined to [content_script.css]",
    input: {
        current: {
            matches: ["<all_urls>"],
            css: ["content_script.css"],
        },
        last: {
            matches: ["<all_urls>"],
        },
    },
    output: {
        css: [{
            before: undefined,
            after: "content_script.css",
        }],
    },
}, {
    description: "add css: [] to [content_script.css]",
    input: {
        current: {
            matches: ["<all_urls>"],
            css: ["content_script.css"],
        },
        last: {
            matches: ["<all_urls>"],
            css: [],
        },
    },
    output: {
        css: [{
            before: undefined,
            after: "content_script.css",
        }],
    },
}, {
    description: "add css: [content_script1.css] to [content_script1.css, content_script2.css]",
    input: {
        current: {
            matches: ["<all_urls>"],
            css: ["content_script1.css", "content_script2.css"],
        },
        last: {
            matches: ["<all_urls>"],
            css: ["content_script1.css"],
        },
    },
    output: {
        css: [{
            before: undefined,
            after: "content_script2.css",
        }],
    },
}, {
    description: "add css: [content_script1.css] to [content_script1.css, content_script2.css, content_script3.css]",
    input: {
        current: {
            matches: ["<all_urls>"],
            css: ["content_script1.css", "content_script2.css", "content_script3.css"],
        },
        last: {
            matches: ["<all_urls>"],
            css: ["content_script1.css"],
        },
    },
    output: {
        css: [{
            before: undefined,
            after: "content_script2.css",
        }, {
            before: undefined,
            after: "content_script3.css",
        }],
    },
}, {
    description: "delete css: [content_script.css] to undefined",
    input: {
        current: {
            matches: ["<all_urls>"],
        },
        last: {
            matches: ["<all_urls>"],
            css: ["content_script.css"],
        },
    },
    output: {
        css: [{
            before: "content_script.css",
            after: undefined,
        }],
    },
}, {
    description: "delete css: [content_script.css] to []",
    input: {
        current: {
            matches: ["<all_urls>"],
            css: [],
        },
        last: {
            matches: ["<all_urls>"],
            css: ["content_script.css"],
        },
    },
    output: {
        css: [{
            before: "content_script.css",
            after: undefined,
        }],
    },
}, {
    description: "delete css: [content_script1.css, content_script2.css] to [content_script1.css]",
    input: {
        current: {
            matches: ["<all_urls>"],
            css: ["content_script1.css"],
        },
        last: {
            matches: ["<all_urls>"],
            css: ["content_script1.css", "content_script2.css"],
        },
    },
    output: {
        css: [{
            before: "content_script2.css",
            after: undefined,
        }],
    },
}, {
    description: "delete css: [content_script1.css, content_script2.css, content_script3.css] to [content_script1.css]",
    input: {
        current: {
            matches: ["<all_urls>"],
            css: ["content_script1.css"],
        },
        last: {
            matches: ["<all_urls>"],
            css: ["content_script1.css", "content_script2.css", "content_script3.css"],
        },
    },
    output: {
        css: [{
            before: "content_script2.css",
            after: undefined,
        }, {
            before: "content_script3.css",
            after: undefined,
        }],
    },
}, {
    description: "add matches: [<all_urls>] to [<all_urls>, https://**/*]",
    input: {
        current: {
            matches: ["<all_urls>", "https://**/*"],
        },
        last: {
            matches: ["<all_urls>"],
        },
    },
    output: {
        matches: [{
            before: undefined,
            after: "https://**/*",
        }],
    },
}, {
    description: "add matches: [<all_urls>] to [<all_urls>, https://**/*, https://*/google.com]",
    input: {
        current: {
            matches: ["<all_urls>", "https://**/*", "https://*/google.com"],
        },
        last: {
            matches: ["<all_urls>"],
        },
    },
    output: {
        matches: [{
            before: undefined,
            after: "https://**/*",
        }, {
            before: undefined,
            after: "https://*/google.com",
        }],
    },
}, {
    description: "delete matches: [<all_urls>, https://**/*] to [<all_urls>]",
    input: {
        current: {
            matches: ["<all_urls>"],
        },
        last: {
            matches: ["<all_urls>", "https://**/*"],
        },
    },
    output: {
        matches: [{
            before: "https://**/*",
            after: undefined,
        }],
    },
}, {
    description: "delete matches: [<all_urls>, https://**/*, https://*/google.com] to [<all_urls>]",
    input: {
        current: {
            matches: ["<all_urls>"],
        },
        last: {
            matches: ["<all_urls>", "https://**/*", "https://*/google.com"],
        },
    },
    output: {
        matches: [{
            before: "https://**/*",
            after: undefined,
        }, {
            before: "https://*/google.com",
            after: undefined,
        }],
    },
}, {
    description: "change match_about_blank: undefined to true",
    input: {
        current: {
            matches: ["<all_urls>"],
            match_about_blank: true,
        },
        last: {
            matches: ["<all_urls>"],
        },
    },
    output: {
        match_about_blank: {
            before: undefined,
            after: true,
        },
    },
}, {
    description: "change match_about_blank: undefined to false",
    input: {
        current: {
            matches: ["<all_urls>"],
            match_about_blank: false,
        },
        last: {
            matches: ["<all_urls>"],
        },
    },
    output: {
        match_about_blank: {
            before: undefined,
            after: false,
        },
    },
}, {
    description: "change match_about_blank: true to undefined",
    input: {
        current: {
            matches: ["<all_urls>"],
        },
        last: {
            matches: ["<all_urls>"],
            match_about_blank: true,
        },
    },
    output: {
        match_about_blank: {
            before: true,
            after: undefined,
        },
    },
}, {
    description: "change match_about_blank: false to undefined",
    input: {
        current: {
            matches: ["<all_urls>"],
        },
        last: {
            matches: ["<all_urls>"],
            match_about_blank: false,
        },
    },
    output: {
        match_about_blank: {
            before: false,
            after: undefined,
        },
    },
}, {
    description: "change match_about_blank: true to false",
    input: {
        current: {
            matches: ["<all_urls>"],
            match_about_blank: false,
        },
        last: {
            matches: ["<all_urls>"],
            match_about_blank: true,
        },
    },
    output: {
        match_about_blank: {
            before: true,
            after: false,
        },
    },
}, {
    description: "change match_about_blank: false to true",
    input: {
        current: {
            matches: ["<all_urls>"],
            match_about_blank: true,
        },
        last: {
            matches: ["<all_urls>"],
            match_about_blank: false,
        },
    },
    output: {
        match_about_blank: {
            before: false,
            after: true,
        },
    },
}];

const diffContentScriptsUseCases: UseCase<{
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
}, ChromeExtensionManifestPatch>[] = [{
    description: "no content scripts",
    input: {
        current: generateManifest(),
        last: generateManifest(),
    },
    output: {}
}, {
    description: "undefined content scripts",
    input: {
        current: generateManifest({ content_scripts: undefined }),
        last: generateManifest({ content_scripts: undefined }),
    },
    output: {}
}, {
    description: "empty js, css and undefined match_about_blank",
    input: {
        current: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
                js: [],
                css: [],
                match_about_blank: undefined,
            }],
        }),
        last: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
            }],
        }),
    },
    output: {}
}, {
    description: "add: only matches",
    input: {
        current: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
            }],
        }),
        last: generateManifest(),
    },
    output: {
        content_scripts: [{
            matches: [{
                before: undefined,
                after: "all_urls",
            }],
        }],
    }
}, {
    description: "add: empty js, css and undefined match_about_blank",
    input: {
        current: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
                js: [],
                css: [],
                match_about_blank: undefined,
            }],
        }),
        last: generateManifest(),
    },
    output: {
        content_scripts: [{
            matches: [{
                before: undefined,
                after: "all_urls",
            }],
        }],
    }
}, {
    description: "add: js, css, match_about_blank",
    input: {
        current: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
                js: ["content_script.js"],
                css: ["content_script.css"],
                match_about_blank: true,
            }],
        }),
        last: generateManifest(),
    },
    output: {
        content_scripts: [{
            matches: [{
                before: undefined,
                after: "all_urls",
            }],
            js: [{
                before: undefined,
                after: "content_script.js",
            }],
            css: [{
                before: undefined,
                after: "content_script.css",
            }],
            match_about_blank: {
                before: undefined,
                after: true,
            },
        }],
    },
}, {
    description: "append: js, css, change match_about_blank",
    input: {
        current: generateManifest({
            content_scripts: [{
                matches: ["all_urls", "https://google.com"],
                js: ["content_script1.js", "content_script2.js"],
                css: ["content_script1.css", "content_script2.css"],
                match_about_blank: true,
            }],
        }),
        last: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
                js: ["content_script1.js"],
                css: ["content_script1.css"],
                match_about_blank: false,
            }],
        }),
    },
    output: {
        content_scripts: [{
            matches: [{
                before: undefined,
                after: "https://google.com",
            }],
            js: [{
                before: undefined,
                after: "content_script2.js",
            }],
            css: [{
                before: undefined,
                after: "content_script2.css",
            }],
            match_about_blank: {
                before: false,
                after: true,
            },
        }],
    },
}, {
    description: "delete: js, css, change match_about_blank",
    input: {
        current: generateManifest({
            content_scripts: [{
                matches: ["all_urls"],
                js: ["content_script1.js"],
                css: ["content_script1.css"],
                match_about_blank: false,
            }],
        }),
        last: generateManifest({
            content_scripts: [{
                matches: ["all_urls", "https://google.com"],
                js: ["content_script1.js", "content_script2.js"],
                css: ["content_script1.css", "content_script2.css"],
                match_about_blank: true,
            }],
        }),
    },
    output: {
        content_scripts: [{
            matches: [{
                before: "https://google.com",
                after: undefined,
            }],
            js: [{
                before: "content_script2.js",
                after: undefined,
            }],
            css: [{
                before: "content_script2.css",
                after: undefined,
            }],
            match_about_blank: {
                before: true,
                after: false,
            },
        }],
    },
}];

const diffPopupUseCases: UseCase<{
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
}, ChromeExtensionManifestPatch>[] = [{
    description: "undefined popup",
    input: {
        current: generateManifest({ content_scripts: undefined }),
        last: generateManifest({ content_scripts: undefined }),
    },
    output: {}
}];

const diffOverrideUseCases: UseCase<{
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
}, ChromeExtensionManifestPatch>[] = [{
    description: "undefined override",
    input: {
        current: generateManifest({ chrome_url_overrides: undefined }),
        last: generateManifest({ chrome_url_overrides: undefined }),
    },
    output: {}
}];

const diffDevtoolsUseCases: UseCase<{
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
}, ChromeExtensionManifestPatch>[] = [{
    description: "undefined devtools",
    input: {
        current: generateManifest({ devtools_page: undefined }),
        last: generateManifest({ devtools_page: undefined }),
    },
    output: {}
}];

const diffWebAccessibleResourcesUseCases: UseCase<{
    current: ChromeExtensionManifest,
    last: ChromeExtensionManifest,
}, ChromeExtensionManifestPatch>[] = [{
    description: "undefined web accessible resources",
    input: {
        current: generateManifest({ web_accessible_resources: undefined }),
        last: generateManifest({ web_accessible_resources: undefined }),
    },
    output: {}
}];

export default {
    diffBackground: diffBackgroundUseCases,
    diffContentScript: {
        empty: diffContentScriptEmptyUseCases,
        diff: diffContentScriptUseCases
    },
    diffContentScripts: diffContentScriptsUseCases,
    diffPopup: diffPopupUseCases,
    diffOverride: diffOverrideUseCases,
    diffDevtools: diffDevtoolsUseCases,
    diffWebAccessibleResources: diffWebAccessibleResourcesUseCases
}
