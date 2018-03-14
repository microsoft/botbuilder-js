"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
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
class BotContext {
    constructor(adapterOrContext, request) {
        this._adapter = undefined;
        this._request = undefined;
        this._respondedRef = { responded: false };
        this._cache = new Map();
        this._onSendActivity = [];
        this._onUpdateActivity = [];
        this._onDeleteActivity = [];
        if (adapterOrContext instanceof BotContext) {
            adapterOrContext.copyTo(this);
        }
        else {
            this._adapter = adapterOrContext;
            this._request = request;
        }
    }
    /**
     * Called when this BotContext instance is passed into the constructor of a new BotContext
     * instance.
     * @param context The context object to copy private members to. Everything should be copied by reference.
     */
    copyTo(context) {
        // Copy private member to other instance.
        ['_adapter', '_request', '_respondedRef', '_cache',
            '_onSendActivity', '_onUpdateActivity', '_onDeleteActivity'].forEach((prop) => context[prop] = this[prop]);
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
        return this._respondedRef.responded;
    }
    set responded(value) {
        if (!value) {
            throw new Error(`TurnContext: cannot set 'responded' to a value of 'false'.`);
        }
        this._respondedRef.responded = true;
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
     * @param activityOrText One or more activities or messages to send to the user. If a `string` is provided it will be sent to the user as a `message` activity.
     */
    sendActivity(...activityOrText) {
        const ref = BotContext.getConversationReference(this.request);
        const output = activityOrText.map((a) => BotContext.applyConversationReference(typeof a === 'string' ? { text: a, type: 'message' } : a, ref));
        return this.emit(this._onSendActivity, output, () => {
            return this.adapter.sendActivity(output)
                .then((responses) => {
                // Set responded flag
                this.responded = true;
                return responses;
            });
        });
    }
    /**
     * Replaces an existing activity.
     * @param activity New replacement activity. The activity should already have it's ID information populated.
     */
    updateActivity(activity) {
        return this.emit(this._onUpdateActivity, activity, () => this.adapter.updateActivity(activity));
    }
    /**
     * Deletes an existing activity.
     * @param idOrReference ID or conversation of the activity being deleted. If an ID is specified the conversation reference information from the current request will be used to delete the activity.
     */
    deleteActivity(idOrReference) {
        let reference;
        if (typeof idOrReference === 'string') {
            reference = BotContext.getConversationReference(this.request);
            reference.activityId = idOrReference;
        }
        else {
            reference = idOrReference;
        }
        return this.emit(this._onDeleteActivity, reference, () => this.adapter.deleteActivity(reference));
    }
    /**
     * Registers a handler to be notified of and potentially intercept the sending of activities.
     * @param handler A function that will be called anytime [sendActivity()](#sendactivity) is called. The handler should call `next()` to continue sending of the activities.
     */
    onSendActivity(handler) {
        this._onSendActivity.push(handler);
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
     * return context.adapter.sendActivity(activity);
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
exports.BotContext = BotContext;
//# sourceMappingURL=botContext.js.map