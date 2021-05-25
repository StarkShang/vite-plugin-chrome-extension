import { BackgroundProcessor } from "@/modules/background";
import { expect } from "chai";
import usecases from "./processor.usecase";

describe("BackgroundProcessor", () => {
    describe("normalizeOptions", () => {
        usecases.normalizeOptions.forEach(usecase => it(usecase.description, () => {
            const processor = new BackgroundProcessor(usecase.input);
            const normalizedOptions = (processor as any).normalizeOptions(usecase.input);
            expect(normalizedOptions).to.deep.equals(usecase.output);
        }));
    });
});
