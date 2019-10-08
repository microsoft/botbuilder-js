/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ChannelAccount, MessageReaction, TurnContext } from '.';
import { ActivityHandlerBase } from './activityHandlerBase';

export type BotHandler = (context: TurnContext, next: () => Promise<void>) => Promise<any>;

/**
 * Event-emitting base class bots.
 *
 * @remarks
 * This provides an extensible base class for handling incoming
 * activities in an event-driven way.  Developers may bind one or
 * more handlers for each type of event.
 *
 * To bind a handler to an event, use the `on<Event>()` method, for example:
 *
 * ```Javascript
 * bot.onMessage(async (context, next) => {
 * // do something
 * // then `await next()` to continue processing
 * await next();
 * });
 * ```
 *
 * A series of events will be emitted while the activity is being processed.
 * Handlers can stop the propagation of the event by omitting a call to `next()`.
 *
 * * Turn - emitted for every activity
 * * Type-specific - an event, based on activity.type
 * * Sub-type - any specialized events, based on activity content
 * * Dialog - the final event, used for processing Dialog actions
 *
 * A simple implementation:
 * ```Javascript
 * const bot = new ActivityHandler();
 *
 *  server.post('/api/messages', (req, res) => {
 *      adapter.processActivity(req, res, async (context) => {
 *          // Route to main dialog.
 *          await bot.run(context);
 *      });
 * });
 *
 * bot.onMessage(async (context, next) => {
 *      // do stuff
 *      await context.sendActivity(`Echo: ${ context.activity.text }`);
 *      // proceed with further processing
 *      await next();
 * });
 * ```
 */
export class ActivityHandler extends ActivityHandlerBase {
    protected readonly handlers: {[type: string]: BotHandler[]} = {};

    /**
     * Bind a handler to the Turn event that is fired for every incoming activity, regardless of type
     * @remarks
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onTurn(handler: BotHandler): this {
        return this.on('Turn', handler);
    }

    /**
     * Receives all incoming Message activities
     * @remarks
     * Message activities represent content intended to be shown within a conversational interface.
     * Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
     * Note that while most messages do contain text, this field is not always present!
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onMessage(handler: BotHandler): this {
        return this.on('Message', handler);
    }

    /**
     * Receives all ConversationUpdate activities, regardless of whether members were added or removed
     * @remarks
     * Conversation update activities describe a change in a conversation's members, description, existence, or otherwise.
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onConversationUpdate(handler: BotHandler): this {
        return this.on('ConversationUpdate', handler);
    }

    /**
     * Receives only ConversationUpdate activities representing members being added.
     * @remarks
     * context.activity.membersAdded will include at least one entry.
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onMembersAdded(handler: BotHandler): this {
        return this.on('MembersAdded', handler);
    }

    /**
     * Receives only ConversationUpdate activities representing members being removed.
     * @remarks
     * context.activity.membersRemoved will include at least one entry.
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onMembersRemoved(handler: BotHandler): this {
        return this.on('MembersRemoved', handler);
    }

    /**
     * Receives only MessageReaction activities, regardless of whether message reactions were added or removed
     * @remarks
     * MessageReaction activities are sent to the bot when a message reacion, such as 'like' or 'sad' are
     * associated with an activity previously sent from the bot.
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onMessageReaction(handler: BotHandler): this {
        return this.on('MessageReaction', handler);
    }

    /**
     * Receives only MessageReaction activities representing message reactions being added.
     * @remarks
     * context.activity.reactionsAdded will include at least one entry.
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onReactionsAdded(handler: BotHandler): this {
        return this.on('ReactionsAdded', handler);
    }

    /**
     * Receives only MessageReaction activities representing message reactions being removed.
     * @remarks
     * context.activity.reactionsRemoved will include at least one entry.
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onReactionsRemoved(handler: BotHandler): this {
        return this.on('ReactionsRemoved', handler);
    }

    /**
     * Receives all Event activities.
     * @remarks
     * Event activities communicate programmatic information from a client or channel to a bot.
     * The meaning of an event activity is defined by the `name` field.
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onEvent(handler: BotHandler): this {
        return this.on('Event', handler);
    }

    /**
     * Receives event activities of type 'tokens/response'
     * @remarks
     * These events occur during the oauth flow
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onTokenResponseEvent(handler: BotHandler): this {
        return this.on('TokenResponseEvent', handler);
    }

    /**
     * UnrecognizedActivityType will fire if an activity is received with a type that has not previously been defined.
     * @remarks
     * Some channels or custom adapters may create Actitivies with different, "unofficial" types.
     * These events will be passed through as UnrecognizedActivityType events.
     * Check `context.activity.type` for the type value.
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onUnrecognizedActivityType(handler: BotHandler): this {
        return this.on('UnrecognizedActivityType', handler);
    }

    /**
     * onDialog fires at the end of the event emission process, and should be used to handle Dialog activity.
     * @remarks
     * Sample code:
     * ```javascript
     * bot.onDialog(async (context, next) => {
     *      if (context.activity.type === ActivityTypes.Message) {
     *          const dialogContext = await dialogSet.createContext(context);
     *          const results = await dialogContext.continueDialog();
     *          await conversationState.saveChanges(context);
     *      }
     *
     *      await next();
     * });
     * ```
     * @param handler BotHandler A handler function in the form async(context, next) => { ... }
     */
    public onDialog(handler: BotHandler): this {
        return this.on('Dialog', handler);
    }

    /**
     * `run()` is the main "activity handler" function used to ingest activities into the event emission process.
     * @remarks
     * Sample code:
     * ```javascript
     *  server.post('/api/messages', (req, res) => {
     *      adapter.processActivity(req, res, async (context) => {
     *          // Route to main dialog.
     *          await bot.run(context);
     *      });
     * });
     * ```
     *
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    public async run(context: TurnContext): Promise<void> {
        await super.run(context);
    }

    /**
     * Overwrite this method to use different logic than the default initial Activity processing logic.
     * @remarks
     * The default logic is below:
     * ```ts
     *  await this.handle(context, 'Turn', async () => {
     *      await super.onTurnActivity(context);
     *  });
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onTurnActivity(context: TurnContext): Promise<void> {
        await this.handle(context, 'Turn', async () => {
            await super.onTurnActivity(context);
        });
    }

    /**
     * Runs all `onMesssage()` handlers before calling the `ActivityHandler.defaultNextEvent()`.
     * @remarks
     * Developers may overwrite this method when having supporting multiple channels to have a
     * channel-tailored experience.
     * @remarks
     * The default logic is below:
     * ```ts
     *  await await this.handle(context, 'Message', this.defaultNextEvent(context));
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onMessageActivity(context: TurnContext): Promise<void> {
        await this.handle(context, 'Message', this.defaultNextEvent(context));
    }

    /**
     * Runs all `onUnrecognizedActivityType()` handlers before calling `ActivityHandler.dispatchConversationUpdateActivity()`.
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onUnrecognizedActivity(context: TurnContext): Promise<void> {
        await this.handle(context, 'UnrecognizedActivityType', this.defaultNextEvent(context));
    }

    /**
     * Runs all `onConversationUpdate()` handlers before calling `ActivityHandler.dispatchConversationUpdateActivity()`.
     * @remarks
     * The default logic is below:
     * ```ts
     *  await this.handle(context, 'ConversationUpdate', async () => {
     *      await this.dispatchConversationUpdateActivity(context);
     *  });
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onConversationUpdateActivity(context: TurnContext): Promise<void> {
        await this.handle(context, 'ConversationUpdate', async () => {
            await this.dispatchConversationUpdateActivity(context);
        });
    }

    /**
     * Override this method when dispatching off of a `'ConversationUpdate'` event to trigger other sub-events.
     * @remarks
     * The default logic is below:
     * ```ts
     *  if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
     *      await this.handle(context, 'MembersAdded', this.defaultNextEvent(context));
     *  } else if (context.activity.membersRemoved && context.activity.membersRemoved.length > 0) {
     *      await this.handle(context, 'MembersRemoved', this.defaultNextEvent(context));
     *  } else {
     *      await this.defaultNextEvent(context)();
     *  }
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async dispatchConversationUpdateActivity(context: TurnContext): Promise<void> {
        if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
            await this.handle(context, 'MembersAdded', this.defaultNextEvent(context));
        } else if (context.activity.membersRemoved && context.activity.membersRemoved.length > 0) {
            await this.handle(context, 'MembersRemoved', this.defaultNextEvent(context));
        } else {
            await this.defaultNextEvent(context)();
        }
    }

    /**
     * Runs all `onMessageReaction()` handlers before calling `ActivityHandler.dispatchMessageReactionActivity()`.
     * @remarks
     * The default logic is below:
     * ```ts
     *  await this.handle(context, 'MessageReaction', async () => {
     *      await this.dispatchMessageReactionActivity(context);
     *  });
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onMessageReactionActivity(context: TurnContext): Promise<void> {
        await this.handle(context, 'MessageReaction', async () => {
            await this.dispatchMessageReactionActivity(context);
        });
    }

    /**
     * 
     * @param reactionsAdded The list of reactions added
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onReactionsAddedActivity(reactionsAdded: MessageReaction[], context: TurnContext): Promise<void> {
        await this.handle(context, 'ReactionsAdded', this.defaultNextEvent(context));
    }

    /**
     * 
     * @param reactionsRemoved The list of reactions removed
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onReactionsRemovedActivity(reactionsRemoved: MessageReaction[], context: TurnContext): Promise<void> {
        await this.handle(context, 'ReactionsRemoved', this.defaultNextEvent(context));
    }

    /**
     * Override this method when dispatching off of a `'MessageReaction'` event to trigger other sub-events.
     * @remarks
     * If there are no reactionsAdded or reactionsRemoved on the incoming activity, it will call `this.defaultNextEvent`
     * which emits the `'Dialog'` event by default.
     * The default logic is below:
     * ```ts
     *  if (context.activity.reactionsAdded || context.activity.reactionsRemoved) {
     *      super.onMessageReactionActivity(context);
     *  } else {
     *      await this.defaultNextEvent(context)();
     *  }
     * ```
     * `super.onMessageReactionActivity()` will dispatch to `onReactionsAddedActivity()`
     * or `onReactionsRemovedActivity()`.
     * 
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async dispatchMessageReactionActivity(context: TurnContext): Promise<void> {
        if (context.activity.reactionsAdded || context.activity.reactionsRemoved) {
            await super.onMessageReactionActivity(context);
        } else {
            await this.defaultNextEvent(context)();
        }
    }

    /**
     * Runs all `onEvent()` handlers before calling `ActivityHandler.dispatchEventActivity()`.
     * @remarks
     * The default logic is below:
     * ```ts
     *  await this.handle(context, 'Event', async () => {
     *      await this.dispatchEventActivity(context);
     *  });
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onEventActivity(context: TurnContext): Promise<void> {
        await this.handle(context, 'Event', async () => {
            await this.dispatchEventActivity(context);
        });
    }
    
    /**
     * Override this method when dispatching off of a `'Event'` event to trigger other sub-events.
     * @remarks
     * For certain channels (e.g. Web Chat, custom Direct Line clients), developers can emit
     * custom `'event'`-type activities from the client. Developers should then overwrite this method
     * to support their custom `'event'` activities.
     * 
     * The default logic is below:
     * ```ts
     *  if (context.activity.name === 'tokens/response') {
     *      await this.handle(context, 'TokenResponseEvent', this.defaultNextEvent(context));
     *  } else {
     *      await this.defaultNextEvent(context)();
     *  }
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async dispatchEventActivity(context: TurnContext): Promise<void> {
        if (context.activity.name === 'tokens/response') {
            await this.handle(context, 'TokenResponseEvent', this.defaultNextEvent(context));
        } else {
            await this.defaultNextEvent(context)();
        }
    }

    /**
     * Returns an async function that emits the `'Dialog'` event when called.
     * Overwrite this function to emit a different default event once all relevant
     * events are emitted.
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected defaultNextEvent(context: TurnContext): () => Promise<void> {
        const runDialogs = async (): Promise<void> => {
            await this.handle(context, 'Dialog', async () => {
                // noop
            });
        };
        return runDialogs;
    }


    /**
     * Used to bind handlers to events by name
     * @param type string
     * @param handler BotHandler
     */
    protected on(type: string, handler: BotHandler) {
        if (!this.handlers[type]) {
            this.handlers[type] = [handler];
        } else {
            this.handlers[type].push(handler);
        }
        return this;
    }

    /**
     * Used to fire events and execute any bound handlers
     * @param type string
     * @param handler BotHandler
     */
    protected async handle(context: TurnContext, type: string,  onNext: () => Promise<void>): Promise<any> {
        let returnValue: any = null;

        async function runHandler(index: number): Promise<void> {
            if (index < handlers.length) {
                const val = await handlers[index](context, () => runHandler(index + 1));
                // if a value is returned, and we have not yet set the return value,
                // capture it.  This is used to allow InvokeResponses to be returned.
                if (typeof(val) !== 'undefined' && returnValue === null) {
                    returnValue = val;
                }
            } else {
                const val = await onNext();
                if (typeof(val) !== 'undefined') {
                    returnValue = val;
                }
            }
        }

        const handlers = this.handlers[type] || [];
        await runHandler(0);

        return returnValue;
    }
}
