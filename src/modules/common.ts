export interface IComponentProcessor {
    resolve(entry: string): Promise<string>;
    stop(): Promise<void>;
}
