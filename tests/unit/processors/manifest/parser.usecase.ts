import { ChromeExtensionManifest } from "@root/src/manifest";
import { ChromeExtensionManifestEntries } from "@root/src/processors/manifest/parser";
import { UseCase } from "@root/tests/common/usecase";
import path from "path";

const entries: UseCase<ChromeExtensionManifest, ChromeExtensionManifestEntries>[] = [{
    description: "No entries",
    input: {
        name: "",
        version: "1.0",
        manifest_version: 3,
    },
    output: {},
}, {
    description: "No entries",
    input: {
        name: "",
        version: "1.0",
        manifest_version: 3,
        content_scripts: [],
    },
    output: {},
}, {
    description: "No entries",
    input: {
        name: "",
        version: "1.0",
        manifest_version: 3,
        web_accessible_resources: [],
    },
    "output": {},
}, {
    description: "With entries",
    input: {
        name: "",
        version: "1.0",
        manifest_version: 3,
        background: { service_worker: "background.js" },
        content_scripts: [{
            js: ["content_script.js"],
            matches: ["<all_urls>"],
        }],
        options_page: "options_page.js",
        options_ui: {
            page: "options_ui.js",
        },
        web_accessible_resources: [{
            resources: ["web_accessible_resource.js"],
            matches: ["<all_urls>"],
        }],
    },
    output: {
        background: path.resolve("src", "background.js"),
        content_scripts: [
            path.resolve("src", "content_script.js"),
        ],
        options_page: path.resolve("src", "options_page.js"),
        options_ui: path.resolve("src", "options_ui.js"),
        web_accessible_resources: [
            path.resolve("src", "web_accessible_resource.js"),
        ],
    },
}];

const diffEntries: UseCase<{
    last: ChromeExtensionManifestEntries,
    current: ChromeExtensionManifestEntries,
}, Partial<ChromeExtensionManifestEntries>>[] = [{
    description: "Empty manifest",
    input: {
        last: {},
        current: {},
    },
    output: {},
}, {
    description: "Add background",
    input: {
        last: {},
        current: {
            background: "background.js",
        },
    },
    output: {
        background: "background.js",
    },
}, {
    description: "Add content_script",
    input: {
        last: {},
        current: {
            content_scripts: ["content_scirpt.js"],
        },
    },
    output: {
        content_scripts: ["content_scirpt.js"],
    },
}, {
    description: "Add content_script",
    input: {
        last: {
            content_scripts: ["content_scirpt1.js"],
        },
        current: {
            content_scripts: ["content_scirpt1.js", "content_scirpt2.js"],
        },
    },
    output: {
        content_scripts: ["content_scirpt2.js"],
    },
}, {
    description: "Add options_page",
    input: {
        last: {},
        current: {
            options_page: "options_page.js",
        },
    },
    output: {
        options_page: "options_page.js",
    },
}, {
    description: "Add options_ui",
    input: {
        last: {},
        current: {
            options_ui: "options_ui.js",
        },
    },
    output: {
        options_ui: "options_ui.js",
    },
}, {
    description: "Add popup",
    input: {
        last: {},
        current: {
            popup: "popup.js",
        },
    },
    output: {
        popup: "popup.js",
    },
}, {
    description: "Add devtools",
    input: {
        last: {},
        current: {
            devtools: "devtools.js",
        },
    },
    output: {
        devtools: "devtools.js",
    },
}, {
    description: "Add web_accessible_resources",
    input: {
        last: {},
        current: {
            content_scripts: ["web_accessible_resource.js"],
        },
    },
    output: {
        content_scripts: ["web_accessible_resource.js"],
    },
}, {
    description: "Add web_accessible_resources",
    input: {
        last: {
            content_scripts: ["web_accessible_resource1.js"],
        },
        current: {
            content_scripts: ["web_accessible_resource1.js", "web_accessible_resource2.js"],
        },
    },
    output: {
        content_scripts: ["web_accessible_resource2.js"],
    },
}];

const contentScriptEntries: { empty: ChromeExtensionManifest[], content_scripts: UseCase<ChromeExtensionManifest, string[]>[] } = {
    empty: [{
        name: "",
        version: "1.0",
        manifest_version: 3,
    }, {
        name: "",
        version: "1.0",
        manifest_version: 3,
        content_scripts: [],
    }, {
        name: "",
        version: "1.0",
        manifest_version: 3,
        content_scripts: [{
            js: [],
            matches: ["<all_urls>"],
        }],
    }, {
        name: "",
        version: "1.0",
        manifest_version: 3,
        content_scripts: [{
            css: [],
            matches: ["<all_urls>"],
        }],
    }],
    content_scripts: [{
        description: "With content scripts",
        input: {
            name: "",
            version: "1.0",
            manifest_version: 3,
            content_scripts: [{
                js: ["content_script.js"],
                matches: ["<all_urls>"],
            }],
        },
        output: [
            path.resolve("src", "content_script.js"),
        ],
    }, {
        description: "With content scripts",
        input: {
            name: "",
            version: "1.0",
            manifest_version: 3,
            content_scripts: [{
                js: [
                    "content_script1.js",
                    "content_script2.js",
                ],
                matches: ["<all_urls>"],
            }],
        },
        output: [
            path.resolve("src", "content_script1.js"),
            path.resolve("src", "content_script2.js"),
        ],
    }, {
        description: "With content scripts",
        input: {
            name: "",
            version: "1.0",
            manifest_version: 3,
            content_scripts: [{
                js: [ "content_script1.js" ],
                matches: ["<all_urls>"],
            }, {
                js: [ "content_script2.js" ],
                matches: ["<all_urls>"],
            }],
        },
        output: [
            path.resolve("src", "content_script1.js"),
            path.resolve("src", "content_script2.js"),
        ],
    }],
};

const webAccessibleResourceEntries: {
    empty: ChromeExtensionManifest[],
    web_accessible_resources: UseCase<ChromeExtensionManifest, string[]>[],
} = {
    empty: [{
        name: "",
        version: "1.0",
        manifest_version: 3,
    }, {
        name: "",
        version: "1.0",
        manifest_version: 3,
        web_accessible_resources: [],
    }, {
        name: "",
        version: "1.0",
        manifest_version: 3,
        web_accessible_resources: [{
            resources: [],
            matches: ["<all_urls>"],
        }],
    }],
    web_accessible_resources: [{
        description: "With web accessible resources",
        input: {
            name: "",
            version: "1.0",
            manifest_version: 3,
            web_accessible_resources: [{
                resources: ["web_accessible_resource.js"],
                matches: ["<all_urls>"],
            }],
        },
        output: [
            path.resolve("src", "web_accessible_resource.js"),
        ],
    }, {
        description: "With web accessible resources",
        input: {
            name: "",
            version: "1.0",
            manifest_version: 3,
            web_accessible_resources: [{
                resources: [
                    "web_accessible_resource1.js",
                    "web_accessible_resource2.js",
                ],
                matches: ["<all_urls>"],
            }],
        },
        output: [
            path.resolve("src", "web_accessible_resource1.js"),
            path.resolve("src", "web_accessible_resource2.js"),
        ],
    }, {
        description: "With web accessible resources",
        input: {
            name: "",
            version: "1.0",
            manifest_version: 3,
            web_accessible_resources: [{
                resources: [ "web_accessible_resource1.js" ],
                matches: ["<all_urls>"],
            }, {
                resources: [ "web_accessible_resource2.js" ],
                matches: ["<all_urls>"],
            }],
        },
        output: [
            path.resolve("src", "web_accessible_resource1.js"),
            path.resolve("src", "web_accessible_resource2.js"),
        ],
    }],
};

export default {
    entries,
    diffEntries,
    contentScriptEntries,
    webAccessibleResourceEntries,
}
