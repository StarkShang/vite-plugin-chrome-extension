import { BackgroundProcessorOptions, NormalizedBackgroundProcessorOptions } from "@/modules/background/processor";
import { UseCase } from "@root/tests/common/usecase";

const normalizeOptionsTestUseCases: UseCase<BackgroundProcessorOptions, NormalizedBackgroundProcessorOptions>[] = [{
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

export default {
    normalizeOptions: normalizeOptionsTestUseCases,
};
