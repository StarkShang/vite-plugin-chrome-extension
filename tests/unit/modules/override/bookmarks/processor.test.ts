import { OverrideBookmarksProcessor } from "@/modules/override";
import { describe, it } from "mocha";
import { expect } from "chai";
import usecases from "./processor.usecase";

describe("OverrideBookmarksProcessor", () => {
    describe("normalizeOptions", () => {
        usecases.normalizeOptions.forEach(usecase => it(usecase.description, () => {
            const processor = new OverrideBookmarksProcessor(usecase.input);
            const normalizedOptions = (processor as any).normalizeOptions(usecase.input);
            expect(normalizedOptions).to.deep.equals(usecase.output);
        }));
    });
});
