import path from "path";
import { describe, it } from "mocha";
import { expect } from "chai";
import { ChromeExtensionManifestParser } from "@/processors/manifest/parser";
import { ChromeExtensionManifest } from "@/manifest";
import usecases from "./parser.usecase";

describe("ManifestParser", () => {
    let parser: ChromeExtensionManifestParser;
    beforeEach("before each", () => {
        parser = new ChromeExtensionManifestParser();
    });
    describe("entries", () => {
        usecases.entries.forEach(usecase => it(usecase.description, () => {
            expect(parser.entries(usecase.input as ChromeExtensionManifest, "src")).to.be.eqls(usecase.output);
        }));
    });
    describe("diffEntries", () => {
        usecases.diffEntries.forEach((usecase, index) => {
            it(usecase.description, () => {
                const result = parser.diffEntries(usecase.input.last, usecase.input.current);
                expect(result).to.be.eqls(usecase.output);
            });
        });
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
        usecases.contentScriptEntries.empty.forEach(usecase => it("No content scripts", () => {
            expect(parser.contentScriptEntries(usecase as ChromeExtensionManifest, "")).to.be.undefined;
        }));
        usecases.contentScriptEntries.content_scripts.forEach(usecase => it(usecase.description, () => {
            expect(parser.contentScriptEntries(usecase.input as ChromeExtensionManifest, "src")).to.have.members(usecase.output);
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
        usecases.webAccessibleResourceEntries.empty.forEach(usecase => it("No web accessible resources", () => {
            expect(parser.webAccessibleResourceEntries(usecase as ChromeExtensionManifest, "")).to.be.undefined;
        }));
        usecases.webAccessibleResourceEntries.web_accessible_resources.forEach(usecase => it(usecase.description, () => {
            expect(parser.webAccessibleResourceEntries(usecase.input as ChromeExtensionManifest, "src")).to.have.members(usecase.output);
        }));
    });
});
