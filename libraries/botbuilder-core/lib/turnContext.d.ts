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
export declare type SendActivitiesHandler = (context: TurnContext, activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>) => Promiseable<ResourceResponse[]>;
/**
 * :package: **botbuilder-core**
 *
 * Signature implemented by functions registered with `context.onUpdateActivity()`.
 */
export declare type UpdateActivityHandler = (context: TurnContext, activity: Partial<Activity>, next: () => Promise<void>) => Promiseable<void>;
/**
 * :package: **botbuilder-core**
 *
 * Signature implemented by functions registered with `context.onDeleteActivity()`.
 */
export declare type DeleteActivityHandler = (context: TurnContext, reference: Partial<ConversationReference>, next: () => Promise<void>) => Promiseable<void>;
export interface TurnContext {
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
export declare class TurnContext {
    private _adapter;
    private _activity;
    private _respondedRef;
    private _services;
    private _onSendActivities;
    private _onUpdateActivity;
    private _onDeleteActivity;
    /**
     * Creates a new BotContext instance for a turn of conversation.
     * @param adapterOrContext Adapter that constructed the context or a context object to clone.
     * @param request Request being processed.
     */
    constructor(adapterOrContext: BotAdapter, request: Partial<Activity>);
    constructor(adapterOrContext: TurnContext);
    /**
     * Called when this BotContext instance is passed into the constructor of a new BotContext
     * instance.
     * @param context The context object to copy private members to. Everything should be copied by reference.
     */
    protected copyTo(context: TurnContext): void;
    /** The adapter for this context. */
    readonly adapter: BotAdapter;
    /** The received activity. */
    readonly activity: Activity;
    /** If `true` at least one response has been sent for the current turn of conversation. */
    responded: boolean;
    /** Map of services and other values cached for the lifetime of the turn. */
    readonly services: Map<any, any>;
    /**
     * Sends a single activity or message to the user.
     * @param activityOrText Activity or text of a message to send the user.
     * @param speak (Optional) SSML that should be spoken to the user for the message.
     * @param inputHint (Optional) `InputHint` for the message sent to the user.
     */
    sendActivity(activityOrText: string | Partial<Activity>, speak?: string, inputHint?: string): Promise<ResourceResponse | undefined>;
    /**
     * Sends a set of activities to the user. An array of responses form the server will be returned.
     *
     * Prior to delivery, the activities will be updated with information from the `ConversationReference`
     * for the contexts [activity](#activity) and if an activities `type` field hasn't been set it will be
     * set to a type of `message`. The array of activities will then be routed through any [onSendActivities()](#onsendactivities)
     * handlers and then passed to `adapter.sendActivities()`.
     * @param activities One or more activities to send to the user.
     */
    sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    /**
     * Replaces an existing activity.
     *
     * The activity will be routed through any registered [onUpdateActivity](#onupdateactivity) handlers
     * before being passed to `adapter.updateActivity()`.
     * @param activity New replacement activity. The activity should already have it's ID information populated.
     */
    updateActivity(activity: Partial<Activity>): Promise<void>;
    /**
     * Deletes an existing activity.
     *
     * The `ConversationReference` for the activity being deleted will be routed through any registered
     * [onDeleteActivity](#ondeleteactivity) handlers before being passed to `adapter.deleteActivity()`.
     * @param idOrReference ID or conversation of the activity being deleted. If an ID is specified the conversation reference information from the current request will be used to delete the activity.
     */
    deleteActivity(idOrReference: string | Partial<ConversationReference>): Promise<void>;
    /**
     * Registers a handler to be notified of and potentially intercept the sending of activities.
     * @param handler A function that will be called anytime [sendActivity()](#sendactivity) is called. The handler should call `next()` to continue sending of the activities.
     */
    onSendActivities(handler: SendActivitiesHandler): this;
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
