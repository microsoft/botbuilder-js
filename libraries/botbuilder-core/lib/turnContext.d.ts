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
 * Signature implemented by functions registered with `context.onSendActivity()`.
 *
 * ```TypeScript
 * type SendActivitiesHandler = (context: TurnContext, activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>) => Promiseable<ResourceResponse[]>;
 * ```
 */
export declare type SendActivitiesHandler = (context: TurnContext, activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>) => Promiseable<ResourceResponse[]>;
/**
 * Signature implemented by functions registered with `context.onUpdateActivity()`.
 *
 * ```TypeScript
 * type UpdateActivityHandler = (context: TurnContext, activity: Partial<Activity>, next: () => Promise<void>) => Promiseable<void>;
 * ```
 */
export declare type UpdateActivityHandler = (context: TurnContext, activity: Partial<Activity>, next: () => Promise<void>) => Promiseable<void>;
/**
 * Signature implemented by functions registered with `context.onDeleteActivity()`.
 *
 * ```TypeScript
 * type DeleteActivityHandler = (context: TurnContext, reference: Partial<ConversationReference>, next: () => Promise<void>) => Promiseable<void>;
 * ```
 */
export declare type DeleteActivityHandler = (context: TurnContext, reference: Partial<ConversationReference>, next: () => Promise<void>) => Promiseable<void>;
export interface TurnContext {
}
/**
 * Context object containing information cached for a single turn of conversation with a user.
 *
 * @remarks
 * This will typically be created by the adapter you're using and then passed to middleware and
 * your bots logic.
 *
 * For TypeScript developers the `TurnContext` is also exposed as an interface which you can derive
 * from to better describe the actual shape of the context object being passed around.  Middleware
 * can potentially extend the context object with additional members so in order to get intellisense
 * for those added members you'll need to define them on an interface that extends TurnContext:
 *
 * ```JavaScript
 * interface MyContext extends TurnContext {
 *      // Added by UserState middleware.
 *      readonly userState: MyUserState;
 *
 *      // Added by ConversationState middleware.
 *      readonly conversationState: MyConversationState;
 * }
 *
 * adapter.processActivity(req, res, (context: MyContext) => {
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
     * Creates a new TurnContext instance.
     * @param adapterOrContext Adapter that constructed the context or a context object to clone.
     * @param request Request being processed.
     */
    constructor(adapterOrContext: BotAdapter, request: Partial<Activity>);
    constructor(adapterOrContext: TurnContext);
    /**
     * Called when this TurnContext instance is passed into the constructor of a new TurnContext
     * instance. Can be overridden in derived classes.
     * @param context The context object to copy private members to. Everything should be copied by reference.
     */
    protected copyTo(context: TurnContext): void;
    /**
     * The adapter for this context.
     *
     * @remarks
     * This example shows how to send a `typing` activity directly using the adapter. This approach
     * bypasses any middleware which sometimes has its advantages.  The class to
     * `getConversationReference()` and `applyConversationReference()` are to ensure that the
     * outgoing activity is properly addressed:
     *
     * ```JavaScript
     * // Send a typing indicator without going through an middleware listeners.
     * const reference = TurnContext.getConversationReference(context.request);
     * const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
     * await context.adapter.sendActivities([activity]);
     * ```
     */
    readonly adapter: BotAdapter;
    /**
     * The received activity.
     *
     * @remarks
     * This example shows how to get the users trimmed utterance from the activity:
     *
     * ```JavaScript
     * const utterance = (context.activity.text || '').trim();
     * ```
     */
    readonly activity: Activity;
    /**
     * If `true` at least one response has been sent for the current turn of conversation.
     *
     * @remarks
     * This is primarily useful for determining if a bot should run fallback routing logic:
     *
     * ```JavaScript
     * await routeActivity(context);
     * if (!context.responded) {
     *    await context.sendActivity(`I'm sorry. I didn't understand.`);
     * }
     * ```
     */
    responded: boolean;
    /**
     * Map of services and other values cached for the lifetime of the turn.
     *
     * @remarks
     * Middleware, other components, and services will typically use this to cache information
     * that could be asked for by a bot multiple times during a turn. The bots logic is free to
     * use this to pass information between its own components.
     *
     * ```JavaScript
     * const cart = await loadUsersShoppingCart(context);
     * context.services.set('cart', cart);
     * ```
     *
     * > [!TIP]
     * > For middleware and third party components, consider using a `Symbol()` for your cache key
     * > to avoid potential naming collisions with the bots caching and other components.
     */
    readonly services: Map<any, any>;
    /**
     * Sends a single activity or message to the user.
     *
     * @remarks
     * This ultimately calls [sendActivities()](#sendactivites) and is provided as a convenience to
     * make formating and sending individual activities easier.
     *
     * ```JavaScript
     * await context.sendActivity(`Hello World`);
     * ```
     * @param activityOrText Activity or text of a message to send the user.
     * @param speak (Optional) SSML that should be spoken to the user for the message.
     * @param inputHint (Optional) `InputHint` for the message sent to the user. Defaults to `acceptingInput`.
     */
    sendActivity(activityOrText: string | Partial<Activity>, speak?: string, inputHint?: string): Promise<ResourceResponse | undefined>;
    /**
     * Sends a set of activities to the user. An array of responses form the server will be returned.
     *
     * @remarks
     * Prior to delivery, the activities will be updated with information from the `ConversationReference`
     * for the contexts [activity](#activity) and if an activities `type` field hasn't been set it will be
     * set to a type of `message`. The array of activities will then be routed through any [onSendActivities()](#onsendactivities)
     * handlers and then passed to `adapter.sendActivities()`.
     *
     * ```JavaScript
     * await context.sendActivities([
     *    { type: 'typing' },
     *    { type: 'delay', value: 2000 },
     *    { type: 'message', text: 'Hello... How are you?' }
     * ]);
     * ```
     * @param activities One or more activities to send to the user.
     */
    sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    /**
     * Replaces an existing activity.
     *
     * @remarks
     * The activity will be routed through any registered [onUpdateActivity](#onupdateactivity) handlers
     * before being passed to `adapter.updateActivity()`.
     *
     * ```JavaScript
     * const matched = /approve (.*)/i.exec(context.text);
     * if (matched) {
     *    const update = await approveExpenseReport(matched[1]);
     *    await context.updateActivity(update);
     * }
     * ```
     * @param activity New replacement activity. The activity should already have it's ID information populated.
     */
    updateActivity(activity: Partial<Activity>): Promise<void>;
    /**
     * Deletes an existing activity.
     *
     * @remarks
     * The `ConversationReference` for the activity being deleted will be routed through any registered
     * [onDeleteActivity](#ondeleteactivity) handlers before being passed to `adapter.deleteActivity()`.
     *
     * ```JavaScript
     * const matched = /approve (.*)/i.exec(context.text);
     * if (matched) {
     *    const savedId = await approveExpenseReport(matched[1]);
     *    await context.deleteActivity(savedId);
     * }
     * ```
     * @param idOrReference ID or conversation of the activity being deleted. If an ID is specified the conversation reference information from the current request will be used to delete the activity.
     */
    deleteActivity(idOrReference: string | Partial<ConversationReference>): Promise<void>;
    /**
     * Registers a handler to be notified of and potentially intercept the sending of activities.
     *
     * @remarks
     * This example shows how to listen for and log outgoing `message` activities.
     *
     * ```JavaScript
     * context.onSendActivities(await (ctx, activities, next) => {
     *    // Deliver activities
     *    await next();
     *
     *    // Log sent messages
     *    activities.filter(a => a.type === 'message').forEach(a => logSend(a));
     * });
     * ```
     * @param handler A function that will be called anytime [sendActivity()](#sendactivity) is called. The handler should call `next()` to continue sending of the activities.
     */
    onSendActivities(handler: SendActivitiesHandler): this;
    /**
     * Registers a handler to be notified of and potentially intercept an activity being updated.
     *
     * @remarks
     * This example shows how to listen for and log updated activities.
     *
     * ```JavaScript
     * context.onUpdateActivities(await (ctx, activity, next) => {
     *    // Replace activity
     *    await next();
     *
     *    // Log update
     *    logUpdate(activity);
     * });
     * ```
     * @param handler A function that will be called anytime [updateActivity()](#updateactivity) is called. The handler should call `next()` to continue sending of the replacement activity.
     */
    onUpdateActivity(handler: UpdateActivityHandler): this;
    /**
     * Registers a handler to be notified of and potentially intercept an activity being deleted.
     *
     * @remarks
     * This example shows how to listen for and log deleted activities.
     *
     * ```JavaScript
     * context.onDeleteActivities(await (ctx, reference, next) => {
     *    // Delete activity
     *    await next();
     *
     *    // Log delete
     *    logDelete(activity);
     * });
     * ```
     * @param handler A function that will be called anytime [deleteActivity()](#deleteactivity) is called. The handler should call `next()` to continue deletion of the activity.
     */
    onDeleteActivity(handler: DeleteActivityHandler): this;
    private emit<T>(handlers, arg, next);
    /**
     * Returns the conversation reference for an activity.
     *
     * @remarks
     * This can be saved as a plain old JSON object and then later used to message the user
     * proactively.
     *
     * ```JavaScript
     * const reference = TurnContext.getConversationReference(context.request);
     * ```
     * @param activity The activity to copy the conversation reference from
     */
    static getConversationReference(activity: Partial<Activity>): Partial<ConversationReference>;
    /**
     * Updates an activity with the delivery information from a conversation reference.
     *
     * @remarks
     * Calling this after [getConversationReference()](#getconversationreference) on an incoming
     * activity will properly address the reply to a received activity.
     *
     * ```JavaScript
     * // Send a typing indicator without going through an middleware listeners.
     * const reference = TurnContext.getConversationReference(context.request);
     * const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
     * await context.adapter.sendActivities([activity]);
     * ```
     * @param activity Activity to copy delivery information to.
     * @param reference Conversation reference containing delivery information.
     * @param isIncoming (Optional) flag indicating whether the activity is an incoming or outgoing activity. Defaults to `false` indicating the activity is outgoing.
     */
    static applyConversationReference(activity: Partial<Activity>, reference: Partial<ConversationReference>, isIncoming?: boolean): Partial<Activity>;
}
