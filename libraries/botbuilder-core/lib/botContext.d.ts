/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ResourceResponse, ConversationReference } from 'botframework-schema';
import { BotAdapter } from './botAdapter';
import { Promiseable } from './middlewareSet';
/**
 * :package: **botbuilder-core**
 *
 * Signature implemented by functions registered with `context.onSendActivity()`.
 */
export declare type SendActivityHandler = (context: BotContext, activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>) => Promiseable<ResourceResponse[]>;
/**
 * :package: **botbuilder-core**
 *
 * Signature implemented by functions registered with `context.onUpdateActivity()`.
 */
export declare type UpdateActivityHandler = (context: BotContext, activity: Partial<Activity>, next: () => Promise<void>) => Promiseable<void>;
/**
 * :package: **botbuilder-core**
 *
 * Signature implemented by functions registered with `context.onDeleteActivity()`.
 */
export declare type DeleteActivityHandler = (context: BotContext, reference: Partial<ConversationReference>, next: () => Promise<void>) => Promiseable<void>;
export interface BotContext {
}
/**
 * :package: **botbuilder-core**
 *
 * Context object containing information cached for a single turn of conversation with a user. This
 * will typically be created by the adapter you're using and then passed to middleware and your
 * bots logic.
 *
 * For TypeScript developers the `BotContext` is also exposed as an interface which you can derive
 * from to better describe the actual shape of the context object being passed around.  Middleware
 * can potentially extend the context object with additional members so in order to get intellisense
 * for those added members you'll need to define them on an interface that extends BotContext:
 *
 * ```JavaScript
 * interface MyContext extends BotContext {
 *      // Added by UserState middleware.
 *      readonly userState: MyUserState;
 *
 *      // Added by ConversationState middleware.
 *      readonly conversationState: MyConversationState;
 * }
 *
 * adapter.processRequest(req, res, (context: MyContext) => {
 *      const state = context.conversationState;
 * });
 * ```
 */
export declare class BotContext {
    private _adapter;
    private _request;
    private _respondedRef;
    private _cache;
    private _onSendActivity;
    private _onUpdateActivity;
    private _onDeleteActivity;
    /**
     * Creates a new BotContext instance for a turn of conversation.
     * @param adapterOrContext Adapter that constructed the context or a context object to clone.
     * @param request Request being processed.
     */
    constructor(adapterOrContext: BotAdapter, request: Partial<Activity>);
    constructor(adapterOrContext: BotContext);
    /**
     * Called when this BotContext instance is passed into the constructor of a new BotContext
     * instance.
     * @param context The context object to copy private members to. Everything should be copied by reference.
     */
    protected copyTo(context: BotContext): void;
    /** The adapter for this context. */
    readonly adapter: BotAdapter;
    /** The received activity. */
    readonly request: Activity;
    /** If `true` at least one response has been sent for the current turn of conversation. */
    responded: boolean;
    /**
     * Gets a value previously cached on the context.
     * @param T (Optional) type of value being returned.
     * @param key The key to lookup in the cache.
     */
    get<T = any>(key: any): T;
    /**
     * Returns `true` if [set()](#set) has been called for a key. The cached value may be `undefined`.
     * @param key The key to lookup in the cache.
     */
    has(key: any): boolean;
    /**
     * Caches a value for the lifetime of the current turn.
     * @param key The key of the value being cached.
     * @param value The value to cache.
     */
    set(key: any, value: any): this;
    /**
     * Sends a set of activities to the user. An array of responses form the server will be
     * returned.
     * @param activityOrText One or more activities or messages to send to the user. If a `string` is provided it will be sent to the user as a `message` activity.
     */
    sendActivity(...activityOrText: (Partial<Activity> | string)[]): Promise<ResourceResponse[]>;
    /**
     * Replaces an existing activity.
     * @param activity New replacement activity. The activity should already have it's ID information populated.
     */
    updateActivity(activity: Partial<Activity>): Promise<void>;
    /**
     * Deletes an existing activity.
     * @param idOrReference ID or conversation of the activity being deleted. If an ID is specified the conversation reference information from the current request will be used to delete the activity.
     */
    deleteActivity(idOrReference: string | Partial<ConversationReference>): Promise<void>;
    /**
     * Registers a handler to be notified of and potentially intercept the sending of activities.
     * @param handler A function that will be called anytime [sendActivity()](#sendactivity) is called. The handler should call `next()` to continue sending of the activities.
     */
    onSendActivity(handler: SendActivityHandler): this;
    /**
     * Registers a handler to be notified of and potentially intercept an activity being updated.
     * @param handler A function that will be called anytime [updateActivity()](#updateactivity) is called. The handler should call `next()` to continue sending of the replacement activity.
     */
    onUpdateActivity(handler: UpdateActivityHandler): this;
    /**
     * Registers a handler to be notified of and potentially intercept an activity being deleted.
     * @param handler A function that will be called anytime [deleteActivity()](#deleteactivity) is called. The handler should call `next()` to continue deletion of the activity.
     */
    onDeleteActivity(handler: DeleteActivityHandler): this;
    private emit<T>(handlers, arg, next);
    /**
     * Returns the conversation reference for an activity. This can be saved as a plain old JSON
     * object and then later used to message the user proactively.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * const reference = TurnContext.getConversationReference(context.request);
     * ```
     * @param activity The activity to copy the conversation reference from
     */
    static getConversationReference(activity: Partial<Activity>): Partial<ConversationReference>;
    /**
     * Updates an activity with the delivery information from a conversation reference. Calling
     * this after [getConversationReference()](#getconversationreference) on an incoming activity
     * will properly address the reply to a received activity.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * // Send a typing indicator without calling any handlers
     * const reference = TurnContext.getConversationReference(context.request);
     * const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
     * return context.adapter.sendActivity(activity);
     * ```
     * @param activity Activity to copy delivery information to.
     * @param reference Conversation reference containing delivery information.
     * @param isIncoming (Optional) flag indicating whether the activity is an incoming or outgoing activity. Defaults to `false` indicating the activity is outgoing.
     */
    static applyConversationReference(activity: Partial<Activity>, reference: Partial<ConversationReference>, isIncoming?: boolean): Partial<Activity>;
}
