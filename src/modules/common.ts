import { EventEmitter } from "events";

export interface IComponentProcessor {
    resolve(entry: string): Promise<string>;
    stop(): Promise<void>;
    build(entry: string): Promise<string>;
    on(eventName: string, callback: (...args: any[]) => void): void;
}

export abstract class ComponentProcessor implements IComponentProcessor {
    private _event: EventEmitter = new EventEmitter();

    public on(eventName: string, callback: (...args: any[]) => void) {
        this._event.on(eventName, callback);
    }

    public off(eventName: string, callback: (...args: any[]) => void) {
        this._event.off(eventName, callback);
    }

    public abstract resolve(entry: string): Promise<string>;
    public abstract stop(): Promise<void>;
    public abstract build(entry: string): Promise<string>;
}
