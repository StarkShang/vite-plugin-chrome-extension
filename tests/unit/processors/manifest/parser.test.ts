import path from "path";
import { describe, it } from "mocha";
import { expect } from "chai";
import { ManifestParser } from "@/processors/manifest/parser";
import { ChromeExtensionManifest } from "@root/src/manifest";

describe("ManifestParser", () => {
    let parser: ManifestParser;
    beforeEach("before each", () => {
        parser = new ManifestParser();
    });
    describe("entries", () => {
        ([{
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
            web_accessible_resources: [],
        }] as ChromeExtensionManifest[]).forEach(manifest => it("No entries", () => {
            expect(parser.entries(manifest, "")).to.be.eqls({});
        }));
        ([{
            manifest: {
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
                    page: "options_ui.js"
                },
                web_accessible_resources: [{
                    resources: ["web_accessible_resource.js"],
                    matches: ["<all_urls>"],
                }],
            },
            entries: {
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
        }] as {manifest:ChromeExtensionManifest,entries:any}[]).forEach(usecase => it("With entries", () => {
            expect(parser.entries(usecase.manifest, "src")).to.be.eqls(usecase.entries);
        }));
    });
    describe("backgroundEntry", () => {
        it("No background service worker", () => {
            expect(parser.backgroundEntry({
                name: "",
                version: "1.0",
                manifest_version: 3,
            }, "")).to.be.undefined;
        });
        it("With background service worker", () => {
            expect(parser.backgroundEntry({
                name: "",
                version: "1.0",
                manifest_version: 3,
                background: { service_worker: "background.js" },
            }, "src")).to.equal(path.resolve("src", "background.js"));
        });
    });
    describe("contentScriptEntries", () => {
        ([{
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
        }] as ChromeExtensionManifest[]).forEach(manifest => it("No content scripts", () => {
            expect(parser.contentScriptEntries(manifest, "")).to.be.undefined;
        }));
        ([{
            manifest: {
                name: "",
                version: "1.0",
                manifest_version: 3,
                content_scripts: [{
                    js: ["content_script.js"],
                    matches: ["<all_urls>"],
                }],
            },
            entries: [
                path.resolve("src", "content_script.js"),
            ],
        }, {
            manifest: {
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
            entries: [
                path.resolve("src", "content_script1.js"),
                path.resolve("src", "content_script2.js"),
            ],
        }, {
            manifest: {
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
            entries: [
                path.resolve("src", "content_script1.js"),
                path.resolve("src", "content_script2.js"),
            ],
        }] as {manifest:ChromeExtensionManifest,entries:string[]}[]).forEach(usecase => it("With content scripts", () => {
            expect(parser.contentScriptEntries(usecase.manifest, "src")).to.have.members(usecase.entries);
        }));
    });
    describe("optionsPageEntry", () => {
        it("No options page", () => {
            expect(parser.optionsPageEntry({
                name: "",
                version: "1.0",
                manifest_version: 3,
            }, "")).to.be.undefined;
        });
        it("With options page", () => {
            expect(parser.optionsPageEntry({
                name: "",
                version: "1.0",
                manifest_version: 3,
                options_page: "options_page.js",
            }, "src")).to.equal(path.resolve("src", "options_page.js"));
        });
    });
    describe("optionsUiEntry", () => {
        it("No options ui", () => {
            expect(parser.optionsUiEntry({
                name: "",
                version: "1.0",
                manifest_version: 3,
            }, "")).to.be.undefined;
        });
        it("With options ui", () => {
            expect(parser.optionsUiEntry({
                name: "",
                version: "1.0",
                manifest_version: 3,
                options_ui: {
                    page: "options_ui.js",
                },
            }, "src")).to.equal(path.resolve("src", "options_ui.js"));
        });
    });
    describe("webAccessibleResourceEntries", () => {
        ([{
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
        }] as ChromeExtensionManifest[]).forEach(manifest => it("No web accessible resources", () => {
            expect(parser.webAccessibleResourceEntries(manifest, "")).to.be.undefined;
        }));
        ([{
            manifest: {
                name: "",
                version: "1.0",
                manifest_version: 3,
                web_accessible_resources: [{
                    resources: ["web_accessible_resource.js"],
                    matches: ["<all_urls>"],
                }],
            },
            entries: [
                path.resolve("src", "web_accessible_resource.js"),
            ],
        }, {
            manifest: {
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
            entries: [
                path.resolve("src", "web_accessible_resource1.js"),
                path.resolve("src", "web_accessible_resource2.js"),
            ],
        }, {
            manifest: {
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
            entries: [
                path.resolve("src", "web_accessible_resource1.js"),
                path.resolve("src", "web_accessible_resource2.js"),
            ],
        }] as {manifest:ChromeExtensionManifest,entries:string[]}[]).forEach(usecase => it("With web accessible resources", () => {
            expect(parser.webAccessibleResourceEntries(usecase.manifest, "src")).to.have.members(usecase.entries);
        }));
    });
});
