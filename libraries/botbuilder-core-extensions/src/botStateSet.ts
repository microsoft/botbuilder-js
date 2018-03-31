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
export class BotStateSet implements Middleware {
    private middleware: BotState[] = [];

    /**
     * Creates a new BotStateSet instance.
     * @param middleware Zero or more BotState plugins to register.
     */
    constructor(...middleware: BotState[]) { 
        BotStateSet.prototype.use.apply(this, middleware);
    }
    
    public onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // Read in state, continue execution, and then flush changes on completion of turn.
        return this.readAll(context, true)
            .then(() => next())
            .then(() => this.writeAll(context));
    }

    /**
     * Registers `BotState` middleware plugins with the set.
     * @param middleware One or more BotState plugins to register.
     */
    public use(...middleware: BotState[]): this {
        middleware.forEach((plugin) => {
            if (typeof plugin.read === 'function' && typeof plugin.write === 'function') {
                this.middleware.push(plugin);
            } else {
                throw new Error(`BotStateSet: a middleware plugin was added that isn't an instance of BotState middleware.`);
            }
        });
        return this;
    }

    /**
     * Calls `BotState.read()` on all of the BotState plugins in the set. This will trigger all of 
     * the plugins to read in their state in parallel.  
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.  
     */
    public readAll(context: TurnContext, force = false): Promise<StoreItem[]> {
        const promises = this.middleware.map((plugin) => plugin.read(context, force));
        return Promise.all(promises);
    }

    /**
     * Calls `BotState.write()` on all of the BotState plugins in the set. This will trigger all of 
     * the plugins to write out their state in parallel.  
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. 
     */
    public writeAll(context: TurnContext, force = false): Promise<void> {
        const promises = this.middleware.map((plugin) => plugin.write(context, force));
        return Promise.all(promises).then(() => {});
    }
}
