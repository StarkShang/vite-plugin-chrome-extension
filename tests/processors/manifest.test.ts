import { ChromeExtensionConfigurationInfo, ManifestProcessor } from "@/processors/manifest";
import { describe, it } from "mocha";
import { assert } from "chai";

describe("ManifestProcessor", () => {
    describe("resolveManifestPath", () => {
        let processor: ManifestProcessor;
        beforeEach(function() {
            processor = new ManifestProcessor();
        });
        it("No input", () => {
            assert.throws((processor as any).resolveManifestPath, "No input is provided.");
        });
        it("Input array without manifest.json", () => {
            assert.throws(
                () => {(processor as any).resolveManifestPath([])},
                "RollupOptions.input array must contain a Chrome extension manifest with filename 'manifest.json'.");
        });
        it("Input object without key manifest", () => {
            assert.throws(
                () => {(processor as any).resolveManifestPath({})},
                "RollupOptions.input object must contain a Chrome extension manifest with Key manifest.");
        });
        ["manifest", "manifest.js", { manifest: "manifest.js" }].forEach(input => {
            const inputFilename = typeof input === "string" ? input : input.manifest;
            it(`Input manifest filename ${inputFilename} isn't manifest.json`, () => {
                assert.throws(
                    () => {(processor as any).resolveManifestPath(input)},
                    "Input for a Chrome extension manifest must have filename 'manifest.json'.");
            })
        });
        ["manifest.json", "src/manifest.json"].forEach(input => it(`Correct string input ${input}`, () => {
            assert.equal((processor as any).resolveManifestPath(input), input);
        }));
        [["manifest.json"], ["src/manifest.json"]].forEach(input => it(`Correct array input with ${input[0]}`, () => {
            assert.equal((processor as any).resolveManifestPath([...input]), input[0]);
        }));
        [{ manifest: "manifest.json" }, { manifest: "src/manifest.json" }].forEach(
            input => it(`Correct object input with ${input.manifest}`, () => {
                assert.equal((processor as any).resolveManifestPath({...input}), input.manifest);
        }));
    });
    describe("load", () => {
        let processor: ManifestProcessor;
        beforeEach(function() {
            processor = new ManifestProcessor();
        });
    });
    describe("validateManifestContent", () => {
        let processor: ManifestProcessor;
        beforeEach(function() {
            processor = new ManifestProcessor();
        });
        it("Content of manifest.json cannot be empty", () => {
            const config = { filepath: "manifest.json", isEmpty: true };
            assert.throws(
                () => (processor as any).validateManifestContent(config),
                `${config.filepath} is an empty file.`);
        });
        it("Cannot define both options_ui and options_page", () => {
            const config = { config: { options_page: "", options_ui: "" } };
            assert.throws(
                () => (processor as any).validateManifestContent(config),
                "options_ui and options_page cannot both be defined in manifest.json.");
        });
    });
    describe("applyExternalManifestConfiguration", () => {
        it("User custom manifest configuration function", () => {
            const extensionName = "Chrome Extension";
            const processor = new ManifestProcessor({
                extendManifest: (opt) => { opt.name = extensionName; return opt; }
            });
            const config = { config: {} };
            const manifest = (processor as any).applyExternalManifestConfiguration(config);
            assert.equal(manifest.name, extensionName);
        });
        it("User custom manifest configuration object", () => {
            const extensionName = "Chrome Extension";
            const processor = new ManifestProcessor({
                extendManifest: { name: extensionName }
            });
            const config = {};
            const manifest = (processor as any).applyExternalManifestConfiguration(config);
            assert.equal(manifest.name, extensionName);
        });
        it("User other custom manifest configuration", () => {
            const processor = new ManifestProcessor();
            const config = {} as ChromeExtensionConfigurationInfo;
            const manifest = (processor as any).applyExternalManifestConfiguration(config);
            assert.equal(manifest, config.config);
        });
    });
});
