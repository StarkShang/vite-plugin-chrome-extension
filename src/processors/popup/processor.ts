import { IComponentProcessor } from "../common";

export class PopupProcessor implements IComponentProcessor {
    resolve(entry: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    stop(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
