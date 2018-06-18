"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botframework_schema_1 = require("botframework-schema");
const internal_1 = require("./internal");
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
class TurnContext {
    constructor(adapterOrContext, request) {
        this._adapter = undefined;
        this._activity = undefined;
        this._respondedRef = { responded: false };
        this._services = new Map();
        this._onSendActivities = [];
        this._onUpdateActivity = [];
        this._onDeleteActivity = [];
        if (adapterOrContext instanceof TurnContext) {
            adapterOrContext.copyTo(this);
        }
        else {
            this._adapter = adapterOrContext;
            this._activity = request;
        }
    }
    /**
     * Called when this TurnContext instance is passed into the constructor of a new TurnContext
     * instance. Can be overridden in derived classes.
     * @param context The context object to copy private members to. Everything should be copied by reference.
     */
    copyTo(context) {
        // Copy private member to other instance.
        ['_adapter', '_activity', '_respondedRef', '_services',
            '_onSendActivities', '_onUpdateActivity', '_onDeleteActivity'].forEach((prop) => context[prop] = this[prop]);
    }
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
    get adapter() {
        return this._adapter;
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
    get activity() {
        return this._activity;
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
    get responded() {
        return this._respondedRef.responded;
    }
    set responded(value) {
        if (!value) {
            throw new Error(`TurnContext: cannot set 'responded' to a value of 'false'.`);
        }
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
     * context.services.set('cart', cart);
     * ```
     *
     * > [!TIP]
     * > For middleware and third party components, consider using a `Symbol()` for your cache key
     * > to avoid potential naming collisions with the bots caching and other components.
     */
    get services() {
        return this._services;
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
    sendActivity(activityOrText, speak, inputHint) {
        let a;
        if (typeof activityOrText === 'string') {
            a = { text: activityOrText, inputHint: inputHint || botframework_schema_1.InputHints.AcceptingInput };
            if (speak) {
                a.speak = speak;
            }
        }
        else {
            a = activityOrText;
        }
        return this.sendActivities([a]).then((responses) => responses && responses.length > 0 ? responses[0] : undefined);
    }
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
    sendActivities(activities) {
        let sentNonTraceActivity = false;
        const ref = TurnContext.getConversationReference(this.activity);
        const output = activities.map((a) => {
            const o = TurnContext.applyConversationReference(Object.assign({}, a), ref);
            if (!o.type) {
                o.type = botframework_schema_1.ActivityTypes.Message;
            }
            if (o.type !== botframework_schema_1.ActivityTypes.Trace) {
                sentNonTraceActivity = true;
            }
            return o;
        });
        return this.emit(this._onSendActivities, output, () => {
            return this.adapter.sendActivities(this, output)
                .then((responses) => {
                // Set responded flag
                if (sentNonTraceActivity) {
                    this.responded = true;
                }
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
     * const matched = /approve (.*)/i.exec(context.text);
     * if (matched) {
     *    const update = await approveExpenseReport(matched[1]);
     *    await context.updateActivity(update);
     * }
     * ```
     * @param activity New replacement activity. The activity should already have it's ID information populated.
     */
    updateActivity(activity) {
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
     * const matched = /approve (.*)/i.exec(context.text);
     * if (matched) {
     *    const savedId = await approveExpenseReport(matched[1]);
     *    await context.deleteActivity(savedId);
     * }
     * ```
     * @param idOrReference ID or conversation of the activity being deleted. If an ID is specified the conversation reference information from the current request will be used to delete the activity.
     */
    deleteActivity(idOrReference) {
        let reference;
        if (typeof idOrReference === 'string') {
            reference = TurnContext.getConversationReference(this.activity);
            reference.activityId = idOrReference;
        }
        else {
            reference = idOrReference;
        }
        return this.emit(this._onDeleteActivity, reference, () => this.adapter.deleteActivity(this, reference));
    }
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
    onSendActivities(handler) {
        this._onSendActivities.push(handler);
        return this;
    }
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
    onUpdateActivity(handler) {
        this._onUpdateActivity.push(handler);
        return this;
    }
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
    onDeleteActivity(handler) {
        this._onDeleteActivity.push(handler);
        return this;
    }
    emit(handlers, arg, next) {
        const list = handlers.slice();
        const context = this;
        function emitNext(i) {
            try {
                if (i < list.length) {
                    return Promise.resolve(list[i](context, arg, () => emitNext(i + 1)));
                }
                return Promise.resolve(next());
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        return emitNext(0);
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
    static getConversationReference(activity) {
        return {
            activityId: activity.id,
            user: internal_1.shallowCopy(activity.from),
            bot: internal_1.shallowCopy(activity.recipient),
            conversation: internal_1.shallowCopy(activity.conversation),
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
     * // Send a typing indicator without going through an middleware listeners.
     * const reference = TurnContext.getConversationReference(context.request);
     * const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
     * await context.adapter.sendActivities([activity]);
     * ```
     * @param activity Activity to copy delivery information to.
     * @param reference Conversation reference containing delivery information.
     * @param isIncoming (Optional) flag indicating whether the activity is an incoming or outgoing activity. Defaults to `false` indicating the activity is outgoing.
     */
    static applyConversationReference(activity, reference, isIncoming = false) {
        activity.channelId = reference.channelId;
        activity.serviceUrl = reference.serviceUrl;
        activity.conversation = reference.conversation;
        if (isIncoming) {
            activity.from = reference.user;
            activity.recipient = reference.bot;
            if (reference.activityId) {
                activity.id = reference.activityId;
            }
        }
        else {
            activity.from = reference.bot;
            activity.recipient = reference.user;
            if (reference.activityId) {
                activity.replyToId = reference.activityId;
            }
        }
        return activity;
    }
}
exports.TurnContext = TurnContext;
//# sourceMappingURL=turnContext.js.map