import path from "path";

export default {
    entries: [{
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
    }],
    diffEntries: [{
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
    }],
    contentScriptEntries: {
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
    },
}
