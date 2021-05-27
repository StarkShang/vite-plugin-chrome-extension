import { ChromeExtensionManifest } from "@/manifest";
import { WebAccessibleResourceProcessorOptions, NormalizedWebAccessibleResourceProcessorOptions } from "@/modules/web-accessible-resource/processor";
import { UseCase } from "@root/tests/common/usecase";
import { generateManifest } from "@root/tests/__fixtures__/manifests";

const normalizeOptionsUseCases: UseCase<WebAccessibleResourceProcessorOptions, NormalizedWebAccessibleResourceProcessorOptions>[] = [{
    description: "undefined watch option",
    input: {
    },
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
        web_accessible_resources: [{
            matches: ["all_urls"],
            resources: ["web_accessible_resources.ts"]
        }]
    }),
    output: ["web_accessible_resources.ts"],
}, {
    description: "with entries",
    input: generateManifest({
        web_accessible_resources: [{
            matches: ["all_urls"],
            resources: ["web_accessible_resources1.ts", "web_accessible_resources2.ts"]
        }]
    }),
    output: ["web_accessible_resources2.ts", "web_accessible_resources1.ts"],
}, {
    description: "with entry groups",
    input: generateManifest({
        web_accessible_resources: [{
            matches: ["all_urls"],
            resources: ["web_accessible_resources1.ts"]
        }, {
            matches: ["all_urls"],
            resources: ["web_accessible_resources2.ts"]
        }]
    }),
    output: ["web_accessible_resources2.ts", "web_accessible_resources1.ts"],
}];

export default {
    normalizeOptions: normalizeOptionsUseCases,
    resolve: resolveUseCases,
};
