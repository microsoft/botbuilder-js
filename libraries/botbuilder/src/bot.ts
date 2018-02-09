/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MiddlewareSet } from './middlewareSet';
import { ActivityTypes, Activity, ConversationReference, ConversationResourceResponse, } from 'botbuilder-schema';
import { ActivityAdapter } from './activityAdapter';
import { Promiseable } from './middleware';
import { createBotContext, applyConversationReference } from './botContext';
import { TemplateManager, TemplateRenderer } from './templateManager';
import { DictionaryRenderer, TemplateDictionary } from './botbuilder';

/**
 * Manages all communication between the bot and a user.
 *
 * **Usage Example**
 *
 * ```js
 * import { Bot } from 'botbuilder'; // typescript
 *
 * const bot = new Bot(adapter); // init bot and bind to adapter
 *
 * bot.onReceive((context) => { // define the bot's onReceive handler
 *   context.reply(`Hello World`); // send message to user
 * });
 * ```
 */
export class Bot extends MiddlewareSet {
    private receivers: ((context: BotContext) => Promiseable<void>)[] = [];
    private _adapter: ActivityAdapter;

    /**
     * Creates a new instance of a bot
     *
     * @param adapter Connector used to link the bot to the user communication wise.
     */
    constructor(adapter: ActivityAdapter) {
        super();

        // Bind to adapter
        this._adapter = adapter;
        this._adapter.onReceive = (activity) => this.receive(activity).then(() => { });

        // built in middleware
        // QUESTION: Should we really have built-in middleware?
        this.use(new TemplateManager());
    }

    /** Returns the current adapter. */
    public get adapter(): ActivityAdapter {
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
    public createContext(activityOrReference: Activity | ConversationReference, onReady: (context: BotContext) => Promiseable<void>): Promise<void> {
        // Initialize context object
        let context: BotContext;
        if ((activityOrReference as Activity).type) {
            context = createBotContext(this, <Activity>activityOrReference);
        } else {
            context = createBotContext(this);
            context.conversationReference = <ConversationReference>activityOrReference;
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
    public onReceive(...receivers: ((context: BotContext) => Promiseable<void>)[]): this {
        receivers.forEach((fn) => {
            this.use({
                receiveActivity: function onReceive(context, next) {
                    return Promise.resolve(fn(context)).then(() => next());
                }
            });
        })
        return this;
    }

    /**
     * Register template renderer  as middleware
     * @param templateRenderer templateRenderer
     */
    public useTemplateRenderer(templateRenderer: TemplateRenderer): Bot {
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
    public useTemplates(templates: TemplateDictionary): Bot {
        return this.use(new DictionaryRenderer(templates));
    }

    /**
     * INTERNAL sends an outgoing set of activities to the user. Calling `context.flushResponses()` achieves the same
     * effect and is the preferred way of sending activities to the user.
     *
     * @param context Context for the current turn of the conversation.
     * @param activities Set of activities to send.
     */
    public post(context: BotContext, ...activities: Partial<Activity>[]): Promise<Partial<ConversationResourceResponse>[]> {
        // Ensure activities are well formed.
        for (let i = 0; i < activities.length; i++) {
            let activity = activities[i];
            if (!activity.type) {
                activity.type = ActivityTypes.Message
            }
            applyConversationReference(activity, context.conversationReference);
        }

        // Run post activity pipeline
        const adapter = this.adapter;
        return this.postActivity(context, activities, function postActivities() {
            // Post the set of output activities
            return adapter.post(activities)
                .then((responses) => {
                    // Ensure responses array populated
                    if (!Array.isArray(responses)) {
                        let mockResponses: ConversationResourceResponse[] = [];
                        for (let i = 0; i < activities.length; i++) {
                            mockResponses.push(<ConversationResourceResponse>{})
                        }

                        return mockResponses;
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
    public receive(activity: Activity): Promise<void> {
        // Create context and run receive activity pipeline
        return this.createContext(activity,
            (context) => this.receiveActivity(context,
                () => Promise.resolve()));
    }
}
