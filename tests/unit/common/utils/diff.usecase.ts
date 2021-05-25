import { ChromeExtensionManifestEntryPatch } from "@/modules/manifest/types";
import { UseCase } from "@root/tests/common/usecase";

const diffStringArrayUseCase: UseCase<{
    current?: string[],
    last?: string[],
}, ChromeExtensionManifestEntryPatch<string|undefined>[]>[] = [{
    description: "no input",
    input: {},
    output: [],
}, {
    description: "undefined to undefined",
    input: {
        current: undefined,
        last: undefined,
    },
    output: [],
}, {
    description: "undefined to []",
    input: {
        current: [],
        last: undefined,
    },
    output: [],
}, {
    description: "[] to undefined",
    input: {
        current: undefined,
        last: [],
    },
    output: [],
}, {
    description: "[] to []",
    input: {
        current: [],
        last: [],
    },
    output: [],
}, {
    description: "add: undefined to [a]",
    input: {
        current: ["a"],
        last: undefined,
    },
    output: [{
        before: undefined,
        after: "a",
    }],
}, {
    description: "add: [] to [a]",
    input: {
        current: ["a"],
        last: [],
    },
    output: [{
        before: undefined,
        after: "a",
    }],
}, {
    description: "add: [a] to [a,b]",
    input: {
        current: ["a", "b"],
        last: ["a"],
    },
    output: [{
        before: undefined,
        after: "b",
    }],
}, {
    description: "add: [a] to [b,a]",
    input: {
        current: ["b", "a"],
        last: ["a"],
    },
    output: [{
        before: undefined,
        after: "b",
    }],
}, {
    description: "add: [a] to [a,b,c]",
    input: {
        current: ["a", "b", "c"],
        last: ["a"],
    },
    output: [{
        before: undefined,
        after: "b",
    }, {
        before: undefined,
        after: "c",
    }],
}, {
    description: "add: [b] to [a,b,c]",
    input: {
        current: ["a", "b", "c"],
        last: ["b"],
    },
    output: [{
        before: undefined,
        after: "a",
    }, {
        before: undefined,
        after: "c",
    }],
}, {
    description: "add: [c] to [a,b,c]",
    input: {
        current: ["a", "b", "c"],
        last: ["c"],
    },
    output: [{
        before: undefined,
        after: "a",
    }, {
        before: undefined,
        after: "b",
    }],
}, {
    description: "delete: [a] to undefined",
    input: {
        current: undefined,
        last: ["a"],
    },
    output: [{
        before: "a",
        after: undefined,
    }],
}, {
    description: "delete: [a] to []",
    input: {
        current: [],
        last: ["a"],
    },
    output: [{
        before: "a",
        after: undefined,
    }],
}, {
    description: "delete: [a,b] to [a]",
    input: {
        current: ["a"],
        last: ["a", "b"],
    },
    output: [{
        before: "b",
        after: undefined,
    }],
}, {
    description: "delete: [a,b] to [b]",
    input: {
        current: ["b"],
        last: ["a", "b"],
    },
    output: [{
        before: "a",
        after: undefined,
    }],
}, {
    description: "delete: [a,b,c] to [a]",
    input: {
        current: ["a"],
        last: ["a", "b", "c"],
    },
    output: [{
        before: "b",
        after: undefined,
    }, {
        before: "c",
        after: undefined,
    }],
}];

export default {
    diffStringArray: diffStringArrayUseCase,
}
