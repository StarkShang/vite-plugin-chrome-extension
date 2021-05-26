import { expect } from "chai";
import { ChromeExtensionManifestParser } from "@/modules/manifest/parser";
import { ChromeExtensionManifest } from "@/manifest";
import usecases from "./parser.usecase";

describe("ManifestParser", () => {
    let parser: ChromeExtensionManifestParser;
    beforeEach(() => {
        parser = new ChromeExtensionManifestParser();
    });
    describe("entries", () => {
        usecases.entries.forEach(usecase => it(usecase.description, () => {
            expect(parser.entries(usecase.input as ChromeExtensionManifest)).to.be.eqls(usecase.output);
        }));
    });
});
