"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const middlewareSet_1 = require("./middlewareSet");
const activity_1 = require("./activity");
const botContext_1 = require("./botContext");
const templateManager_1 = require("./templateManager");
const botbuilder_1 = require("./botbuilder");
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
class Bot extends middlewareSet_1.MiddlewareSet {
    /**
     * Creates a new instance of a bot
     *
     * @param adapter Connector used to link the bot to the user communication wise.
     */
    constructor(adapter) {
        super();
        this.receivers = [];
        // Bind to adapter
        this._adapter = adapter;
        this._adapter.onReceive = (activity) => this.receive(activity).then(() => { });
        // built in middleware
        // QUESTION: Should we really have built-in middleware?
        this.use(new templateManager_1.TemplateManager());
    }
    /** Returns the current adapter. */
    get adapter() {
        return this._adapter;
    }
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
    createContext(activityOrReference, onReady) {
        // Initialize context object
        let context;
        if (activityOrReference.type) {
            context = botContext_1.createBotContext(this, activityOrReference);
        }
        else {
            context = botContext_1.createBotContext(this);
            context.conversationReference = activityOrReference;
        }
        // Run context created pipeline
        return this.contextCreated(context, function contextReady() {
            // Run proactive or reactive logic
            return Promise.resolve(onReady(context));
        }).then(() => {
            // Next flush any queued up responses
            return context.flushResponses();
        }).then(() => {
            // Dispose of the context object
            context.dispose();
        });
    }
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
    onReceive(...receivers) {
        receivers.forEach((fn) => {
            this.use({
                receiveActivity: function onReceive(context, next) {
                    return Promise.resolve(fn(context)).then(() => next());
                }
            });
        });
        return this;
    }
    /**
     * Register template renderer  as middleware
     * @param templateRenderer templateRenderer
     */
    useTemplateRenderer(templateRenderer) {
        return this.use({
            contextCreated: (ctx, next) => {
                ctx.templateManager.register(templateRenderer);
                return next();
            }
        });
    }
    /**
     * Register TemplateDictionary as templates
     * @param templates templateDictionary to register
     */
    useTemplates(templates) {
        return this.use(new botbuilder_1.DictionaryRenderer(templates));
    }
    /**
     * INTERNAL sends an outgoing set of activities to the user. Calling `context.flushResponses()` achieves the same
     * effect and is the preferred way of sending activities to the user.
     *
     * @param context Context for the current turn of the conversation.
     * @param activities Set of activities to send.
     */
    post(context, ...activities) {
        // Ensure activities are well formed.
        for (let i = 0; i < activities.length; i++) {
            let activity = activities[i];
            if (!activity.type) {
                activity.type = activity_1.ActivityTypes.message;
            }
            activity_1.applyConversationReference(activity, context.conversationReference);
        }
        // Run post activity pipeline
        const adapter = this.adapter;
        return this.postActivity(context, activities, function postActivities() {
            // Post the set of output activities
            return adapter.post(activities)
                .then((responses) => {
                // Ensure responses array populated
                if (!Array.isArray(responses)) {
                    responses = [];
                    for (let i = 0; i < activities.length; i++) {
                        responses.push({});
                    }
                }
                return responses;
            });
        });
    }
    /**
     * Dispatches an incoming set of activities. This method can be used to dispatch an activity
     * to the bot as if a user had sent it which is sometimes useful.
     *
     * @param activity The activity that was received.
     * @returns `{ handled: true }` if the activity was handled by a middleware plugin or one of the bots receivers.
     */
    receive(activity) {
        // Create context and run receive activity pipeline
        return this.createContext(activity, (context) => this.receiveActivity(context, () => Promise.resolve()));
    }
}
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map