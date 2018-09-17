/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotState } from './botState';
import { TurnContext } from './turnContext';

// NEW
export interface StatePropertyAccessor<T = any> {
    delete(context: TurnContext): Promise<void>;
    get(context: TurnContext, defaultValue?: T): Promise<T|undefined>;
    set(context: TurnContext, value: T): Promise<void>;
}

// NEW
export class BotStatePropertyAccessor<T = any> implements StatePropertyAccessor<T> {
    constructor(protected readonly state: BotState, public readonly name: string) { }

    public async delete(context: TurnContext): Promise<void> {
        const obj: any = await this.state.load(context);
        if (obj.hasOwnProperty(this.name)) {
            delete obj[this.name];
        }
    }

    public async get(context: TurnContext, defaultValue?: T): Promise<T|undefined> {
        const obj: any = await this.state.load(context);
        if (!obj.hasOwnProperty(this.name) && defaultValue !== undefined) {
            const clone: any =
                (typeof defaultValue === 'object' || Array.isArray(defaultValue)) ? JSON.parse(JSON.stringify(defaultValue)) : defaultValue;
            obj[this.name] = clone;
        }

        return obj[this.name];
    }

    public async set(context: TurnContext, value: T): Promise<void> {
        const obj: any = await this.state.load(context);
        obj[this.name] = value;
    }
}
