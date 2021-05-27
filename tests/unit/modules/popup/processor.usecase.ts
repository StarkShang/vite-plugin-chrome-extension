import { ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { PopupProcessorOptions, NormalizedPopupProcessorOptions } from "@/modules/popup/processor";
import { UseCase } from "@root/tests/common/usecase";
import { generateManifest } from "@root/tests/__fixtures__/manifests";

const normalizeOptionsUseCases: UseCase<PopupProcessorOptions, NormalizedPopupProcessorOptions>[] = [{
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

const resolveUseCases: UseCase<ChromeExtensionManifest, string|undefined>[] = [{
    description: "empty entry",
    input: generateManifest(),
    output: undefined,
}, {
    description: "with entry",
    input: generateManifest({action:{default_popup: "popup.ts"}}),
    output: "popup.ts",
}];

const buildUseCases: UseCase<{
    entry?: string,
    module: ChromeExtensionModule,
}, ChromeExtensionModule>[] = [{
    description: "undefined entry return empty ChromeExtensionModule",
    input: {
        entry: undefined,
        module: {
            entry: "popup.ts",
            bundle: "popup.js",
            dependencies: ["dependency.ts"],
        },
    },
    output: ChromeExtensionModule.Empty,
}, {
    description: "empty entry return empty ChromeExtensionModule",
    input: {
        entry: "",
        module: {
            entry: "popup.ts",
            bundle: "popup.js",
            dependencies: ["dependency.ts"],
        },
    },
    output: ChromeExtensionModule.Empty,
}, {
    description: "exist entry return cached module",
    input: {
        entry: "popup.ts",
        module: {
            entry: "popup.ts",
            bundle: "popup.js",
            dependencies: ["dependency.ts"],
        },
    },
    output: {
        entry: "popup.ts",
        bundle: "popup.js",
        dependencies: ["dependency.ts"],
    },
}];

export default {
    normalizeOptions: normalizeOptionsUseCases,
    resolve: resolveUseCases,
    build: buildUseCases,
};
