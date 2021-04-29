import { assert } from "chai";
import { removeFileExtension } from "@/common/utils/path";

describe("common/utils/path", () => {
    describe("removeFileExtension", () => {
        [{
            in: "",
            out: ""
        }, {
            in: "main",
            out: "main"
        }, {
            in: "main.ts",
            out: "main"
        }, {
            in: "src/main.ts",
            out: "src/main"
        }, {
            in: "src\\main.ts",
            out: "src\\main"
        }, {
            in: "src\\main.service.ts",
            out: "src\\main.service"
        }].forEach(usecase => {
            it("remove extension", () => {
                const result = removeFileExtension(usecase.in);
                assert.equal(result, usecase.out);
            })
        });
    });
});
