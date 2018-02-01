/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Activity, ConversationResourceResponse } from './activity';

/**
 * Type signature for a return value that can (Optionally) return its value 
 * asynchronously using a Promise.
 * @param T (Optional) type of value being returned. This defaults to `void`.
 */
export type Promiseable <T = void> = Promise<T>|T;

/**
 * Returns true if a result that can (Optionally) be a Promise looks like a Promise.
 * @param result The result to test.
 */
export function isPromised <T>(result: Promiseable<T>): result is Promise<T> {
    return result && (result as Promise<T>).then !== undefined;
}

/** 
 * Implemented by middleware plugins. Plugins have four separate methods they can implement to tap
 * into the life cycle of a request. When an activity is received from a user, middleware plugins 
 * will have their methods invoked in the following sequence:
 * 
 * >> [contextCreated()](#contextcreated) -> [receiveActivity()](#receiveactivity) -> (bots logic) 
 *    -> [postActivity()](#postactivity) -> [contextDone()](#contextdone)
 * 
 * 
 *   
 */
export interface Middleware {
    /** 
     * (Optional) called when a new context object has been created. Plugins can extend the 
     * context object in this call.
     *
     * @param context Context for the current turn of the conversation.
     * @param next Function you should call to continue execution of the middleware pipe.
     */
    contextCreated?(context: BotContext, next: () => Promise<void>): Promise<void>;

    /**
     * (Optional) called after [contextCreated](#contextCreated) to route a received activity. 
     * Plugins can return `{ handled: true }` to indicate that they have successfully routed 
     * the activity. This will prevent further calls to `receiveActivity()`.
     *
     * @param context Context for the current turn of the conversation.
     * @param next Function you should call to continue execution of the middleware pipe.
     */
    receiveActivity?(context: BotContext, next: () => Promise<void>): Promise<void>;

    /**
     * (Optional) called anytime an outgoing set of activities are being sent. Plugins can
     * implement logic to either transform the outgoing activities or to persist some state
     * prior to delivery of the activities.
     *
     * @param context Context for the current turn of the conversation.
     * @param next Function you should call to continue execution of the middleware pipe.
     */
    postActivity?(context: BotContext, activities: Partial<Activity>[], next: () => Promise<ConversationResourceResponse[]>): Promise<ConversationResourceResponse[]>;
}
