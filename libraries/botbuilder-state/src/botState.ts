/**
 * @module botbuilder-state
 */
/** second comment block */
import { BotContext } from 'botbuilder';
import { Storage, StoreItem, StoreItems } from 'botbuilder-storage';

export class BotState<T extends StoreItem = StoreItem> {
    private _state: T;
    private _hash: string;

    constructor(public readonly storage: Storage, public readonly storageKey: string) { 
        this.clear();
    }

    public get state(): T {
        return this._state;
    }

    public read(): Promise<boolean> {
        return this.storage.read([this.storageKey])
            .then((items) => {
                if (items && items.hasOwnProperty(this.storageKey)) {
                    this._state = items[this.storageKey] as T;
                    this._hash = toHash(this._state);
                    return true;
                } else {
                    return false;
                }
            });
    }

    public write(): Promise<void> {
        const changes: StoreItems = {};
        if (this._hash !== toHash(this._state)) {
            changes[this.storageKey] = this._state;
            return this.storage.write(changes)
        } else {
            return Promise.resolve();
        }
    }

    public delete(): Promise<void> {
        return this.storage.delete([this.storageKey])
            .then(() => {
                this.clear();
            });
    }

    public clear(): void {
        this._state = {} as T;
        this._hash = '';
    }
}

function toHash(item: StoreItem): string {
    const clone = Object.assign({}, item);
    if (clone.eTag) { delete clone.eTag };
    return JSON.stringify(clone);
}
