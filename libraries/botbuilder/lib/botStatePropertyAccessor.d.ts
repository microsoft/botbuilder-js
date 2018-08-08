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
    get(context: TurnContext): Promise<T | undefined>;
    set(context: TurnContext, value: T): Promise<void>;
}
/** NEW */
export declare class BotStatePropertyAccessor<T = any> implements PropertyAccessor<T> {
    protected readonly state: BotState;
    readonly name: string;
    readonly defaultValue: T;
    constructor(state: BotState, name: string, defaultValue?: T);
    delete(context: TurnContext): Promise<void>;
    get(context: TurnContext): Promise<T | undefined>;
    set(context: TurnContext, value: T): Promise<void>;
}
