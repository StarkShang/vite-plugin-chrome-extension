import { expect } from "chai";
import usecases from "./diff.usecase";
import { diffBackground, diffContentScript, diffContentScripts, diffDevtools, diffOptions, diffOverride, diffPopup, diffWebAccessibleResources } from "@/modules/manifest/diff";

describe("modules/manifest/diff", () => {
    describe("diffBackground", () => {
        usecases.diffBackground.forEach(usecase => it(usecase.description, () => {
            const patch = {};
            diffBackground(usecase.input.current, usecase.input.last, patch);
            expect(patch).to.deep.equals(usecase.output);
        }));
    });
    describe("diffContentScript", () => {
        usecases.diffContentScript.empty.forEach((usecase, index) => it(`no changes ${index}`, () => {
            expect(diffContentScript(usecase.current, usecase.last)).to.be.undefined;
        }));
        usecases.diffContentScript.diff.forEach(usecase => it(usecase.description, () => {
            expect(diffContentScript(usecase.input.current, usecase.input.last)).to.have.deep.equals(usecase.output);
        }));
    });
    describe("diffContentScripts", () => {
        usecases.diffContentScripts.forEach(usecase => it(usecase.description, () => {
            const patch = {};
            diffContentScripts(usecase.input.current, usecase.input.last, patch);
            expect(patch).to.deep.equals(usecase.output);
        }));
    });
    describe("diffOptions", () => {
        usecases.diffOptions.forEach(usecase => it(usecase.description, () => {
            const patch = {};
            diffOptions(usecase.input.current, usecase.input.last, patch);
            expect(patch).to.deep.equals(usecase.output);
        }));
    });
    describe("diffPopup", () => {
        usecases.diffPopup.forEach(usecase => it(usecase.description, () => {
            const patch = {};
            diffPopup(usecase.input.current, usecase.input.last, patch);
            expect(patch).to.deep.equals(usecase.output);
        }));
    });
    describe("diffOverride", () => {
        usecases.diffOverride.forEach(usecase => it(usecase.description, () => {
            const patch = {};
            diffOverride(usecase.input.current, usecase.input.last, patch);
            expect(patch).to.deep.equals(usecase.output);
        }));
    });
    describe("diffDevtools", () => {
        usecases.diffDevtools.forEach(usecase => it(usecase.description, () => {
            const patch = {};
            diffDevtools(usecase.input.current, usecase.input.last, patch);
            expect(patch).to.deep.equals(usecase.output);
        }));
    });
    describe("diffWebAccessibleResources", () => {
        usecases.diffWebAccessibleResources.forEach(usecase => it(usecase.description, () => {
            const patch = {};
            diffWebAccessibleResources(usecase.input.current, usecase.input.last, patch);
            expect(patch).to.deep.equals(usecase.output);
        }));
    });
});

