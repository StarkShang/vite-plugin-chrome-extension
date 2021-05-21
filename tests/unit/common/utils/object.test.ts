import { removeUndefinedProperty } from "@/common/utils/object";
import { it } from "mocha";
import { expect } from "chai";
import usecases from "./object.usecase";

describe("common/utils/object", () => {
    describe("removeUndefinedProperty", () => {
        usecases.removeUndefinedProperty.empty.forEach(usecase => it("empty object", () => {
            expect(removeUndefinedProperty(usecase)).to.be.undefined;
        }));
        usecases.removeUndefinedProperty.objects.forEach(usecase => it("objects", () => {
            expect(removeUndefinedProperty(usecase.input)).to.be.eqls(usecase.output);
        }));
    });
});
