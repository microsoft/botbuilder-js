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
export interface StatePropertyAccessor<T = any> {
    delete(context: TurnContext): Promise<void>;
    get(context: TurnContext, defaultValue?: T): Promise<T | undefined>;
    set(context: TurnContext, value: T): Promise<void>;
}
/** NEW */
export declare class BotStatePropertyAccessor<T = any> implements StatePropertyAccessor<T> {
    protected readonly state: BotState;
    readonly name: string;
    constructor(state: BotState, name: string);
    delete(context: TurnContext): Promise<void>;
    get(context: TurnContext, defaultValue?: T): Promise<T | undefined>;
    set(context: TurnContext, value: T): Promise<void>;
}
