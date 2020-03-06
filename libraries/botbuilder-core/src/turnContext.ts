/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes, ConversationReference, DeliveryModes, InputHints, ResourceResponse, Mention } from 'botframework-schema';
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
 * The `activity` parameter's [id](xref:botframework-schema.Activity.id) property indicates which activity
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
 * The `reference` parameter's [activityId](xref:botframework-schema.ConversationReference.activityId) property indicates which activity
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

export const BotCallbackHandlerKey = 'botCallbackHandler';

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
     * Updates an activity with the delivery information from an existing conversation reference.
     *
     * @param activity The activity to update.
     * @param reference The conversation reference to copy delivery information from.
     * @param isIncoming Optional. `true` to treat the activity as an incoming activity, where the
     *      bot is the recipient; otherwise, `false`. Default is `false`, and the activity will show
     *      the bot as the sender.
     * 
     * @remarks
     * Call the [getConversationReference](xref:botbuilder-core.TurnContext.getConversationReference)
     * method on an incoming activity to get a conversation reference that you can then use
     * to update an outgoing activity with the correct delivery information.
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
     * Copies conversation reference information from a resource response for a sent activity.
     *
     * @param activity The sent activity.
     * @param reply The resource response for the activity, returned by the
     *      [sendActivity](xref:botbuilder-core.TurnContext.sendActivity) or
     *      [sendActivities](xref:botbuilder-core.TurnContext.sendActivities) method.
     *
     * @remarks
     * You can save the conversation reference as a JSON object and use it later to update or delete the message.
     * 
     * For example:
     * ```javascript
     * var reply = await context.sendActivity('Hi');
     * var reference = TurnContext.getReplyConversationReference(context.activity, reply);
     * ```
     * 
     * **See also**
     * 
     * - [deleteActivity](xref:botbuilder-core.TurnContext.deleteActivity)
     * - [updateActivity](xref:botbuilder-core.TurnContext.updateActivity)
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
     * List of activities to send when `context.activity.deliveryMode == 'expectsReply'`.
     */
    public readonly bufferedReplies: Partial<Activity>[] = [];

    /**
     * Asynchronously sends an activity to the sender of the incoming activity.
     *
     * @param name The activity or text to send.
     * @param value Optional. The text to be spoken by your bot on a speech-enabled channel.
     * @param valueType Optional. Indicates whether your bot is accepting, expecting, or ignoring user
     * @param label Optional. Indicates whether your bot is accepting, expecting, or ignoring user
     * 
     * @remarks
     * Creates and sends a Trace activity. Trace activities are only sent when the channel is the emulator.
     *
     * For example:
     * ```JavaScript
     * await context.sendTraceActivity(`The following exception was thrown ${msg}`);
     * ```
     * 
     * **See also**
     * 
     * - [sendActivities](xref:botbuilder-core.TurnContext.sendActivities)
     */
    public sendTraceActivity(name: string, value?: any, valueType?: string, label?: string): Promise<ResourceResponse|undefined> {
        const traceActivity: Partial<Activity> = {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            name: name,
            value: value,
            valueType: valueType,
            label: label
        };
        return this.sendActivity(traceActivity)
    }

    /**
     * Asynchronously sends an activity to the sender of the incoming activity.
     *
     * @param activityOrText The activity or text to send.
     * @param speak Optional. The text to be spoken by your bot on a speech-enabled channel.
     * @param inputHint Optional. Indicates whether your bot is accepting, expecting, or ignoring user
     *      input after the message is delivered to the client. One of: 'acceptingInput', 'ignoringInput',
     *      or 'expectingInput'. Default is 'acceptingInput'.
     * 
     * @remarks
     * If the activity is successfully sent, results in a
     * [ResourceResponse](xref:botframework-schema.ResourceResponse) object containing the ID that the
     * receiving channel assigned to the activity.
     * 
     * See the channel's documentation for limits imposed upon the contents of the **activityOrText** parameter.
     * 
     * To control various characteristics of your bot's speech such as voice, rate, volume, pronunciation,
     * and pitch, specify **speak** in Speech Synthesis Markup Language (SSML) format.
     *
     * For example:
     * ```JavaScript
     * await context.sendActivity(`Hello World`);
     * ```
     * 
     * **See also**
     * 
     * - [sendActivities](xref:botbuilder-core.TurnContext.sendActivities)
     * - [updateActivity](xref:botbuilder-core.TurnContext.updateActivity)
     * - [deleteActivity](xref:botbuilder-core.TurnContext.deleteActivity)
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
     * Asynchronously sends a set of activities to the sender of the incoming activity.
     *
     * @param activities The activities to send.
     * 
     * @remarks
     * If the activities are successfully sent, results in an array of
     * [ResourceResponse](xref:botframework-schema.ResourceResponse) objects containing the IDs that
     * the receiving channel assigned to the activities.
     * 
     * Before they are sent, the delivery information of each outbound activity is updated based on the
     * delivery information of the inbound inbound activity.
     *
     * For example:
     * ```JavaScript
     * await context.sendActivities([
     *    { type: 'typing' },
     *    { type: 'delay', value: 2000 },
     *    { type: 'message', text: 'Hello... How are you?' }
     * ]);
     * ```
     * 
     * **See also**
     * 
     * - [sendActivity](xref:botbuilder-core.TurnContext.sendActivity)
     * - [updateActivity](xref:botbuilder-core.TurnContext.updateActivity)
     * - [deleteActivity](xref:botbuilder-core.TurnContext.deleteActivity)
     */
    public sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        let sentNonTraceActivity = false;
        const ref: Partial<ConversationReference> = TurnContext.getConversationReference(this.activity);
        const output: Partial<Activity>[] = activities.map((a: Partial<Activity>) => {
            const o: Partial<Activity> = TurnContext.applyConversationReference({...a}, ref);
            if (!o.type) { o.type = ActivityTypes.Message; }
            if (o.type !== ActivityTypes.Trace) { sentNonTraceActivity = true; }
            if (o.id) { delete o.id; }
            return o;
        });

        return this.emit(this._onSendActivities, output, () => {
            if (this.activity.deliveryMode === DeliveryModes.ExpectsReply) {
                // Append activities to buffer
                const responses: ResourceResponse[] = [];
                output.forEach((a) => {
                    this.bufferedReplies.push(a);
                    responses.push({ id: undefined });
                });

                // Set responded flag
                if (sentNonTraceActivity) { this.responded = true; }

                return Promise.resolve(responses);
            } else {
                return this.adapter.sendActivities(this, output)
                    .then((responses: ResourceResponse[]) => {
                        // Set responded flag
                        if (sentNonTraceActivity) { this.responded = true; }

                        return responses;
                    });
            }
        });
    }

    /**
     * Asynchronously updates a previously sent activity.
     *
     * @param activity The replacement for the original activity.
     * 
     * @remarks
     * The [id](xref:botframework-schema.Activity.id) of the replacement activity indicates the activity
     * in the conversation to replace.
     * 
     * For example:
     * ```JavaScript
     * const matched = /approve (.*)/i.exec(context.activity.text);
     * if (matched) {
     *    const update = await approveExpenseReport(matched[1]);
     *    await context.updateActivity(update);
     * }
     * ```
     * 
     * **See also**
     * 
     * - [sendActivity](xref:botbuilder-core.TurnContext.sendActivity)
     * - [deleteActivity](xref:botbuilder-core.TurnContext.deleteActivity)
     * - [getReplyConversationReference](xref:botbuilder-core.TurnContext.getReplyConversationReference)
     */
    public updateActivity(activity: Partial<Activity>): Promise<void> {
        const ref: Partial<ConversationReference> = TurnContext.getConversationReference(this.activity);
        const a: Partial<Activity> = TurnContext.applyConversationReference(activity, ref);
        return this.emit(this._onUpdateActivity, a, () => this.adapter.updateActivity(this, a));
    }

    /**
     * Asynchronously deletes a previously sent activity.
     *
     * @param idOrReference ID or conversation reference for the activity to delete.
     * 
     * @remarks
     * If an ID is specified, the conversation reference for the current request is used
     * to get the rest of the information needed.
     *
     * For example:
     * ```JavaScript
     * const matched = /approve (.*)/i.exec(context.activity.text);
     * if (matched) {
     *    const savedId = await approveExpenseReport(matched[1]);
     *    await context.deleteActivity(savedId);
     * }
     * ```
     * 
     * **See also**
     * 
     * - [sendActivity](xref:botbuilder-core.TurnContext.sendActivity)
     * - [updateActivity](xref:botbuilder-core.TurnContext.updateActivity)
     * - [getReplyConversationReference](xref:botbuilder-core.TurnContext.getReplyConversationReference)
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
     * Adds a response handler for send activity operations.
     *
     * @param handler The handler to add to the context object.
     * 
     * @remarks
     * This method returns a reference to the turn context object.
     * 
     * When the [sendActivity](xref:botbuilder-core.TurnContext.sendActivity) or
     * [sendActivities](xref:botbuilder-core.TurnContext.sendActivities) method is called,
     * the registered handlers are called in the order in which they were added to the context object
     * before the activities are sent.
     * 
     * This example shows how to listen for and log outgoing `message` activities.
     *
     * ```JavaScript
     * context.onSendActivities(async (ctx, activities, next) => {
     *    // Log activities before sending them.
     *    activities.filter(a => a.type === 'message').forEach(a => logSend(a));
     *
     *    // Allow the send process to continue.
     *    next();
     * });
     * ```
     */
    public onSendActivities(handler: SendActivitiesHandler): this {
        this._onSendActivities.push(handler);

        return this;
    }

    /**
     * Adds a response handler for update activity operations.
     *
     * @param handler The handler to add to the context object.
     * 
     * @remarks
     * This method returns a reference to the turn context object.
     * 
     * When the [updateActivity](xref:botbuilder-core.TurnContext.updateActivity) method is called,
     * the registered handlers are called in the order in which they were added to the context object
     * before the activity is updated.
     * 
     * This example shows how to listen for and log activity updates.
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
     */
    public onUpdateActivity(handler: UpdateActivityHandler): this {
        this._onUpdateActivity.push(handler);

        return this;
    }

    /**
     * Adds a response handler for delete activity operations.
     *
     * @param handler The handler to add to the context object.
     * 
     * @remarks
     * This method returns a reference to the turn context object.
     * 
     * When the [deleteActivity](xref:botbuilder-core.TurnContext.deleteActivity) method is called,
     * the registered handlers are called in the order in which they were added to the context object
     * before the activity is deleted.
     * 
     * This example shows how to listen for and log activity deletions.
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
     */
    public onDeleteActivity(handler: DeleteActivityHandler): this {
        this._onDeleteActivity.push(handler);

        return this;
    }

    /**
     * Called when this turn context object is passed into the constructor for a new turn context.
     *
     * @param context The new turn context object.
     * 
     * @remarks
     * This copies private members from this object to the new object.
     * All property values are copied by reference.
     * 
     * Override this in a derived class to copy any additional members, as necessary.
     */
    protected copyTo(context: TurnContext): void {
        // Copy private members to other instance.
        [
            '_adapter', '_activity', '_respondedRef', '_services',
            '_onSendActivities', '_onUpdateActivity', '_onDeleteActivity'
        ].forEach((prop: string) => (context as any)[prop] = (this as any)[prop]);
    }

    /**
     * Gets the bot adapter that created this context object.
     */
    public get adapter(): BotAdapter {
        return this._adapter as BotAdapter;
    }

    /**
     * Gets the activity associated with this turn.
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
     * Indicates whether the bot has replied to the user this turn.
     *
     * @remarks
     * **true** if at least one response was sent for the current turn; otherwise, **false**.
     * Use this to determine if your bot needs to run fallback logic after other normal processing.
     * 
     * Trace activities do not set this flag.
     *
     * for example:
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

    /**
     * Sets the response flag on the current turn context.
     * 
     * @remarks
     * The [sendActivity](xref:botbuilder-core.TurnContext.sendActivity) and
     * [sendActivities](xref:botbuilder-core.TurnContext.sendActivities) methods call this method to
     * update the responded flag. You can call this method directly to indicate that your bot has
     * responded appropriately to the incoming activity.
     */
    public set responded(value: boolean) {
        if (!value) { throw new Error(`TurnContext: cannot set 'responded' to a value of 'false'.`); }
        this._respondedRef.responded = true;
    }

    /**
     * Gets the services registered on this context object.
     *
     * @remarks
     * Middleware, other components, and services will typically use this to cache information
     * that could be asked for by a bot multiple times during a turn. You can use this cache to
     * pass information between components of your bot.
     *
     * For example:
     * ```JavaScript
     * const cartKey = Symbol();
     * const cart = await loadUsersShoppingCart(context);
     * context.turnState.set(cartKey, cart);
     * ```
     *
     * > [!TIP]
     * > When creating middleware or a third-party component, use a unique symbol for your cache key
     * > to avoid state naming collisions with the bot or other middleware or components.
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
