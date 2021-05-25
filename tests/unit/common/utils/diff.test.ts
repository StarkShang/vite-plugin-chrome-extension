import { expect } from "chai";
import { diffStringArray } from "@/common/utils/diff";
import usecases from "./diff.usecase";

describe("common/utils/diff", () => {
    describe("diffStringArray", () => {
        usecases.diffStringArray.forEach(usecase => it(usecase.description, () => {
            expect(diffStringArray(usecase.input.current, usecase.input.last)).to.has.deep.members(usecase.output);
        }));
    });
});
