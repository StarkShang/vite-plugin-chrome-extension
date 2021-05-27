import { ContentScriptProcessor } from "@/modules/content-script";
import { expect } from "chai";
import usecases from "./processor.usecase";

describe("ContentScriptProcessor", () => {
    describe("normalizeOptions", () => {
        usecases.normalizeOptions.forEach(usecase => it(usecase.description, () => {
            const processor = new ContentScriptProcessor(usecase.input);
            const normalizedOptions = (processor as any).normalizeOptions(usecase.input);
            expect(normalizedOptions).to.deep.equals(usecase.output);
        }));
    });
    describe("resolve", () => {
        usecases.resolve.forEach(usecase => it(usecase.description, () => {
            const processor = new ContentScriptProcessor();
            processor.resolve(usecase.input);
            expect((processor as any)._cache.entries).to.have.members(usecase.output);
        }));
    });
});
