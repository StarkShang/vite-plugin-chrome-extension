interface Array<T> {
    forEachAsync(func:(item: T, index: number, array: any[]) => Promise<void>): Promise<void>;
}
Array.prototype.forEachAsync = async function (func: any) {
    await Promise.all(this.map(func));
}
