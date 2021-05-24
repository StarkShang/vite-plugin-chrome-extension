import { IComponentProcessor } from "../common";

export class OverrideBookmarksProcessor implements IComponentProcessor {
    resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export class OverrideHistoryProcessor implements IComponentProcessor {
    resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export class OverrideNewtabProcessor implements IComponentProcessor {
    resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
