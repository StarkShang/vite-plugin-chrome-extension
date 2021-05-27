import { ChromeExtensionModule } from "@/common/models";
import { ChromeExtensionManifest } from "@/manifest";
import { BackgroundProcessorOptions, NormalizedBackgroundProcessorOptions } from "@/modules/background/processor";
import { UseCase } from "@root/tests/common/usecase";
import { generateManifest } from "@root/tests/__fixtures__/manifests";

const normalizeOptionsUseCases: UseCase<BackgroundProcessorOptions, NormalizedBackgroundProcessorOptions>[] = [{
    description: "undefined watch option",
    input: {
        rootPath: __dirname,
    },
    output: {
        rootPath: __dirname,
        watch: undefined,
        plugins: [],
    }
}, {
    description: "undefined watch option",
    input: {
        rootPath: __dirname,
        watch: undefined,
    },
    output: {
        rootPath: __dirname,
        watch: undefined,
        plugins: [],
    }
}, {
    description: "false watch option",
    input: {
        rootPath: __dirname,
        watch: false,
    },
    output: {
        rootPath: __dirname,
        watch: undefined,
        plugins: [],
    }
}, {
    description: "null watch option",
    input: {
        rootPath: __dirname,
        watch: null,
    },
    output: {
        rootPath: __dirname,
        watch: null,
        plugins: [],
    }
}, {
    description: "true watch option",
    input: {
        rootPath: __dirname,
        watch: true,
    },
    output: {
        rootPath: __dirname,
        watch: {},
        plugins: [],
    }
}, {
    description: "empty watch option",
    input: {
        rootPath: __dirname,
        watch: {},
    },
    output: {
        rootPath: __dirname,
        watch: {},
        plugins: [],
    }
}, {
    description: "user defined watch option",
    input: {
        rootPath: __dirname,
        watch: {
            clearScreen: false,
        }
    },
    output: {
        rootPath: __dirname,
        watch: {
            clearScreen: false,
        },
        plugins: [],
    }
}, {
    description: "empty plugins",
    input: {
        rootPath: __dirname,
        plugins: [],
    },
    output: {
        rootPath: __dirname,
        watch: undefined,
        plugins: [],
    }
}, {
    description: "user defined plugin",
    input: {
        rootPath: __dirname,
        plugins: [{ name: "test" }],
    },
    output: {
        rootPath: __dirname,
        watch: undefined,
        plugins: [{ name: "test" }],
    }
}, {
    description: "user defined plugins",
    input: {
        rootPath: __dirname,
        plugins: [
            { name: "test1" },
            { name: "test2" },
        ],
    },
    output: {
        rootPath: __dirname,
        watch: undefined,
        plugins: [
            { name: "test1" },
            { name: "test2" },
        ],
    }
}];

const resolveUseCases: UseCase<ChromeExtensionManifest, string | undefined>[] = [{
    description: "empty entry",
    input: generateManifest(),
    output: undefined,
}, {
    description: "with entry",
    input: generateManifest({ background: { service_worker: "background.ts" } }),
    output: "background.ts",
}];

const buildUseCases: UseCase<{
    entry?: string,
    module: ChromeExtensionModule,
}, ChromeExtensionModule>[] = [{
    description: "undefined entry return empty ChromeExtensionModule",
    input: {
        entry: undefined,
        module: {
            entry: "entry.ts",
            bundle: "entry.js",
            dependencies: ["dependency.ts"],
        },
    },
    output: ChromeExtensionModule.Empty,
}, {
    description: "empty entry return empty ChromeExtensionModule",
    input: {
        entry: "",
        module: {
            entry: "entry.ts",
            bundle: "entry.js",
            dependencies: ["dependency.ts"],
        },
    },
    output: ChromeExtensionModule.Empty,
}, {
    description: "exist entry return cached module",
    input: {
        entry: "entry.ts",
        module: {
            entry: "entry.ts",
            bundle: "entry.js",
            dependencies: ["dependency.ts"],
        },
    },
    output: {
        entry: "entry.ts",
        bundle: "entry.js",
        dependencies: ["dependency.ts"],
    },
}];

export default {
    normalizeOptions: normalizeOptionsUseCases,
    resolve: resolveUseCases,
    build: buildUseCases,
};
