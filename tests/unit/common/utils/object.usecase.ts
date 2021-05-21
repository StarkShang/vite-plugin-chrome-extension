const removeUndefinedProperty = {
    empty: [{}, {a:undefined},{a:{}},{b:[]}],
    objects: [{
        input: {a:1},
        output: {a:1},
    }, {
        input: {a:1,b:undefined},
        output: {a:1},
    }, {
        input: {a:1,b:{}},
        output: {a:1},
    }, {
        input: {a:1,b:[]},
        output: {a:1},
    }, {
        input: {a:1,b:{c:{d:{}}}},
        output: {a:1},
    }],
};

export default {
    removeUndefinedProperty,
}
