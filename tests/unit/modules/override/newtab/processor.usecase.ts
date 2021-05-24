import { OverrideNewtabProcessorOptions, NormalizedOverrideNewtabProcessorOptions } from "@/modules/override/processor";
import { UseCase } from "@root/tests/common/usecase";

const normalizeOptionsTestUseCases: UseCase<OverrideNewtabProcessorOptions, NormalizedOverrideNewtabProcessorOptions>[] = [{
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

export default {
    normalizeOptions: normalizeOptionsTestUseCases,
};
