/**
 * @module botbuilder-node
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityAdapter } from 'botbuilder';
import { Activity, ConversationResourceResponse } from 'botbuilder';
/**
 * Lets a user communicate with a bot from a console window.
 *
 * **Usage Example**
 *
 * ```js
 * const adapter = new ConsoleAdapter().listen();
 * const bot = new Bot(adapter)
 *      .onReceive((context) => {
 *          context.reply(`Hello World!`);
 *      });
 * ```
 */
export declare class ConsoleAdapter implements ActivityAdapter {
    private nextId;
    private rl;
    constructor();
    /** INTERNAL implementation of `Adapter.onReceive`. */
    onReceive: (activity: Activity) => Promise<void>;
    /** INTERNAL implementation of `Adapter.post()`. */
    post(activities: Partial<Activity>[]): Promise<ConversationResourceResponse[]>;
    /**
     * Begins listening to console input. The listener will call [receive()](#receive) after
     * parsing input from the user.
     */
    listen(): this;
    /**
     * Processes input received from the user.
     *
     * @param text The users utterance.
     */
    receive(text: string): this;
}
