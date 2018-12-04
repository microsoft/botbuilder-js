/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotStatePropertyAccessor, StatePropertyAccessor } from './botStatePropertyAccessor';
import { PropertyManager } from './propertyManager';
import { calculateChangeHash, Storage, StorageKeyFactory, StoreItems } from './storage';
import { TurnContext } from './turnContext';

/**
 * State information cached off the context object by a `BotState` instance.
 */
export interface CachedBotState {
    /**
     * Dictionary of state values.
     */
    state: { [id: string]: any };

    /**
     * Hash of the last known state values. This is used to perform change detection.
     */
    hash: string;
}

/**
 * Base class for the frameworks state persistance scopes.
 *
 * @remarks
 * This class will read and write state, to a provided storage provider, for each turn of
 * conversation with a user. Derived classes, like `ConversationState` and `UserState`, provide a
 * `StorageKeyFactory` which is used to determine the key used to persist a given storage object.
 *
 * The state object thats loaded will be automatically cached on the context object for the
 * lifetime of the turn and will only be written to storage if it has been modified.
 */
export class BotState implements PropertyManager {

    /**
     * Collection of state property accessors added through [createProperty()](#createproperty).
     */
    public readonly properties: Map<string, StatePropertyAccessor> = new Map();
    private stateKey: symbol = Symbol('state');

    /**
     * Creates a new BotState instance.
     * @param storage Storage provider to persist the state object to.
     * @param storageKey Function called anytime the storage key for a given turn needs to be calculated.
     */
    constructor(protected storage: Storage, protected storageKey: StorageKeyFactory) { }

    /**
     * Creates a new property accessor for reading and writing an individual property to the bot
     * states storage object.
     * @param T (Optional) type of property to create. Defaults to `any` type.
     * @param name Name of the property to add. Must be unique within the set.
     */
    public createProperty<T = any>(name: string): StatePropertyAccessor<T> {
        if (this.properties.has(name)) { throw new Error(`BotState.createProperty(): a property named '${name}' already exists.`); }
        const prop: BotStatePropertyAccessor<T> = new BotStatePropertyAccessor<T>(this, name);
        this.properties.set(name, prop);

        return prop;
    }

    /**
     * Reads in and caches the backing state object for a turn.
     *
     * @remarks
     * Subsequent reads will return the cached object unless the `force` flag is passed in which
     * will force the state object to be re-read.
     *
     * This method is automatically called on first access of any of created property accessors.
     *
     * ```JavaScript
     * const state = await botState.load(context);
     * ```
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.
     */
    public load(context: TurnContext, force: boolean = false): Promise<any> {
        const cached: CachedBotState = context.turnState.get(this.stateKey);
        if (force || !cached || !cached.state) {
            return Promise.resolve(this.storageKey(context)).then((key: string) => {
                    return this.storage.read([key]).then((items: StoreItems) => {
                        const state: any = items[key] || {};
                        const hash: string = calculateChangeHash(state);
                        context.turnState.set(this.stateKey, { state: state, hash: hash });

                        return state;
                    });
                });
        }

        return Promise.resolve(cached.state);
    }

    /**
     * Saves the cached state object if it's been changed.
     *
     * @remarks
     * If the `force` flag is passed in the cached state object will be saved regardless of
     * whether its been changed or not and if no object has been cached, an empty object will be
     * created and then saved.
     *
     * ```JavaScript
     * await botState.saveChanges(context);
     * ```
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`.
     */
    public saveChanges(context: TurnContext, force: boolean = false): Promise<void> {
        let cached: CachedBotState = context.turnState.get(this.stateKey);
        if (force || (cached && cached.hash !== calculateChangeHash(cached.state))) {
            return Promise.resolve(this.storageKey(context)).then((key: string) => {
                if (!cached) { cached = { state: {}, hash: '' }; }
                cached.state.eTag = '*';
                const changes: StoreItems = {} as StoreItems;
                changes[key] = cached.state;

                return this.storage.write(changes).then(() => {
                        // Update change hash and cache
                        cached.hash = calculateChangeHash(cached.state);
                        context.turnState.set(this.stateKey, cached);
                    });
            });
        }

        return Promise.resolve();
    }

    /**
     * Clears the current state object for a turn.
     *
     * @remarks
     * The cleared state object will not be persisted until [saveChanges()](#savechanges) has
     * been called.
     *
     * ```JavaScript
     * await botState.clear(context);
     * await botState.saveChanges(context);
     * ```
     * @param context Context for current turn of conversation with the user.
     */
    public clear(context: TurnContext): Promise<void> {
        // Just overwrite cached value with a new object and empty hash. The empty hash will force the
        // changes to be saved. 
        context.turnState.set(this.stateKey, { state: {}, hash: '' });
        return Promise.resolve();
    }

    /**
     * Delete the backing state object for the current turn.
     *
     * @remarks
     * The state object will be removed from storage if it exists.  If the state object has been
     * read in and cached, the cache will be cleared. 
     *
     * ```JavaScript
     * await botState.delete(context);
     * ```
     * @param context Context for current turn of conversation with the user.
     */
    public delete(context: TurnContext): Promise<void> {
        if (context.turnState.has(this.stateKey)) {
            context.turnState.delete(this.stateKey);
        }

        return Promise.resolve(this.storageKey(context)).then((key: string) => this.storage.delete([key]));
    }

    /**
     * Returns a cached state object or undefined if not cached.
     *
     * @remarks
     * This example shows how to synchronously get an already loaded and cached state object:
     *
     * ```JavaScript
     * const state = botState.get(context);
     * ```
     * @param context Context for current turn of conversation with the user.
     */
    public get(context: TurnContext): any|undefined {
        const cached: CachedBotState = context.turnState.get(this.stateKey);

        return typeof cached === 'object' && typeof cached.state === 'object' ? cached.state : undefined;
    }
}
