/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes, ConversationReference, InputHints, ResourceResponse } from 'botframework-schema';
import { BotAdapter } from './botAdapter';
import { shallowCopy } from './internal';

/**
 * Signature implemented by functions registered with `context.onSendActivity()`.
 *
 * ```TypeScript
 * type SendActivitiesHandler = (context: TurnContext, activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>) => Promise<ResourceResponse[]>;
 * ```
 */
export type SendActivitiesHandler = (
    context: TurnContext,
    activities: Partial<Activity>[],
    next: () => Promise<ResourceResponse[]>
) => Promise<ResourceResponse[]>;

/**
 * Signature implemented by functions registered with `context.onUpdateActivity()`.
 *
 * ```TypeScript
 * type UpdateActivityHandler = (context: TurnContext, activity: Partial<Activity>, next: () => Promise<void>) => Promise<void>;
 * ```
 */
export type UpdateActivityHandler = (context: TurnContext, activity: Partial<Activity>, next: () => Promise<void>) => Promise<void>;

/**
 * Signature implemented by functions registered with `context.onDeleteActivity()`.
 *
 * ```TypeScript
 * type DeleteActivityHandler = (context: TurnContext, reference: Partial<ConversationReference>, next: () => Promise<void>) => Promise<void>;
 * ```
 */
export type DeleteActivityHandler = (
    context: TurnContext,
    reference: Partial<ConversationReference>,
    next: () => Promise<void>
) => Promise<void>;

// tslint:disable-next-line:no-empty-interface
export interface TurnContext {}

/**
 * Context object containing information cached for a single turn of conversation with a user.
 *
 * @remarks
 * This will typically be created by the adapter you're using and then passed to middleware and
 * your bots logic.
 */
export class TurnContext {
    private _adapter: BotAdapter | undefined;
    private _activity: Activity | undefined;
    private _respondedRef: { responded: boolean } = { responded: false };
    private _turnState: Map<any, any> = new Map<any, any>();
    private _onSendActivities: SendActivitiesHandler[] = [];
    private _onUpdateActivity: UpdateActivityHandler[] = [];
    private _onDeleteActivity: DeleteActivityHandler[] = [];

    /**
     * Creates a new TurnContext instance.
     * @param adapterOrContext Adapter that constructed the context or a context object to clone.
     * @param request Request being processed.
     */
    constructor(adapterOrContext: BotAdapter, request: Partial<Activity>);
    constructor(adapterOrContext: TurnContext);
    constructor(adapterOrContext: BotAdapter|TurnContext, request?: Partial<Activity>) {
        if (adapterOrContext instanceof TurnContext) {
            adapterOrContext.copyTo(this);
        } else {
            this._adapter = adapterOrContext;
            this._activity = request as Activity;
        }
    }

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
    public static getConversationReference(activity: Partial<Activity>): Partial<ConversationReference> {
        return {
            activityId: activity.id,
            user: shallowCopy(activity.from),
            bot: shallowCopy(activity.recipient),
            conversation: shallowCopy(activity.conversation),
            channelId: activity.channelId,
            serviceUrl: activity.serviceUrl
        };
    }

    /**
     * Updates an activity with the delivery information from a conversation reference.
     *
     * @remarks
     * Calling this after [getConversationReference()](#getconversationreference) on an incoming
     * activity will properly address the reply to a received activity.
     *
     * ```JavaScript
     * // Send a typing indicator without going through a middleware listeners.
     * const reference = TurnContext.getConversationReference(context.activity);
     * const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
     * await context.adapter.sendActivities([activity]);
     * ```
     * @param activity Activity to copy delivery information to.
     * @param reference Conversation reference containing delivery information.
     * @param isIncoming (Optional) flag indicating whether the activity is an incoming or outgoing activity. Defaults to `false` indicating the activity is outgoing.
     */
    public static applyConversationReference(
        activity: Partial<Activity>,
        reference: Partial<ConversationReference>,
        isIncoming: boolean = false
    ): Partial<Activity> {
        activity.channelId = reference.channelId;
        activity.serviceUrl = reference.serviceUrl;
        activity.conversation = reference.conversation;
        if (isIncoming) {
            activity.from = reference.user;
            activity.recipient = reference.bot;
            if (reference.activityId) { activity.id = reference.activityId; }
        } else {
            activity.from = reference.bot;
            activity.recipient = reference.user;
            if (reference.activityId) { activity.replyToId = reference.activityId; }
        }

        return activity;
    }

    /**
     * Create a ConversationReference based on an outgoing Activity's ResourceResponse
     *
     * @remarks
     * This method can be used to create a ConversationReference that can be stored
     * and used later to delete or update the activity.
     * ```javascript
     * var reply = await context.sendActivity('Hi');
     * var reference = TurnContext.getReplyConversationReference(context.activity, reply);
     * ```
     *
     * @param activity Activity from which to pull Conversation info
     * @param reply ResourceResponse returned from sendActivity
     */
    public static getReplyConversationReference(
        activity: Partial<Activity>,
        reply: ResourceResponse
    ): Partial<ConversationReference> {
        const reference: Partial<ConversationReference> = TurnContext.getConversationReference(activity);

        // Update the reference with the new outgoing Activity's id.
        reference.activityId = reply.id;

        return reference;
    }

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
    public sendActivity(activityOrText: string|Partial<Activity>, speak?: string, inputHint?: string): Promise<ResourceResponse|undefined> {
        let a: Partial<Activity>;
        if (typeof activityOrText === 'string') {
            a = { text: activityOrText, inputHint: inputHint || InputHints.AcceptingInput };
            if (speak) { a.speak = speak; }
        } else {
            a = activityOrText;
        }

        return this.sendActivities([a]).then(
            (responses: ResourceResponse[]) => responses && responses.length > 0 ? responses[0] : undefined
        );
    }

    /**
     * Sends a set of activities to the user. An array of responses from the server will be returned.
     *
     * @remarks
     * Prior to delivery, the activities will be updated with information from the `ConversationReference`
     * for the contexts [activity](#activity) and if any activities `type` field hasn't been set it will be
     * set to a type of `message`. The array of activities will then be routed through any [onSendActivities()](#onsendactivities)
     * handlers before being passed to `adapter.sendActivities()`.
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
     public sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        let sentNonTraceActivity: boolean = false;
        const ref: Partial<ConversationReference> = TurnContext.getConversationReference(this.activity);
        const output: Partial<Activity>[] = activities.map((a: Partial<Activity>) => {
            const o: Partial<Activity> = TurnContext.applyConversationReference({...a}, ref);
            if (!o.type) { o.type = ActivityTypes.Message; }
            if (o.type !== ActivityTypes.Trace) { sentNonTraceActivity = true; }

            return o;
        });

        return this.emit(this._onSendActivities, output, () => {
            return this.adapter.sendActivities(this, output)
                .then((responses: ResourceResponse[]) => {
                    // Set responded flag
                    if (sentNonTraceActivity) { this.responded = true; }

                    return responses;
                });
        });
    }

    /**
     * Replaces an existing activity.
     *
     * @remarks
     * The activity will be routed through any registered [onUpdateActivity](#onupdateactivity) handlers
     * before being passed to `adapter.updateActivity()`.
     *
     * ```JavaScript
     * const matched = /approve (.*)/i.exec(context.activity.text);
     * if (matched) {
     *    const update = await approveExpenseReport(matched[1]);
     *    await context.updateActivity(update);
     * }
     * ```
     * @param activity New replacement activity. The activity should already have it's ID information populated.
     */
    public updateActivity(activity: Partial<Activity>): Promise<void> {
        return this.emit(this._onUpdateActivity, activity, () => this.adapter.updateActivity(this, activity));
    }

    /**
     * Deletes an existing activity.
     *
     * @remarks
     * The `ConversationReference` for the activity being deleted will be routed through any registered
     * [onDeleteActivity](#ondeleteactivity) handlers before being passed to `adapter.deleteActivity()`.
     *
     * ```JavaScript
     * const matched = /approve (.*)/i.exec(context.activity.text);
     * if (matched) {
     *    const savedId = await approveExpenseReport(matched[1]);
     *    await context.deleteActivity(savedId);
     * }
     * ```
     * @param idOrReference ID or conversation of the activity being deleted. If an ID is specified the conversation reference information from the current request will be used to delete the activity.
     */
    public deleteActivity(idOrReference: string|Partial<ConversationReference>): Promise<void> {
        let reference: Partial<ConversationReference>;
        if (typeof idOrReference === 'string') {
            reference = TurnContext.getConversationReference(this.activity);
            reference.activityId = idOrReference;
        } else {
            reference = idOrReference;
        }

        return this.emit(this._onDeleteActivity, reference, () => this.adapter.deleteActivity(this, reference));
    }

    /**
     * Registers a handler to be notified of, and potentially intercept, the sending of activities.
     *
     * @remarks
     * This example shows how to listen for and logs outgoing `message` activities.
     *
     * ```JavaScript
     * context.onSendActivities(async (ctx, activities, next) => {
     *    // Deliver activities
     *    await next();
     *
     *    // Log sent messages
     *    activities.filter(a => a.type === 'message').forEach(a => logSend(a));
     * });
     * ```
     * @param handler A function that will be called anytime [sendActivity()](#sendactivity) is called. The handler should call `next()` to continue sending of the activities.
     */
    public onSendActivities(handler: SendActivitiesHandler): this {
        this._onSendActivities.push(handler);

        return this;
    }

    /**
     * Registers a handler to be notified of, and potentially intercept, an activity being updated.
     *
     * @remarks
     * This example shows how to listen for and logs updated activities.
     *
     * ```JavaScript
     * context.onUpdateActivity(async (ctx, activity, next) => {
     *    // Replace activity
     *    await next();
     *
     *    // Log update
     *    logUpdate(activity);
     * });
     * ```
     * @param handler A function that will be called anytime [updateActivity()](#updateactivity) is called. The handler should call `next()` to continue sending of the replacement activity.
     */
    public onUpdateActivity(handler: UpdateActivityHandler): this {
        this._onUpdateActivity.push(handler);

        return this;
    }

    /**
     * Registers a handler to be notified of, and potentially intercept, an activity being deleted.
     *
     * @remarks
     * This example shows how to listen for and logs deleted activities.
     *
     * ```JavaScript
     * context.onDeleteActivity(async (ctx, reference, next) => {
     *    // Delete activity
     *    await next();
     *
     *    // Log delete
     *    logDelete(activity);
     * });
     * ```
     * @param handler A function that will be called anytime [deleteActivity()](#deleteactivity) is called. The handler should call `next()` to continue deletion of the activity.
     */
    public onDeleteActivity(handler: DeleteActivityHandler): this {
        this._onDeleteActivity.push(handler);

        return this;
    }

    /**
     * Called when this TurnContext instance is passed into the constructor of a new TurnContext
     * instance.
     *
     * @remarks
     * Can be overridden in derived classes to add additional fields that should be cloned.
     * @param context The context object to copy private members to. Everything should be copied by reference.
     */
    protected copyTo(context: TurnContext): void {
        // Copy private member to other instance.
        [
            '_adapter', '_activity', '_respondedRef', '_services',
            '_onSendActivities', '_onUpdateActivity', '_onDeleteActivity'
        ].forEach((prop: string) => (context as any)[prop] = (this as any)[prop]);
    }

    /**
     * The adapter for this context.
     *
     * @remarks
     * This example shows how to send a `typing` activity directly using the adapter. This approach
     * bypasses any middleware which sometimes has its advantages.  The calls to
     * `getConversationReference()` and `applyConversationReference()` are needed to ensure that the
     * outgoing activity is properly addressed:
     *
     * ```JavaScript
     * // Send a typing indicator without going through an middleware listeners.
     * const reference = TurnContext.getConversationReference(context.activity);
     * const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
     * await context.adapter.sendActivities([activity]);
     * ```
     */
    public get adapter(): BotAdapter {
        return this._adapter as BotAdapter;
    }

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
    public get activity(): Activity {
        return this._activity as Activity;
    }

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
    public get responded(): boolean {
        return this._respondedRef.responded;
    }

    public set responded(value: boolean) {
        if (!value) { throw new Error(`TurnContext: cannot set 'responded' to a value of 'false'.`); }
        this._respondedRef.responded = true;
    }

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
     * context.turnState.set('cart', cart);
     * ```
     *
     * > [!TIP]
     * > For middleware and third party components, consider using a `Symbol()` for your cache key
     * > to avoid potential naming collisions with the bots caching and other components.
     */
    public get turnState(): Map<any, any> {
        return this._turnState;
    }

    private emit<T>(
        handlers: ((context: TurnContext, arg: T, next: () => Promise<any>) => Promise<any>)[],
        arg: T,
        next: () => Promise<any>
    ): Promise<any> {
        const list:  ((context: TurnContext, arg: T, next: () => Promise<any>) => Promise<any>)[] = handlers.slice();
        const context: TurnContext = this;
        function emitNext(i: number): Promise<void> {
            try {
                if (i < list.length) {
                    return Promise.resolve(list[i](context, arg, () => emitNext(i + 1)));
                }

                return Promise.resolve(next());
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return emitNext(0);
    }

}
