import { ManifestProcessor } from "@/modules/manifest";
import { IComponentProcessor } from "@/modules/common";
import { assert, expect } from "chai";
import { ChromeExtensionManifest } from "@root/src/manifest";
import usecases from "./processor.usecase";

describe("ManifestProcessor", () => {
    describe("constructor", () => {
        usecases.constructor.forEach(usecase => it(usecase.description, () => {
            const manifestProcessor = new ManifestProcessor(usecase.input);
            const processors = (manifestProcessor as any).processors as Map<string, IComponentProcessor>;
            expect(Array.from(processors).map(entry => ({ key: entry[0], type: entry[1].constructor.name }))).to.have.deep.members(usecase.output);
        }));
    });
    describe("resolve", () => {
        usecases.resolve.forEach(usecase => it(usecase.description, async () => {
            const manifestProcessor = new ManifestProcessor();
            await manifestProcessor.resolve(usecase.input);
            expect(manifestProcessor.cache.manifest).to.deep.equals(usecase.output.manifest);
            expect(manifestProcessor.cache.entries).to.have.deep.members(usecase.output.entries);
        }))
    });
    describe("build", () => {
        usecases.build.forEach(usecase => it(usecase.description, async () => {
            const manifestProcessor = new ManifestProcessor();
            manifestProcessor.cache.entries = usecase.input.entries;
            manifestProcessor.cache.mappings = usecase.input.mappings;
            await manifestProcessor.build();
            expect(manifestProcessor.cache.entries).to.have.deep.members(usecase.output.entries);
            expect(manifestProcessor.cache.mappings).to.deep.equals(usecase.output.mappings);
        }));
    });

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
            const config = {} as ChromeExtensionManifest;
            const manifest = (processor as any).applyExternalManifestConfiguration(config);
            assert.equal(manifest, config);
        });
    });
});
