export function removeUndefinedProperty<T extends Record<string, any>>(obj: T): T | undefined {
    const result = Object.keys(obj)
        .map(key => {
            const prop = obj[key];
            if (typeof prop === "object") {
                const a = obj[key];
                (obj as Record<string, T | undefined>)[key] = removeUndefinedProperty(prop);
            }
            return key;
        })
        .filter(key => obj[key] !== undefined)
        .reduce((out, key) => {
            (out as Record<string, T | undefined>)[key] = obj[key];
            return out;
        }, {} as T)
    return Object.keys(result).length > 0 ? result : undefined;
}
