import prettier from "prettier";
import { readFile } from "fs-extra";
import slash from "slash";
import { join } from "path";
import { InputOption, InputOptions } from "rollup";
import {
    assetJs,
    backgroundJs,
    kitchenSinkRoot,
    faviconIco,
    faviconPng,
    optionsCss,
    optionsHtml,
    optionsJpg,
    optionsJs,
    optionsJsx,
    optionsPng,
    optionsTs,
    optionsTsx,
    popupHtml,
    popupJs,
} from "@root/__fixtures__/kitchen-sink-paths";
import { context } from "@root/__fixtures__/minimal-plugin-context";
import {
    getExtPath,
    getRelative,
} from "@root/__fixtures__/utils";
import { HtmlInputsPluginCache } from "@/plugin-options";
import htmlInputs from "@/html-inputs/index";

import * as cheerio from "@/html-inputs/cheerio";
import { HtmlProcessor } from "@/common/processors/html";
import { assert } from "chai";

const srcDir = join(
    process.cwd(),
    "__fixtures__/extensions/kitchen-sink",
);
const cache: HtmlInputsPluginCache = {
    css: [],
    html: [],
    html$: [],
    img: [],
    input: [],
    js: [],
    scripts: [],
};

const plugin = htmlInputs({ srcDir }, cache);

describe("HtmlProcessor", () => {
    describe("resolveInput", () => {
        let processor: HtmlProcessor;
        let input: InputOption;
        beforeEach(() => {
            processor = new HtmlProcessor({
                rootPath: join(process.cwd(), "__fixtures__/extensions/kitchen-sink"),
                manifestPath: "",
                watch: false,
            });
            input = [optionsHtml, popupHtml, backgroundJs] as InputOption;

            cache.css = [];
            cache.html = [];
            cache.html$ = [];
            cache.img = [];
            cache.input = [];
            cache.js = [];
            cache.scripts = [];
        });

        it("Input must be string, array or onject", () => {
            assert.throws(() => processor.resolveInput(), `options.input cannot be`);
        });

        [,"", [], {} as InputOption, "index.js", "index.ts", [ "index.js", "index.ts" ], { index: "index.js" }].forEach((input?: InputOption) => {
            it("Input not changed without html input", () => {
                assert.deepStrictEqual(processor.resolveInput(input), input);
            });
        });

        [{
            in: optionsHtml,
            out: {
                options1: slash("__fixtures__/extensions/kitchen-sink/options1.js"),
                options2: slash("__fixtures__/extensions/kitchen-sink/options2.jsx"),
                options3: slash("__fixtures__/extensions/kitchen-sink/options3.ts"),
                options4: slash("__fixtures__/extensions/kitchen-sink/options4.tsx"),
            },
        }, {
            in: popupHtml,
            out: {
                "popup/popup": slash("__fixtures__/extensions/kitchen-sink/popup/popup.js"),
            },
        }, {
            in: [optionsHtml, popupHtml],
            out: {
                options1: slash("__fixtures__/extensions/kitchen-sink/options1.js"),
                options2: slash("__fixtures__/extensions/kitchen-sink/options2.jsx"),
                options3: slash("__fixtures__/extensions/kitchen-sink/options3.ts"),
                options4: slash("__fixtures__/extensions/kitchen-sink/options4.tsx"),
                "popup/popup": slash("__fixtures__/extensions/kitchen-sink/popup/popup.js"),
            },
        }, {
            in: [optionsHtml, popupHtml, backgroundJs],
            out: {
                options1: slash("__fixtures__/extensions/kitchen-sink/options1.js"),
                options2: slash("__fixtures__/extensions/kitchen-sink/options2.jsx"),
                options3: slash("__fixtures__/extensions/kitchen-sink/options3.ts"),
                options4: slash("__fixtures__/extensions/kitchen-sink/options4.tsx"),
                "popup/popup": slash("__fixtures__/extensions/kitchen-sink/popup/popup.js"),
                background: slash(backgroundJs),
            },
        }].forEach(usecase => {
            it("returns input as input record", () => {
                const result = processor.resolveInput(usecase.in);
                // normalize path
                if (typeof result === "string") {
                    assert.deepEqual(slash(result), usecase.out as InputOption);
                } else if (Array.isArray(result)) {
                    assert.deepEqual(result.map(filepath => slash(filepath)), usecase.out as InputOption);
                } else if (typeof result === "object") {
                    const output = Object.keys(result).reduce((obj, key) => {
                        obj[slash(key)] = slash(result[key]); return obj
                    }, {} as { [entryAlias: string]: string });
                    console.log(output);
                    assert.deepEqual(output, usecase.out as InputOption);
                }
            });
        });

        // test("calls loadHtml", () => {
        //     const spy = jest.spyOn(cheerio, "loadHtml");
        //     const closureMock = jest.fn(cheerio.loadHtml(kitchenSinkRoot));
        //     spy.mockImplementation(() => closureMock);

        //     jest.clearAllMocks();

        //     plugin.options.call(context, options);

        //     expect(spy).toBeCalledTimes(1);

        //     expect(closureMock).toBeCalledTimes(2);
        //     expect(closureMock).toBeCalledWith(optionsHtml, 0, [
        //         optionsHtml,
        //         popupHtml,
        //     ]);
        //     expect(closureMock).toBeCalledWith(popupHtml, 1, [
        //         optionsHtml,
        //         popupHtml,
        //     ]);
        // });

        // test("caches correct inputs & assets", () => {
        //     // Cache should be empty before hook
        //     expect(cache.css).toEqual([]);
        //     expect(cache.html).toEqual([]);
        //     expect(cache.img).toEqual([]);
        //     expect(cache.js).toEqual([]);
        //     expect(cache.scripts).toEqual([]);
        //     expect(cache.input).toEqual([]);

        //     plugin.options.call(context, options);

        //     // js, jsx, ts, tsx
        //     expect(cache.js).toEqual(
        //         [optionsJs, optionsJsx, optionsTs, optionsTsx, popupJs].map(
        //             getRelative,
        //         ),
        //     );
        //     // cached options.input
        //     expect(cache.input).toEqual([
        //         backgroundJs,
        //         ...[
        //             optionsJs,
        //             optionsJsx,
        //             optionsTs,
        //             optionsTsx,
        //             popupJs,
        //         ].map(getRelative),
        //     ]);
        //     // Assets to emit
        //     expect(cache.css).toEqual([optionsCss].map(getRelative));
        //     expect(cache.html).toEqual([optionsHtml, popupHtml]);
        //     expect(cache.img).toEqual(
        //         expect.arrayContaining(
        //             [optionsPng, optionsJpg, faviconPng, faviconIco].map(
        //                 getRelative,
        //             ),
        //         ),
        //     );
        //     // non-bundled js
        //     expect(cache.scripts).toEqual([assetJs].map(getRelative));
        // });

        // test("always parse HTML files", () => {
        //     cache.input = [optionsJs, popupHtml];

        //     const result = plugin.options.call(context, options);

        //     expect(result).toEqual({
        //         input: {
        //             background: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/background\.js$/,
        //             ),
        //             options1: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/options1\.js$/,
        //             ),
        //             options2: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/options2\.jsx$/,
        //             ),
        //             options3: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/options3\.ts$/,
        //             ),
        //             options4: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/options4\.tsx$/,
        //             ),
        //             "popup/popup": expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/popup\/popup\.js$/,
        //             ),
        //         },
        //     });
        // });

        // test("modifies html source", async () => {
        //     const files = await Promise.all([
        //         await readFile(
        //             getExtPath("kitchen-sink/options-result.html"),
        //             "utf8",
        //         ),
        //         await readFile(
        //             getExtPath("kitchen-sink/popup-result.html"),
        //             "utf8",
        //         ),
        //     ]);

        //     plugin.options.call(context, options);

        //     cache.html$.forEach(($, i) => {
        //         const html = $.html();
        //         const result = prettier.format(html, {
        //             parser: "html",
        //             ...prettierOptions,
        //         });
        //         const expected = files[i];

        //         expect(result).toBe(expected);
        //     });
        // });

        // test.skip("if cache.input exists, skip parsing html files", () => {
        //     cache.input = [optionsJs];

        //     const result = plugin.options.call(context, options);

        //     // FIXME: remove html files from options
        //     expect(result).toEqual({
        //         input: {
        //             background: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/background\.js$/,
        //             ),
        //             options1: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/options1\.js$/,
        //             ),
        //             options2: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/options2\.jsx$/,
        //             ),
        //             options3: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/options3\.ts$/,
        //             ),
        //             options4: expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/options4\.tsx$/,
        //             ),
        //             "popup/popup": expect.stringMatching(
        //                 /__fixtures__\/extensions\/kitchen-sink\/popup\/popup\.js$/,
        //             ),
        //         },
        //     });
        // });

        // test("if input has no html, do nothing", () => {
        //     const options = { input: [optionsJs] };

        //     const result = plugin.options.call(context, options);

        //     expect(result).toBe(options);
        // });

        // test("Throws with invalid input type", () => {
        //     // eslint-disable-next-line
        //     const options = { input: () => { } }

        //     const call = () => {
        //         // eslint-disable-next-line
        //         // @ts-ignore
        //         plugin.options.call(context, options);
        //     };

        //     expect(call).toThrow(
        //         new TypeError("options.input cannot be function"),
        //     );
        // });

        // test("Handles option.input as string", () => {
        //     const options = { input: optionsHtml };

        //     const result = plugin.options.call(context, options);

        //     expect(result).toMatchObject({
        //         input: {
        //             options1: "__fixtures__/extensions/kitchen-sink/options1.js",
        //             options2: "__fixtures__/extensions/kitchen-sink/options2.jsx",
        //             options3: "__fixtures__/extensions/kitchen-sink/options3.ts",
        //             options4: "__fixtures__/extensions/kitchen-sink/options4.tsx",
        //         },
        //     });
        // });

        // test("Handles options.browserPolyfill as true", () => {
        //     const plugin = htmlInputs(
        //         { srcDir, browserPolyfill: true },
        //         cache,
        //     );

        //     plugin.options.call(context, options);

        //     cache.html$.forEach(($) => {
        //         const head = $("head > script");
        //         expect(head.first().attr("src")).toBe(
        //             "/assets/browser-polyfill.js",
        //         );
        //         expect(head.next().attr("src")).toBe(
        //             "/assets/browser-polyfill-executeScript.js",
        //         );
        //     });
        // });

        // test("Handles options.browserPolyfill.executeScript as true", () => {
        //     const plugin = htmlInputs(
        //         { srcDir, browserPolyfill: { executeScript: true } },
        //         cache,
        //     );

        //     plugin.options.call(context, options);

        //     cache.html$.forEach(($) => {
        //         const head = $("head > script");

        //         expect(head.next().attr("src")).toBe(
        //             "/assets/browser-polyfill-executeScript.js",
        //         );
        //     });
        // });

        // test("Handles options.browserPolyfill.executeScript as false", () => {
        //     const plugin = htmlInputs(
        //         { srcDir, browserPolyfill: { executeScript: false } },
        //         cache,
        //     );

        //     plugin.options.call(context, options);

        //     cache.html$.forEach(($) => {
        //         const head = $("head > script");

        //         expect(head.first().attr("src")).toBe(
        //             "/assets/browser-polyfill.js",
        //         );
        //         expect(
        //             head.is(
        //                 'script[src="/assets/browser-polyfill-executeScript.js"]',
        //             ),
        //         ).toBe(false);
        //     });
        // });
    });
});
