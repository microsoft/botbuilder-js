/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from './turnContext';
import { BotState } from './botState';

/** NEW */
export interface PropertyAccessor<T = any> {
    delete(context: TurnContext): Promise<void>;
    get(context: TurnContext): Promise<T|undefined>;
    set(context: TurnContext, value: T): Promise<void>;
}

/** NEW */
export class BotStatePropertyAccessor<T = any> implements PropertyAccessor<T> {
    constructor(protected readonly state: BotState, public readonly name: string, public readonly defaultValue?: T) { }

    public async delete(context: TurnContext): Promise<void> {
        const obj = await this.state.read(context);
        if (obj.hasOwnProperty(this.name)) {
            delete obj[this.name];
        }
    }

    public async get(context: TurnContext): Promise<T|undefined> {
        const obj = await this.state.read(context);
        if (!obj.hasOwnProperty(this.name) && this.defaultValue !== undefined) {
            const clone = typeof this.defaultValue === 'object' || Array.isArray(this.defaultValue) ? JSON.parse(JSON.stringify(this.defaultValue)) : this.defaultValue;
            obj[this.name] = clone;
        }
        return obj[this.name];
    }

    public async set(context: TurnContext, value: T): Promise<void> {
        const obj = await this.state.read(context);
        obj[this.name] = value;
    }
}

