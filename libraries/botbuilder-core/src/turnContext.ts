/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ResourceResponse, ConversationReference, ActivityTypes, InputHints } from 'botframework-schema';
import { BotAdapter } from './botAdapter';
import { shallowCopy } from './internal';
import { Promiseable } from './middlewareSet';

/** 
 * :package: **botbuilder-core**
 * 
 * Signature implemented by functions registered with `context.onSendActivity()`. 
 */
export type SendActivitiesHandler = (context: TurnContext, activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>) => Promiseable<ResourceResponse[]>;

/** 
 * :package: **botbuilder-core**
 * 
 * Signature implemented by functions registered with `context.onUpdateActivity()`. 
 */
export type UpdateActivityHandler = (context: TurnContext, activity: Partial<Activity>, next: () => Promise<void>) => Promiseable<void>;

/** 
 * :package: **botbuilder-core**
 * 
 * Signature implemented by functions registered with `context.onDeleteActivity()`. 
 */
export type DeleteActivityHandler = (context: TurnContext, reference: Partial<ConversationReference>, next: () => Promise<void>) => Promiseable<void>;

export interface TurnContext { }

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
export class TurnContext {
    private _adapter: BotAdapter|undefined =  undefined;
    private _activity: Activity| undefined = undefined;
    private _respondedRef: { responded: boolean; } = { responded: false };
    private _services = new Map<any, any>();
    private _onSendActivities: SendActivitiesHandler[] = [];
    private _onUpdateActivity: UpdateActivityHandler[] = [];
    private _onDeleteActivity: DeleteActivityHandler[] = [];

    /**
     * Creates a new BotContext instance for a turn of conversation.
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
     * Called when this BotContext instance is passed into the constructor of a new BotContext 
     * instance. 
     * @param context The context object to copy private members to. Everything should be copied by reference. 
     */
    protected copyTo(context: TurnContext): void {
        // Copy private member to other instance.
        ['_adapter', '_activity', '_respondedRef', '_services', 
         '_onSendActivities', '_onUpdateActivity', '_onDeleteActivity'].forEach((prop) => (context as any)[prop] = (this as any)[prop]);        
    }

    /** The adapter for this context. */
    public get adapter(): BotAdapter {
        return this._adapter as BotAdapter;
    }

    /** The received activity. */
    public get activity(): Activity {
        return this._activity as Activity;
    }

    /** If `true` at least one response has been sent for the current turn of conversation. */
    public get responded(): boolean {
        return this._respondedRef.responded;
    }

    public set responded(value: boolean) {
        if (!value) { throw new Error(`TurnContext: cannot set 'responded' to a value of 'false'.`) }
        this._respondedRef.responded = true;
    }

    /** Map of services and other values cached for the lifetime of the turn. */
    public get services(): Map<any, any> {
        return this._services;
    }

    /**
     * Sends a single activity or message to the user.
     * @param activityOrText Activity or text of a message to send the user.
     * @param speak (Optional) SSML that should be spoken to the user for the message.
     * @param inputHint (Optional) `InputHint` for the message sent to the user.
     */
    public sendActivity(activityOrText: string|Partial<Activity>, speak?: string, inputHint?: string): Promise<ResourceResponse|undefined> {
        let a: Partial<Activity>;
        if (typeof activityOrText === 'string') {
            a = { text: activityOrText };
            if (speak) { a.speak = speak }
            if (inputHint) { a.inputHint = inputHint }
        } else {
            a = activityOrText;
        }
        return this.sendActivities([a]).then((responses) => responses && responses.length > 0 ? responses[0] : undefined);
    }

    /** 
     * Sends a set of activities to the user. An array of responses form the server will be returned.
     * 
     * Prior to delivery, the activities will be updated with information from the `ConversationReference`
     * for the contexts [activity](#activity) and if an activities `type` field hasn't been set it will be
     * set to a type of `message`. The array of activities will then be routed through any [onSendActivities()](#onsendactivities)
     * handlers and then passed to `adapter.sendActivities()`. 
     * @param activities One or more activities to send to the user.
     */
    public sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const ref = TurnContext.getConversationReference(this.activity);
        const output = activities.map((a) => {
            const o = TurnContext.applyConversationReference(Object.assign({}, a), ref);
            if (!o.type) { o.type = ActivityTypes.Message }
            return o;
        });
        return this.emit(this._onSendActivities, output, () => {
            return this.adapter.sendActivities(this, output)
                .then((responses) => {
                    // Set responded flag
                    this.responded = true;
                    return responses;
                });
        });
    }

    /** 
     * Replaces an existing activity. 
     * 
     * The activity will be routed through any registered [onUpdateActivity](#onupdateactivity) handlers 
     * before being passed to `adapter.updateActivity()`.
     * @param activity New replacement activity. The activity should already have it's ID information populated. 
     */
    public updateActivity(activity: Partial<Activity>): Promise<void> {
        return this.emit(this._onUpdateActivity, activity, () => this.adapter.updateActivity(this, activity));
    }

    /** 
     * Deletes an existing activity. 
     * 
     * The `ConversationReference` for the activity being deleted will be routed through any registered 
     * [onDeleteActivity](#ondeleteactivity) handlers before being passed to `adapter.deleteActivity()`.
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
     * Registers a handler to be notified of and potentially intercept the sending of activities. 
     * @param handler A function that will be called anytime [sendActivity()](#sendactivity) is called. The handler should call `next()` to continue sending of the activities. 
     */
    public onSendActivities(handler: SendActivitiesHandler): this {
        this._onSendActivities.push(handler);
        return this;
    }

    /** 
     * Registers a handler to be notified of and potentially intercept an activity being updated. 
     * @param handler A function that will be called anytime [updateActivity()](#updateactivity) is called. The handler should call `next()` to continue sending of the replacement activity. 
     */
    public onUpdateActivity(handler: UpdateActivityHandler): this {
        this._onUpdateActivity.push(handler);
        return this;
    }

    /** 
     * Registers a handler to be notified of and potentially intercept an activity being deleted. 
     * @param handler A function that will be called anytime [deleteActivity()](#deleteactivity) is called. The handler should call `next()` to continue deletion of the activity. 
     */
    public onDeleteActivity(handler: DeleteActivityHandler): this {
        this._onDeleteActivity.push(handler);
        return this;
    }

    private emit<T>(handlers: ((context: TurnContext, arg: T, next: () => Promise<any>) => Promiseable<any>)[], arg: T, next: () => Promise<any>): Promise<any> {
        const list = handlers.slice();
        const context = this;
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
    static getConversationReference(activity: Partial<Activity>): Partial<ConversationReference> {
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
    static applyConversationReference(activity: Partial<Activity>, reference: Partial<ConversationReference>, isIncoming = false): Partial<Activity> {
        activity.channelId = reference.channelId;
        activity.serviceUrl = reference.serviceUrl;
        activity.conversation = reference.conversation;
        if (isIncoming) {
            activity.from = reference.user;
            activity.recipient = reference.bot;
            if (reference.activityId) { activity.id = reference.activityId }
        } else {
            activity.from = reference.bot;
            activity.recipient = reference.user;
            if (reference.activityId) { activity.replyToId = reference.activityId }
        }
        return activity;
    }
}


