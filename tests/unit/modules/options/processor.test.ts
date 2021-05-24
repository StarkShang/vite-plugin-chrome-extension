import { OptionsProcessor } from "@/modules/options";
import { describe, it } from "mocha";
import { expect } from "chai";
import usecases from "./processor.usecase";

describe("OptionsProcessor", () => {
    describe("normalizeOptions", () => {
        usecases.normalizeOptions.forEach(usecase => it(usecase.description, () => {
            const processor = new OptionsProcessor(usecase.input);
            const normalizedOptions = (processor as any).normalizeOptions(usecase.input);
            expect(normalizedOptions).to.deep.equals(usecase.output);
        }));
    });
});
