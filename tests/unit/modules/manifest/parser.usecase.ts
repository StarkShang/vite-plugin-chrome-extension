import { ChromeExtensionManifest } from "@/manifest";
import { ChromeExtensionManifestEntries, ChromeExtensionManifestEntriesDiff } from "@/modules/manifest/parser";
import { UseCase } from "@root/tests/common/usecase";
import path from "path";

const entries: UseCase<ChromeExtensionManifest, ChromeExtensionManifestEntries>[] = [{
    description: "No entries",
    input: {
        name: "",
        version: "1.0",
        manifest_version: 3,
    },
    output: [],
}, {
    description: "Empty content_scripts entry",
    input: {
        name: "",
        version: "1.0",
        manifest_version: 3,
        content_scripts: [],
    },
    output: [],
}, {
    description: "Empty web_accessible_resources entry",
    input: {
        name: "",
        version: "1.0",
        manifest_version: 3,
        web_accessible_resources: [],
    },
    "output": [],
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
    output: [{
        key: "background:background.js",
        type: "background",
        module: "background.js",
    }, {
        key: "content-script:content_script.js",
        type: "content-script",
        module: "content_script.js",
    }, {
        key: "options-page:options_page.js",
        type: "options-page",
        module: "options_page.js",
    }, {
        key: "options-ui:options_ui.js",
        type: "options-ui",
        module: "options_ui.js",
    }, {
        key: "web-accessible-resource:web_accessible_resource.js",
        type: "web-accessible-resource",
        module: "web_accessible_resource.js",
    }],
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
    contentScriptEntries,
    webAccessibleResourceEntries,
}
