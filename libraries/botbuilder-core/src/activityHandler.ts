/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes, TurnContext } from '.';

/**
 * Describes an activity event handler, for use with an [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
 * 
 * @remarks
 * **Parameters**
 * 
 * | Name | Type | Description |
 * | :--- | :--- | :--- |
 * | `context` | [TurnContext](xref:botbuilder-core.TurnContext) | The context object for the turn. |
 * | `next` | () => Promise<void> | A continuation function for handling the activity. |
 * 
 * The incoming activity is contained in the `context` object's [activity](xref:botbuilder-core.TurnContext.activity) property.
 * Call the `next` function to continue the processing of activity events. Not doing so will stop propagation of events for this activity.
 */
export type BotHandler = (context: TurnContext, next: () => Promise<void>) => Promise<any>;

/**
 * Event-emitting base class for bots.
 *
 * @remarks
 * This provides an extensible base class for handling incoming activities in an event-driven way.
 * Developers may implement an arbitrary set of handlers for each event type.
 *
 * To bind a handler to an event, use the corresponding _on event_ method. If multiple handlers are
 * bound to an event, they are run in the order in which they were bound.
 *
 * The `ActivityHandler` emits a series of _events_ as the activity is processed.
 * Handlers can stop the propagation of the event by not calling the continuation function.
 *
 * | Event type | Description |
 * | :--- | :--- |
 * | Turn | Emitted first for every activity. |
 * | Type-specific | Emitted when handling a the specific activity type, before emitting an event for any sub-type. |
 * | Sub-type | Emitted for certain specialized events, based on activity content. |
 * | Dialog | Emitted as the final activity processing event. Designed for passing control to a dialog. |
 *
 * For example:
 * 
 * ```
 * const bot = new ActivityHandler();
 *
 * server.post('/api/messages', (req, res) => {
 *     adapter.processActivity(req, res, async (context) => {
 *         // Route to main dialog.
 *         await bot.run(context);
 *     });
 * });
 *
 * bot.onTurn(async (context, next) => {
 *         // Handle a "turn" event.
 *         await context.sendActivity(`${ context.activity.type } activity received.`);
 *         // Continue with further processing.
 *         await next();
 *     })
 *     .onMessage(async (context, next) => {
 *         // Handle a message activity.
 *         await context.sendActivity(`Echo: ${ context.activity.text }`);
 *         // Continue with further processing.
 *         await next();
 *     });
 * ```
 */
export class ActivityHandler {
    private readonly handlers: {[type: string]: BotHandler[]} = {};

    /**
     * Binds an activity event handler to the _turn_ event, emitted for every incoming activity, regardless of type.
     * 
     * @param handler The event handler to bind.
     * @returns A reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     */
    public onTurn(handler: BotHandler): this {
        return this.on('Turn', handler);
    }

    /**
     * Binds an activity event handler to the _message_ event, emitted for every incoming message activity.
     * 
     * @param handler The event handler to bind.
     * @returns A reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * @remarks
     * Message activities represent content intended to be shown within a conversational interface
     * and can contain text, speech, interactive cards, and binary or unknown attachments.
     * Not all message activities contain text, the [text](xref:botframework-schema.Activity.text)
     * property of the message activity can be `null` or `undefined`.
     */
    public onMessage(handler: BotHandler): this {
        return this.on('Message', handler);
    }

    /**
     * Binds an activity event handler to the _conversation update_ event, emitted for every incoming
     * conversation update activity.
     * 
     * @param handler The event handler to bind.
     * @returns A reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * @remarks
     * Conversation update activities describe a changes to a conversation's metadata, such as title, participants,
     * or other channel-specific information. The [onMembersAdded](xref:botbuilder-core.ActivityHandler.onMembersAdded)
     * and [onMembersRemoved](xref:botbuilder-core.ActivityHandler.onMembersRemoved) sub-type events are also emitted
     * when members are added or removed from the conversation.
     */
    public onConversationUpdate(handler: BotHandler): this {
        return this.on('ConversationUpdate', handler);
    }

    /**
     * Binds an activity event handler to the _members added_ event, emitted for any incoming
     * conversation update activity that includes members added to the conversation.
     * 
     * @param handler The event handler to bind.
     * @returns A reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * @remarks
     * The activity's [membersAdded](xref:botframework-schema.Activity.membersAdded) property
     * contains the members added to the conversation, which can include the bot.
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
        await this.handle(context, 'Turn', async () => {
            switch (context.activity.type) {
                case ActivityTypes.Message:
                    await this.handle(context, 'Message', runDialogs);
                    break;
                case ActivityTypes.ConversationUpdate:
                    await this.handle(context, 'ConversationUpdate', async () => {
                        if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
                            await this.handle(context, 'MembersAdded', runDialogs);
                        } else if (context.activity.membersRemoved && context.activity.membersRemoved.length > 0) {
                            await this.handle(context, 'MembersRemoved', runDialogs);
                        } else {
                            await runDialogs();
                        }
                    });
                    break;
                case ActivityTypes.MessageReaction:
                    await this.handle(context, 'MessageReaction', async () => {
                        if (context.activity.reactionsAdded && context.activity.reactionsAdded.length > 0) {
                            await this.handle(context, 'ReactionsAdded', runDialogs);
                        } else if (context.activity.reactionsRemoved && context.activity.reactionsRemoved.length > 0) {
                            await this.handle(context, 'ReactionsRemoved', runDialogs);
                        } else {
                            await runDialogs();
                        }
                    });
                    break;
                case ActivityTypes.Event:
                    await this.handle(context, 'Event', async () => {
                        if (context.activity.name === 'tokens/response') {
                            await this.handle(context, 'TokenResponseEvent', runDialogs);
                        } else {
                            await runDialogs();
                        }
                    });
                    break;
                default:
                // handler for unknown or unhandled types
                    await this.handle(context, 'UnrecognizedActivityType', runDialogs);
                    break;
            }
        });
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
