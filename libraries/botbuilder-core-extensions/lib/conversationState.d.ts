/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { Storage, StoreItem } from './storage';
export declare class ConversationState<T extends StoreItem = StoreItem> implements Middleware {
    private storage;
    constructor(storage: Storage);
    onProcessRequest(context: TurnContext, next: () => Promise<void>): Promise<void>;
    /**
     * Reads in and caches the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.
     */
    read(context: TurnContext, force?: boolean): Promise<T>;
    /**
     * Writes out the conversation state if it's been changed.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`.
     */
    write(context: TurnContext, force?: boolean): Promise<void>;
    /**
     * Clears the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    clear(context: TurnContext): void;
    /**
     * Returns the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static get<T extends StoreItem>(context: TurnContext): T;
    /**
     * Returns the storage key for the current conversation state.
     * @param context Context for current turn of conversation with the user.
     */
    static key(context: TurnContext): string | undefined;
}
