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
});
