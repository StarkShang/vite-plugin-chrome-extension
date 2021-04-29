import { assert } from "chai";
import { replaceCssUrl } from "@/common/utils/css";

describe("common/utils/css", () => {
    describe("replaceCssUrl", () => {
        [{
            in: "url()",
            out: "url()"
        }, {
            in: "url(   )",
            out: "url()"
        }, {
            in: "url  (   )",
            out: "url  ()"
        }, {
            in: "url(favicon.png)",
            out: "url(chrome-extension://__MSG_@@extension_id__/favicon.png)"
        }, {
            in: "url('favicon.png')",
            out: "url('chrome-extension://__MSG_@@extension_id__/favicon.png')"
        }, {
            in: "url  ( '   favicon.png  '  )  ",
            out: "url  ( 'chrome-extension://__MSG_@@extension_id__/favicon.png'  )  "
        }, {
            in: "url(\"favicon.png\")",
            out: "url(\"chrome-extension://__MSG_@@extension_id__/favicon.png\")"
        }, {
            in: "url (   favicon.png  )",
            out: "url (chrome-extension://__MSG_@@extension_id__/favicon.png)"
        }].forEach(usecase => {
            it("add chrome extension scheme", () => {
                const result = replaceCssUrl(usecase.in);
                assert.equal(result, usecase.out);
            })
        });
    });
});
