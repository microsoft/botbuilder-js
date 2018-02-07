/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MiddlewareSet } from './middlewareSet';
import { Activity, ConversationReference } from './activity';
import { ActivityAdapter } from './activityAdapter';
import { Promiseable } from './middleware';
import { TemplateRenderer } from './templateManager';
import { TemplateDictionary } from './botbuilder';
/**
 * Manages all communication between the bot and a user.
 *
 * **Usage Example**
 *
 * ```js
 * import { Bot } from 'botbuilder-core'; // typescript
 *
 * const bot = new Bot(adapter); // init bot and bind to adapter
 *
 * bot.onReceive((context) => { // define the bot's onReceive handler
 *   context.reply(`Hello World`); // send message to user
 * });
 * ```
 */
export declare class Bot extends MiddlewareSet {
    private receivers;
    private _adapter;
    /**
     * Creates a new instance of a bot
     *
     * @param adapter Connector used to link the bot to the user communication wise.
     */
    constructor(adapter: ActivityAdapter);
    /** Returns the current adapter. */
    readonly adapter: ActivityAdapter;
    /**
     * Creates a new context object given an activity or conversation reference. The context object
     * will be disposed of automatically once the callback completes or the promise it returns
     * completes.
     *
     * **Usage Example**
     *
     * ```js
     * subscribers.forEach((subscriber) => {
     *      bot.createContext(subscriber.savedReference, (context) => {
     *          context.reply(`Hi ${subscriber.name}... Here's what's new with us.`)
     *                 .reply(newsFlash);
     *      });
     * });
     * ```
     *
     * @param activityOrReference Activity or ConversationReference to initialize the context object with.
     * @param onReady Function that will use the created context object.
     */
    createContext(activityOrReference: Activity | ConversationReference, onReady: (context: BotContext) => Promiseable<void>): Promise<void>;
    /**
     * Registers a new receiver with the bot. All incoming activities are routed to receivers in
     * the order they're registered. The first receiver to return `{ handled: true }` prevents
     * the receivers after it from being called.
     *
     * **Usage Example**
     *
     * ```js
     * const bot = new Bot(adapter)
     *      .onReceive((context) => {
     *         context.reply(`Hello World`);
     *      });
     * ```
     *
     * @param receivers One or more receivers to register.
     */
    onReceive(...receivers: ((context: BotContext) => Promiseable<void>)[]): this;
    /**
     * Register template renderer  as middleware
     * @param templateRenderer templateRenderer
     */
    useTemplateRenderer(templateRenderer: TemplateRenderer): Bot;
    /**
     * Register TemplateDictionary as templates
     * @param templates templateDictionary to register
     */
    useTemplates(templates: TemplateDictionary): Bot;
    /**
     * INTERNAL sends an outgoing set of activities to the user. Calling `context.flushResponses()` achieves the same
     * effect and is the preferred way of sending activities to the user.
     *
     * @param context Context for the current turn of the conversation.
     * @param activities Set of activities to send.
     */
    post(context: BotContext, ...activities: Partial<Activity>[]): Promise<ConversationReference[]>;
    /**
     * Dispatches an incoming set of activities. This method can be used to dispatch an activity
     * to the bot as if a user had sent it which is sometimes useful.
     *
     * @param activity The activity that was received.
     * @returns `{ handled: true }` if the activity was handled by a middleware plugin or one of the bots receivers.
     */
    receive(activity: Activity): Promise<void>;
}
