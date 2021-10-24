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
    describe("build", () => {
        usecases.build.forEach(usecase => it(usecase.description, async () => {
            const processor = new WebAccessibleResourceProcessor();
            (processor as any)._cache.entries = usecase.input.entries;
            (processor as any)._cache.modules = usecase.input.modules;
            const modules = await processor.build();
            expect(Array.from((processor as any)._cache.modules.values())).to.have.deep.members(usecase.output);
            expect(modules).to.have.deep.members(usecase.output);
        }));
    });
});