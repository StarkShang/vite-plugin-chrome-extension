import { assert } from "chai";
import { replaceCssUrl } from "@/common/utils/css";

describe("common/utils/css", () => {
    describe("replaceCssUrl", () => {
        [{
            in: "url()",
            out: { code: "url()" }
        }, {
            in: "url(   )",
            out: { code: "url()" }
        }, {
            in: "url  (   )",
            out: { code: "url  ()" }
        }, {
            in: "url(favicon.png)",
            out: {
                code: "url(chrome-extension://__MSG_@@extension_id__/favicon.png)",
                resources: ["favicon.png"]
            }
        }, {
            in: "url('favicon.png')",
            out: {
                code: "url('chrome-extension://__MSG_@@extension_id__/favicon.png')",
                resources: ["favicon.png"]
            }
        }, {
            in: "url  ( '   favicon.png  '  )  ",
            out: {
                code: "url  ( 'chrome-extension://__MSG_@@extension_id__/favicon.png'  )  ",
                resources: ["favicon.png"]
            }
        }, {
            in: "url(\"favicon.png\")",
            out: {
                code: "url(\"chrome-extension://__MSG_@@extension_id__/favicon.png\")",
                resources: ["favicon.png"]
            }
        }, {
            in: "url (   favicon.png  )",
            out: {
                code: "url (chrome-extension://__MSG_@@extension_id__/favicon.png)",
                resources: ["favicon.png"]
            }
        }, {
            in: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==)",
            out: {
                code: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==)",
            }
        }, {
            in: "url(favicon.png);url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==)",
            out: {
                code: "url(chrome-extension://__MSG_@@extension_id__/favicon.png);url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==)",
                resources: ["favicon.png"]
            }
        }].forEach(usecase => {
            it("add chrome extension scheme", () => {
                const result = replaceCssUrl(usecase.in);
                assert.deepEqual(result, usecase.out);
            })
        });
    });
});
