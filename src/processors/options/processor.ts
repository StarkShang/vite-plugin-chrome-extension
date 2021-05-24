import { IComponentProcessor } from "../common";

export class OptionsPageProcessor implements IComponentProcessor {
    resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export class OptionsUiProcessor implements IComponentProcessor {
    resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
