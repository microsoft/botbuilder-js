/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes, ConversationReference, InputHints, ResourceResponse, Mention } from 'botframework-schema';
import { BotAdapter } from './botAdapter';
import { shallowCopy } from './internal';

/**
 * A handler that can participate in send activity events for the current turn.
 * 
 * @remarks
 * **Parameters**
 * 
 * | Name | Type | Description |
 * | :--- | :--- | :--- |
 * | `context` | [TurnContext](xref:botbuilder-core.TurnContext) | The context object for the turn. |
 * | `activities` | Partial\<[Activity](xref:botframework-schema.Activity)>[] | The activities to send. |
 * | `next` | () => Promise\<[ResourceResponse](xref:botframework-schema.ResourceResponse)[]> | The function to call to continue event processing. |
 * 
 * **Returns**
 * 
 * Promise\<[ResourceResponse](xref:botframework-schema.ResourceResponse)[]>
 * 
 * A handler calls the `next` function to pass control to the next registered handler. If a handler
 * doesn't call the `next` function, the adapter does not call any of the subsequent handlers and
 * does not send the activities to the user.
 * 
 * If the activities are successfully sent, the `next` function returns an array of
 * [ResourceResponse](xref:botframework-schema.ResourceResponse) objects containing the IDs that the
 * receiving channel assigned to the activities. Use this array as the return value of this handler.
 * 
 * **See also**
 * 
 * - [BotAdapter](xref:botbuilder-core.BotAdapter)
 * - [UpdateActivityHandler](xref:botbuilder-core.UpdateActivityHandler)
 * - [DeleteActivityHandler](xref:botbuilder-core.DeleteActivityHandler)
 * - [TurnContext.onSendActivities](xref:botbuilder-core.TurnContext.onSendActivities)
 */
export type SendActivitiesHandler = (
    context: TurnContext,
    activities: Partial<Activity>[],
    next: () => Promise<ResourceResponse[]>
) => Promise<ResourceResponse[]>;

/**
 * A handler that can participate in update activity events for the current turn.
 * 
 * @remarks
 * **Parameters**
 * 
 * | Name | Type | Description |
 * | :--- | :--- | :--- |
 * | `context` | [TurnContext](xref:botbuilder-core.TurnContext) | The context object for the turn. |
 * | `activities` | Partial\<[Activity](xref:botframework-schema.Activity)> | The replacement activity. |
 * | `next` | () => Promise\<void> | The function to call to continue event processing. |
 * 
 * A handler calls the `next` function to pass control to the next registered handler.
 * If a handler doesn’t call the `next` function, the adapter does not call any of the
 * subsequent handlers and does not attempt to update the activity.
 * 
 * The `activity` parameter's [id](xref:botframework-schema.Activity.id)] property indicates which activity
 * in the conversation to replace.
 * 
 * **See also**
 * 
 * - [BotAdapter](xref:botbuilder-core.BotAdapter)
 * - [SendActivitiesHandler](xref:botbuilder-core.SendActivitiesHandler)
 * - [DeleteActivityHandler](xref:botbuilder-core.DeleteActivityHandler)
 * - [TurnContext.onUpdateActivity](xref:botbuilder-core.TurnContext.onUpdateActivity)
 */
export type UpdateActivityHandler = (context: TurnContext, activity: Partial<Activity>, next: () => Promise<void>) => Promise<void>;

/**
 * A handler that can participate in delete activity events for the current turn.
 * 
 * @remarks
 * **Parameters**
 * 
 * | Name | Type | Description |
 * | :--- | :--- | :--- |
 * | `context` | [TurnContext](xref:botbuilder-core.TurnContext) | The context object for the turn. |
 * | `reference` | Partial\<[ConversationReference](xref:botframework-schema.ConversationReference)> | The conversation containing the activity to delete. |
 * | `next` | () => Promise\<void> | The function to call to continue event processing. |
 * 
 * A handler calls the `next` function to pass control to the next registered handler.
 * If a handler doesn’t call the `next` function, the adapter does not call any of the
 * subsequent handlers and does not attempt to delete the activity.
 * 
 * The `reference` parameter's [activityId](xref:botframework-schema.ConversationReference.activityId)] property indicates which activity
 * in the conversation to delete.
 * 
 * **See also**
 * 
 * - [BotAdapter](xref:botbuilder-core.BotAdapter)
 * - [SendActivitiesHandler](xref:botbuilder-core.SendActivitiesHandler)
 * - [UpdateActivityHandler](xref:botbuilder-core.UpdateActivityHandler)
 * - [TurnContext.onDeleteActivity](xref:botbuilder-core.TurnContext.onDeleteActivity)
 */
export type DeleteActivityHandler = (
    context: TurnContext,
    reference: Partial<ConversationReference>,
    next: () => Promise<void>
) => Promise<void>;

// tslint:disable-next-line:no-empty-interface
export interface TurnContext {}

/**
 * Provides context for a turn of a bot.
 *
 * @remarks
 * Context provides information needed to process an incoming activity. The context object is
 * created by a [BotAdapter](xref:botbuilder-core.BotAdapter) and persists for the length of the turn.
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
     * Creates an new instance of the [TurnContext](xref:xref:botbuilder-core.TurnContext) class.
     * 
     * @param adapterOrContext The adapter creating the context.
     * @param request The incoming activity for the turn.
     */
    constructor(adapterOrContext: BotAdapter, request: Partial<Activity>);
    /**
     * Creates an new instance of the [TurnContext](xref:xref:botbuilder-core.TurnContext) class.
     * 
     * @param adapterOrContext The context object to clone.
     */
    constructor(adapterOrContext: TurnContext);
    /**
     * Creates an new instance of the [TurnContext](xref:xref:botbuilder-core.TurnContext) class.
     * 
     * @param adapterOrContext The adapter creating the context or the context object to clone.
     * @param request Optional. The incoming activity for the turn.
     */
    constructor(adapterOrContext: BotAdapter|TurnContext, request?: Partial<Activity>) {
        if (adapterOrContext instanceof TurnContext) {
            adapterOrContext.copyTo(this);
        } else {
            this._adapter = adapterOrContext;
            this._activity = request as Activity;
        }
    }

    /**
     * Removes at mentions for the activity's [recipient](xref:botframework-schema.Activity.recipient)
     * from the text of an activity and returns the updated text.
     * Use with caution; this function alters the activity's [text](xref:botframework-schema.Activity.text) property.
     *
     * @param activity The activity to remove at mentions from.
     * 
     * @remarks
     * Some channels, for example Microsoft Teams, add at-mention details to the text of a message activity.
     * 
     * Use this helper method to modify the activity's [text](xref:botframework-schema.Activity.text) property.
     * It removes all at mentions of the activity's [recipient](xref:botframework-schema.Activity.recipient)
     * and then returns the updated property value.
     *
     * For example:
     * ```JavaScript
     * const updatedText = TurnContext.removeRecipientMention(turnContext.request);
     * ```
     * **See also**
     * - [removeMentionText](xref:botbuilder-core.TurnContext.removeMentionText)
     */
    public static removeRecipientMention(activity: Partial<Activity>): string {
        return TurnContext.removeMentionText(activity, activity.recipient.id);
    }

    /**
     * Removes at mentions for a given ID from the text of an activity and returns the updated text.
     * Use with caution; this function alters the activity's [text](xref:botframework-schema.Activity.text) property.
     * 
     * @param activity The activity to remove at mentions from.
     * @param id The ID of the user or bot to remove at mentions for.
     * 
     * @remarks
     * Some channels, for example Microsoft Teams, add at mentions to the text of a message activity.
     * 
     * Use this helper method to modify the activity's [text](xref:botframework-schema.Activity.text) property.
     * It removes all at mentions for the given bot or user ID and then returns the updated property value.
     * 
     * For example, when you remove mentions of **echoBot** from an activity containing the text "@echoBot Hi Bot",
     * the activity text is updated, and the method returns "Hi Bot".
     *
     * The format of a mention [entity](xref:botframework-schema.Entity) is channel-dependent.
     * However, the mention's [text](xref:botframework-schema.Mention.text) property should contain
     * the exact text for the user as it appears in the activity text.
     * 
     * For example, whether the channel uses "<at>username</at>" or "@username", this string is in
     * the activity's text, and this method will remove all occurrences of that string from the text.
     * 
     * For example:
     * ```JavaScript
     * const updatedText = TurnContext.removeMentionText(activity, activity.recipient.id);
     * ```
     * **See also**
     * - [removeRecipientMention](xref:botbuilder-core.TurnContext.removeRecipientMention)
     */
    public static removeMentionText(activity: Partial<Activity>, id: string): string {
        const mentions = TurnContext.getMentions(activity);
        const mentionsFiltered = mentions.filter((mention): boolean => mention.mentioned.id === id);
        if (mentionsFiltered.length) {
            activity.text = activity.text.replace(mentionsFiltered[0].text, '').trim();
        }
        return activity.text;
    }

    /**
     * Gets all at-mention entities included in an activity.
     *
     * @param activity The activity.
     * 
     * @remarks
     * The activity's [entities](xref:botframework-schema.Activity.entities) property contains a flat
     * list of metadata objects pertaining to this activity and can contain
     * [mention](xref:botframework-schema.Mention) entities. This method returns all such entities
     * for a given activity.
     * 
     * For example:
     * ```JavaScript
     * const mentions = TurnContext.getMentions(turnContext.request);
     * ```
     */
    public static getMentions(activity: Partial<Activity>): Mention[] {
        var result: Mention[] = [];
        if (activity.entities !== undefined) {
            for (var i=0; i<activity.entities.length; i++) {
                if (activity.entities[i].type.toLowerCase() === 'mention') {
                    result.push(activity.entities[i] as Mention);
                }
            }
        }
        return result;
    } 

    /**
     * Copies conversation reference information from an activity.
     *
     * @param activity The activity to get the information from.
     * 
     * @remarks
     * You can save the conversation reference as a JSON object and use it later to proactively message the user.
     *
     * For example:
     * ```JavaScript
     * const reference = TurnContext.getConversationReference(context.request);
     * ```
     * 
     * **See also**
     * 
     * - [BotAdapter.continueConversation](xref:botbuilder-core.BotAdapter.continueConversation)
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
        let sentNonTraceActivity = false;
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
        const ref: Partial<ConversationReference> = TurnContext.getConversationReference(this.activity);
        const a: Partial<Activity> = TurnContext.applyConversationReference(activity, ref);
        return this.emit(this._onUpdateActivity, a, () => this.adapter.updateActivity(this, a));
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
