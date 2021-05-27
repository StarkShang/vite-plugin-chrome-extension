import { OverrideHistoryProcessor } from "@/modules/override";
import { expect } from "chai";
import usecases from "./processor.usecase";

describe("OverrideHistoryProcessor", () => {
    describe("normalizeOptions", () => {
        usecases.normalizeOptions.forEach(usecase => it(usecase.description, () => {
            const processor = new OverrideHistoryProcessor(usecase.input);
            const normalizedOptions = (processor as any).normalizeOptions(usecase.input);
            expect(normalizedOptions).to.deep.equals(usecase.output);
        }));
    });
    describe("resolve", () => {
        usecases.resolve.forEach(usecase => it(usecase.description, () => {
            const processor = new OverrideHistoryProcessor();
            processor.resolve(usecase.input);
            expect((processor as any)._cache.entry).to.be.equals(usecase.output);
        }));
    });
});
