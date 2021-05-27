import { ChromeExtensionManifest } from "@/manifest";
import { ContentScriptProcessorOptions, NormalizedContentScriptProcessorOptions } from "@/modules/content-script/processor";
import { UseCase } from "@root/tests/common/usecase";
import { generateManifest } from "@root/tests/__fixtures__/manifests";

const normalizeOptionsUseCases: UseCase<ContentScriptProcessorOptions, NormalizedContentScriptProcessorOptions>[] = [{
    description: "undefined watch option",
    input: { },
    output: {
        watch: undefined,
        plugins: [],
    }
}, {
    description: "undefined watch option",
    input: {
        watch: undefined,
    },
    output: {
        watch: undefined,
        plugins: [],
    }
}, {
    description: "false watch option",
    input: {
        watch: false,
    },
    output: {
        watch: undefined,
        plugins: [],
    }
}, {
    description: "null watch option",
    input: {
        watch: null,
    },
    output: {
        watch: null,
        plugins: [],
    }
}, {
    description: "true watch option",
    input: {
        watch: true,
    },
    output: {
        watch: {},
        plugins: [],
    }
}, {
    description: "empty watch option",
    input: {
        watch: {},
    },
    output: {
        watch: {},
        plugins: [],
    }
}, {
    description: "user defined watch option",
    input: {
        watch: {
            clearScreen: false,
        }
    },
    output: {
        watch: {
            clearScreen: false,
        },
        plugins: [],
    }
}, {
    description: "empty plugins",
    input: {
        plugins: [],
    },
    output: {
        watch: undefined,
        plugins: [],
    }
}, {
    description: "user defined plugin",
    input: {
        plugins: [{ name: "test" }],
    },
    output: {
        watch: undefined,
        plugins: [{ name: "test" }],
    }
}, {
    description: "user defined plugins",
    input: {
        plugins: [
            { name: "test1" },
            { name: "test2" },
        ],
    },
    output: {
        watch: undefined,
        plugins: [
            { name: "test1" },
            { name: "test2" },
        ],
    }
}];

const resolveUseCases: UseCase<ChromeExtensionManifest, string[]>[] = [{
    description: "empty entries",
    input: generateManifest(),
    output: [],
}, {
    description: "with entry",
    input: generateManifest({
        content_scripts: [{
            matches: ["all_urls"],
            js: ["content_script.ts"]
        }]
    }),
    output: ["content_script.ts"],
}, {
    description: "with entries",
    input: generateManifest({
        content_scripts: [{
            matches: ["all_urls"],
            js: ["content_script1.ts", "content_script2.ts"]
        }]
    }),
    output: ["content_script2.ts", "content_script1.ts"],
}, {
    description: "with entry groups",
    input: generateManifest({
        content_scripts: [{
            matches: ["all_urls"],
            js: ["content_script1.ts"]
        }, {
            matches: ["all_urls"],
            js: ["content_script2.ts"]
        }]
    }),
    output: ["content_script2.ts", "content_script1.ts"],
}];

export default {
    normalizeOptions: normalizeOptionsUseCases,
    resolve: resolveUseCases,
};
