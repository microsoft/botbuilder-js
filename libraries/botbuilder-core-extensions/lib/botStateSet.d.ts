/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { BotState } from './botState';
import { StoreItem } from './storage';
/**
 * :package: **botbuilder-core-extensions**
 *
 * Middleware that will call `read()` and `write()` in parallel on multiple `BotState`
 * instances.
 */
export declare class BotStateSet implements Middleware {
    private middleware;
    /**
     * Creates a new BotStateSet instance.
     * @param middleware Zero or more BotState plugins to register.
     */
    constructor(...middleware: BotState[]);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    /**
     * Registers `BotState` middleware plugins with the set.
     * @param middleware One or more BotState plugins to register.
     */
    use(...middleware: BotState[]): this;
    /**
     * Calls `BotState.read()` on all of the BotState plugins in the set. This will trigger all of
     * the plugins to read in their state in parallel.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.
     */
    readAll(context: TurnContext, force?: boolean): Promise<StoreItem[]>;
    /**
     * Calls `BotState.write()` on all of the BotState plugins in the set. This will trigger all of
     * the plugins to write out their state in parallel.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`.
     */
    writeAll(context: TurnContext, force?: boolean): Promise<void>;
}
