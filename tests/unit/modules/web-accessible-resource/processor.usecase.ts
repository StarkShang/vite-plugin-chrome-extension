import { MarkableChromeExtensionModule } from "@/common/models";
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

const buildUseCases: UseCase<{
    entries: string[],
    modules: Map<string, MarkableChromeExtensionModule>,
}, MarkableChromeExtensionModule[]>[] = [{
    description: "empty entries return empty ChromeExtensionModule",
    input: {
        entries: [],
        modules: new Map<string, MarkableChromeExtensionModule>([[
            "web-accessible-resource.ts", {
                entry: "web-accessible-resource.ts",
                bundle: "web-accessible-resource.js",
                dependencies: [],
                visited: true,
            }]]),
    },
    output: [],
}, {
    description: "exist entry return cached module",
    input: {
        entries: ["web-accessible-resource.ts"],
        modules: new Map<string, MarkableChromeExtensionModule>([[
            "web-accessible-resource.ts", {
                entry: "web-accessible-resource.ts",
                bundle: "web-accessible-resource.js",
                dependencies: [],
                visited: true,
            }]]),
    },
    output: [{
        entry: "web-accessible-resource.ts",
        bundle: "web-accessible-resource.js",
        dependencies: [],
        visited: true,
    }],
}, {
    description: "exist entries return cached modules",
    input: {
        entries: ["content-script1.ts"],
        modules: new Map<string, MarkableChromeExtensionModule>([[
            "content-script1.ts", {
                entry: "content-script1.ts",
                bundle: "content-script1.js",
                dependencies: [],
                visited: true,
            }], [
            "content-script2.ts", {
                entry: "content-script2.ts",
                bundle: "content-script2.js",
                dependencies: [],
                visited: true,
            }]]),
    },
    output: [{
        entry: "content-script1.ts",
        bundle: "content-script1.js",
        dependencies: [],
        visited: true,
    }],
}];

export default {
    normalizeOptions: normalizeOptionsUseCases,
    resolve: resolveUseCases,
    build: buildUseCases,
};
