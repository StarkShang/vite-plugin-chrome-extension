import { expect } from "chai";
import { ChromeExtensionManifestParser } from "@/modules/manifest/parser";
import { ChromeExtensionManifest } from "@/manifest";
import usecases from "./parser.usecase";

describe("ManifestParser", () => {
    let parser: ChromeExtensionManifestParser;
    beforeEach(() => {
        parser = new ChromeExtensionManifestParser();
    });
});
