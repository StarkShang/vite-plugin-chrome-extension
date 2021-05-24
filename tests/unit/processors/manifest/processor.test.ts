import { ChromeExtensionConfigurationInfo, ManifestProcessor } from "@root/src/modules/manifest";
import { describe, it } from "mocha";
import { assert } from "chai";

describe("ManifestProcessor", () => {
    describe("load", () => {
        let processor: ManifestProcessor;
        beforeEach(function() {
            processor = new ManifestProcessor();
        });
    });
    describe("validateChromeExtensionManifest", () => {
        let processor: ManifestProcessor;
        beforeEach(function() {
            processor = new ManifestProcessor();
        });
        it("Cannot define both options_ui and options_page", () => {
            const manifest = { options_page: "", options_ui: "" };
            assert.throws(
                () => (processor as any).validateChromeExtensionManifest(manifest),
                "options_ui and options_page cannot both be defined in manifest.json.");
        });
    });
    describe("applyExternalManifestConfiguration", () => {
        it("User custom manifest configuration function", () => {
            const extensionName = "Chrome Extension";
            const processor = new ManifestProcessor({
                extendManifest: (opt) => { opt.name = extensionName; return opt; },
                rootPath: "",
                manifestPath: "",
                watch: false,
            });
            const config = { config: {} };
            const manifest = (processor as any).applyExternalManifestConfiguration(config);
            assert.equal(manifest.name, extensionName);
        });
        it("User custom manifest configuration object", () => {
            const extensionName = "Chrome Extension";
            const processor = new ManifestProcessor({
                extendManifest: { name: extensionName },
                rootPath: "",
                manifestPath: "",
                watch: false,
            });
            const config = {};
            const manifest = (processor as any).applyExternalManifestConfiguration(config);
            assert.equal(manifest.name, extensionName);
        });
        it("User other custom manifest configuration", () => {
            const processor = new ManifestProcessor();
            const config = {} as ChromeExtensionConfigurationInfo;
            const manifest = (processor as any).applyExternalManifestConfiguration(config);
            assert.equal(manifest, config);
        });
    });
});
