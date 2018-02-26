"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
class BotContext {
    /**
     * Creates a new turn context instance.
     * @param adapter Adapter that constructed the context.
     * @param request Request being processed.
     */
    constructor(adapter, request) {
        this._responded = false;
        this._cache = new Map();
        this._onSendActivities = [];
        this._onUpdateActivity = [];
        this._onDeleteActivity = [];
        this._adapter = adapter;
        this._request = request;
    }
    /** The adapter for this context. */
    get adapter() {
        return this._adapter;
    }
    /** The received activity. */
    get request() {
        return this._request;
    }
    /** If `true` at least one response has been sent for the current turn of conversation. */
    get responded() {
        return this._responded;
    }
    set responded(value) {
        if (!value) {
            throw new Error(`TurnContext: cannot set 'responded' to a value of 'false'.`);
        }
        this._responded = true;
    }
    /**
     * Gets a value previously cached on the context.
     * @param T (Optional) type of value being returned.
     * @param key The key to lookup in the cache.
     */
    get(key) {
        return this._cache.get(key);
    }
    /**
     * Returns `true` if [set()](#set) has been called for a key. The cached value may be `undefined`.
     * @param key The key to lookup in the cache.
     */
    has(key) {
        return this._cache.has(key);
    }
    /**
     * Caches a value for the lifetime of the current turn.
     * @param key The key of the value being cached.
     * @param value The value to cache.
     */
    set(key, value) {
        this._cache.set(key, value);
        return this;
    }
    /**
     * Sends a set of activities to the user. An array of responses form the server will be
     * returned.
     * @param activities Set of activities being sent.
     */
    sendActivities(activities) {
        const ref = BotContext.getConversationReference(this._request);
        const output = activities.map((a) => BotContext.applyConversationReference(a, ref));
        return this.emit(this._onSendActivities, activities, () => {
            return this._adapter.sendActivities(activities)
                .then((responses) => {
                // Set responded flag
                this._responded = true;
                return responses;
            });
        });
    }
    /**
     * Replaces an existing activity.
     * @param activity New replacement activity. The activity should already have it's ID information populated.
     */
    updateActivity(activity) {
        return this.emit(this._onUpdateActivity, activity, () => this._adapter.updateActivity(activity));
    }
    /**
     * Deletes an existing activity.
     * @param id of the activity to delete.
     */
    deleteActivity(id) {
        return this.emit(this._onDeleteActivity, id, () => this._adapter.deleteActivity(id));
    }
    /**
     * Registers a handler to be notified of and potentially intercept the sending of activities.
     * @param handler A function that will be called anytime [sendActivities()](#sendactivities) is called. The handler should call `next()` to continue sending of the activities.
     */
    onSendActivities(handler) {
        this._onSendActivities.push(handler);
        return this;
    }
    /**
     * Registers a handler to be notified of and potentially intercept an activity being updated.
     * @param handler A function that will be called anytime [updateActivity()](#updateactivity) is called. The handler should call `next()` to continue sending of the replacement activity.
     */
    onUpdateActivity(handler) {
        this._onUpdateActivity.push(handler);
        return this;
    }
    /**
     * Registers a handler to be notified of and potentially intercept an activity being deleted.
     * @param handler A function that will be called anytime [deleteActivity()](#deleteactivity) is called. The handler should call `next()` to continue deletion of the activity.
     */
    onDeleteActivity(handler) {
        this._onDeleteActivity.push(handler);
        return this;
    }
    emit(handlers, arg, next) {
        const list = handlers.slice();
        function emitNext(i) {
            try {
                if (i < list.length) {
                    return Promise.resolve(list[i](arg, () => emitNext(i + 1)));
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
     * return context.adapter.sendActivities([activity]);
     * ```
     * @param activity Activity to copy delivery information to.
     * @param reference Conversation reference containing delivery information.
     */
    static applyConversationReference(activity, reference) {
        activity.channelId = reference.channelId;
        activity.serviceUrl = reference.serviceUrl;
        activity.conversation = reference.conversation;
        activity.from = reference.bot;
        activity.recipient = reference.user;
        if (reference.activityId) {
            activity.replyToId = reference.activityId;
        }
        return activity;
    }
}
exports.BotContext = BotContext;
//# sourceMappingURL=botContext.js.map