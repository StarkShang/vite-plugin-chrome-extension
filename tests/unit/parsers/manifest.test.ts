import { deriveFiles } from "@/manifest-input/manifest-parser";
import {
    backgroundJs,
    contentJs,
    manifestJson,
    srcDir,
    popupHtml,
    optionsHtml,
    devtoolsHtml,
    contentCss,
    icon16,
    icon128,
    icon48,
    faviconPng
} from "@root/__fixtures__/kitchen-sink-paths";
import { assert } from "chai";

const manifest = require(manifestJson);

describe("deriveFiles", () => {
    it("gets correct scripts", () => {
        const result = deriveFiles(manifest, srcDir);
        assert.include(result.js, backgroundJs);
        assert.include(result.js, contentJs);
    });

    it("gets correct html", () => {
        const result = deriveFiles(manifest, srcDir);
        assert.include(result.html, optionsHtml);
        assert.include(result.html, popupHtml);
        assert.include(result.html, devtoolsHtml);
    });

    it("gets correct css", () => {
        const result = deriveFiles(manifest, srcDir);
        assert.include(result.css, contentCss);
    });

    it("gets correct action icon", () => {
        const result = deriveFiles(manifest, srcDir);
        assert.include(result.img, faviconPng);
    });

    it("gets correct action img", () => {
        const result = deriveFiles(manifest, srcDir);
        assert.include(result.img, icon16);
        assert.include(result.img, icon48);
        assert.include(result.img, icon128);
    });

    it("does not emit duplicates", () => {
        const result = deriveFiles(manifest, srcDir);
        assert.equal(result.js.length, 2);
        assert.include(result.js, backgroundJs);
        assert.include(result.js, contentJs);
    });
});
