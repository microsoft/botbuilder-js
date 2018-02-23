/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, MiddlewareHandler } from 'botbuilder-core';
import { Storage, StoreItem } from './storage';
export declare function conversationState(storage: Storage): MiddlewareHandler;
export declare class ConvesationState {
    /**
     * Returns the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static get<T extends StoreItem>(context: TurnContext): T;
    /**
     * Clears the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static clear(context: TurnContext): void;
    /**
     * Reloads the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static reload(context: TurnContext): Promise<void>;
}
