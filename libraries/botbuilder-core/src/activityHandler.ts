/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityTypes, TurnContext } from '.';

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
export class ActivityHandler {
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

        if (!context) {
            throw new Error(`Missing TurnContext parameter`);
        }

        if (!context.activity) {
            throw new Error(`TurnContext does not include an activity`);
        }

        if (!context.activity.type) {
            throw new Error(`Activity is missing it's type`);
        }
        
        // Allow the dialog system to be triggered at the end of the chain
        const runDialogs = async (): Promise<void> => {
            await this.handle(context, 'Dialog', async () => {
                // noop
            });
        };

        // List of all Activity Types:
        // https://github.com/Microsoft/botbuilder-js/blob/master/libraries/botframework-schema/src/index.ts#L1627
        await this.handleActivity(context, runDialogs);
    }

    /**
     * Overwrite this method to use different logic than the default initial Activity processing logic.
     * @remarks
     * The default logic is below:
     * ```ts
     *  await this.handle(context, 'Turn', async () => {
     *      await this.dispatchActivity(context, next);
     *  });
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    protected async handleActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await this.handle(context, 'Turn', async () => {
            await this.dispatchActivity(context, next);
        });
    }

    /**
     * Overwrite this method to use different dispatching logic after completing all `onTurn`-registered handlers.
     * @remarks
     * The default logic is below:
     * ```ts
     *      switch (context.activity.type) {
     *          case ActivityTypes.Message:
     *              await this.handleMessageActivity(context, next);
     *              break;
     *          case ActivityTypes.ConversationUpdate:
     *              await this.handleConversationUpdateActivity(context, next);
     *              break;
     *          case ActivityTypes.MessageReaction:
     *              await this.handleMessageReactionActivity(context, next);
     *              break;
     *          case ActivityTypes.Event:
     *              await this.handleEventActivity(context, next);
     *              break;
     *          default:
     *              // handler for unknown or unhandled types
     *              await this.handleUnrecognizedActivity(context, next);
     *              break;
     *      }
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    async dispatchActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        switch (context.activity.type) {
            case ActivityTypes.Message:
                await this.handleMessageActivity(context, next);
                break;
            case ActivityTypes.ConversationUpdate:
                await this.handleConversationUpdateActivity(context, next);
                break;
            case ActivityTypes.MessageReaction:
                await this.handleMessageReactionActivity(context, next);
                break;
            case ActivityTypes.Event:
                await this.handleEventActivity(context, next);
                break;
            default:
            // handler for unknown or unhandled types
                await this.handleUnrecognizedActivity(context, next);
                break;
        }
    }

    /**
     * 
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    protected async handleMessageActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await this.handle(context, 'Message', next);
    }

    /**
     * 
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    protected async handleUnrecognizedActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await this.handle(context, 'UnrecognizedActivityType', next);
    }

    /**
     * Overwrite this method to use different logic than the default handle ConversationUpdate logic.
     * 
     * The correct type to assign is: `(context: TurnContext, next: () => Promise<void>) => Promise<void>`
     * @remarks
     * The default logic is below:
     * ```ts
     *  await this.handle(context, 'ConversationUpdate', async () => {
     *      await this.dispatchConversationUpdateActivity(context, next);
     *  });
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    protected async handleConversationUpdateActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await this.handle(context, 'ConversationUpdate', async () => {
            await this.dispatchConversationUpdateActivity(context, next);
        });
    }

    /**
     * Override this method when dispatching off of a ConversationUpdate to trigger other sub-events.
     * @remarks
     * Sample code:
     * ```javascript
     * bot.dispatchConversationUpdate(async (context, next) => {
     *      const channelData = context.activity.data;
     *      if (channelData.eventType === 'teamMemberAdded') {
     *          await this.handle(context, 'TeamsMemberAdded', next);
     *      } else if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
     *          await this.handle(context, 'MembersAdded', next);
     *      } else {
     *          await next();
     *      }
     * });
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    protected async dispatchConversationUpdateActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
            await this.handle(context, 'MembersAdded', next);
        } else if (context.activity.membersRemoved && context.activity.membersRemoved.length > 0) {
            await this.handle(context, 'MembersRemoved', next);
        } else {
            await next();
        }
    }

    /**
     * 
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    protected async handleMessageReactionActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await this.handle(context, 'MessageReaction', async () => {
            await this.dispatchMessageReactionActivity(context, next);
        });
    }

    /**
     * 
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    protected async dispatchMessageReactionActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.reactionsAdded && context.activity.reactionsAdded.length > 0) {
            await this.handle(context, 'ReactionsAdded', next);
        } else if (context.activity.reactionsRemoved && context.activity.reactionsRemoved.length > 0) {
            await this.handle(context, 'ReactionsRemoved', next);
        } else {
            await next();
        }
    }

    /**
     * 
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    protected async handleEventActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await this.handle(context, 'Event', async () => {
            await this.dispatchEventActivity(context, next);
        });
    }
    
    /**
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     * @param next () => Promise<void>
     */
    protected async dispatchEventActivity(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.name === 'tokens/response') {
            await this.handle(context, 'TokenResponseEvent', next);
        } else {
            await next();
        }
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
