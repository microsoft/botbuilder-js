/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ResourceResponse, ConversationReference } from 'botframework-schema';
import { BotAdapter } from './botAdapter';
import { shallowCopy } from './internal';
import { Promiseable } from './middlewareSet';

export type SendActivitiesHandler = (activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>) => Promiseable<ResourceResponse[]>;

export type UpdateActivityHandler = (activity: Partial<Activity>, next: () => Promise<void>) => Promiseable<void>;

export type DeleteActivityHandler = (id: string, next: () => Promise<void>) => Promiseable<void>;

declare global {
    export interface BotContextExtensions { }
}

export interface BotContext<A extends BotAdapter> extends BotContextExtensions { }

export class BotContext<A extends BotAdapter = BotAdapter> {
    private _adapter: A;
    private _request: Activity;
    private _responded = false;
    private _cache = new Map<string, any>();
    private _onSendActivities: SendActivitiesHandler[] = [];
    private _onUpdateActivity: UpdateActivityHandler[] = [];
    private _onDeleteActivity: DeleteActivityHandler[] = [];

    /**
     * Creates a new turn context instance.
     * @param adapter Adapter that constructed the context.
     * @param request Request being processed.
     */
    constructor(adapter: A, request: Partial<Activity>) {
        this._adapter = adapter;
        this._request = request as Activity;
    }

    /** The adapter for this context. */
    public get adapter(): A {
        return this._adapter;
    }

    /** The received activity. */
    public get request(): Activity {
        return this._request;
    }

    /** If `true` at least one response has been sent for the current turn of conversation. */
    public get responded(): boolean {
        return this._responded;
    }

    public set responded(value: boolean) {
        if (!value) { throw new Error(`TurnContext: cannot set 'responded' to a value of 'false'.`) }
        this._responded = true;
    }

    /** 
     * Gets a value previously cached on the context.
     * @param T (Optional) type of value being returned.
     * @param key The key to lookup in the cache. 
     */
    public get<T = any>(key: string): T {
        return this._cache.get(key) as T;
    }

    /** 
     * Returns `true` if [set()](#set) has been called for a key. The cached value may be `undefined`. 
     * @param key The key to lookup in the cache. 
     */
    public has(key: string): boolean {
        return this._cache.has(key);
    }

    /** 
     * Caches a value for the lifetime of the current turn. 
     * @param key The key of the value being cached. 
     * @param value The value to cache. 
     */
    public set(key: string, value: any): this {
        this._cache.set(key, value);
        return this;
    }

    /** 
     * Sends a set of activities to the user. An array of responses form the server will be 
     * returned.
     * @param activities Set of activities being sent.
     */
    public sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const ref = BotContext.getConversationReference(this._request);
        const output = activities.map((a) => BotContext.applyConversationReference(a, ref))
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
    public updateActivity(activity: Partial<Activity>): Promise<void> {
        return this.emit(this._onUpdateActivity, activity, () => this._adapter.updateActivity(activity));
    }

    /** 
     * Deletes an existing activity. 
     * @param id of the activity to delete.
     */
    public deleteActivity(id: string): Promise<void> {
        return this.emit(this._onDeleteActivity, id, () => this._adapter.deleteActivity(id));
    }

    /** 
     * Registers a handler to be notified of and potentially intercept the sending of activities. 
     * @param handler A function that will be called anytime [sendActivities()](#sendactivities) is called. The handler should call `next()` to continue sending of the activities. 
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

    private emit<T>(handlers: ((arg: T, next: () => Promise<any>) => Promiseable<any>)[], arg: T, next: () => Promise<any>): Promise<any> {
        const list = handlers.slice();
        function emitNext(i: number): Promise<void> {
            try {
                if (i < list.length) {
                    return Promise.resolve(list[i](arg, () => emitNext(i + 1)));
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
     * return context.adapter.sendActivities([activity]);
     * ```
     * @param activity Activity to copy delivery information to.
     * @param reference Conversation reference containing delivery information.
     */
    static applyConversationReference(activity: Partial<Activity>, reference: Partial<ConversationReference>): Partial<Activity> {
        activity.channelId = reference.channelId;
        activity.serviceUrl = reference.serviceUrl;
        activity.conversation = reference.conversation;
        activity.from = reference.bot;
        activity.recipient = reference.user;
        if (reference.activityId) { activity.replyToId = reference.activityId }
        return activity;
    }
}


