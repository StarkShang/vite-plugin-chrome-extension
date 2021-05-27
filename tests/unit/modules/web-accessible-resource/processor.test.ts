import { WebAccessibleResourceProcessor } from "@/modules/web-accessible-resource";
import { expect } from "chai";
import usecases from "./processor.usecase";

describe("WebAccessibleResourceProcessor", () => {
    describe("normalizeOptions", () => {
        usecases.normalizeOptions.forEach(usecase => it(usecase.description, () => {
            const processor = new WebAccessibleResourceProcessor(usecase.input);
            const normalizedOptions = (processor as any).normalizeOptions(usecase.input);
            expect(normalizedOptions).to.deep.equals(usecase.output);
        }));
    });
    describe("resolve", () => {
        usecases.resolve.forEach(usecase => it(usecase.description, () => {
            const processor = new WebAccessibleResourceProcessor();
            processor.resolve(usecase.input);
            expect((processor as any)._cache.entries).to.have.members(usecase.output);
        }));
    });
});
