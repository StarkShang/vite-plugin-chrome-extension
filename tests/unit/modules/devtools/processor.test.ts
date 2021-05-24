import { DevtoolsProcessor } from "@/modules/devtools";
import { describe, it } from "mocha";
import { expect } from "chai";
import usecases from "./processor.usecase";

describe("DevtoolsProcessor", () => {
    describe("normalizeOptions", () => {
        usecases.normalizeOptions.forEach(usecase => it(usecase.description, () => {
            const processor = new DevtoolsProcessor(usecase.input);
            const normalizedOptions = (processor as any).normalizeOptions(usecase.input);
            expect(normalizedOptions).to.deep.equals(usecase.output);
        }));
    });
});
