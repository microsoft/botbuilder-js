/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ChannelAccount, MessageReaction, TurnContext } from '.';
import { ActivityHandlerBase } from './activityHandlerBase';

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
 * **Returns**
 * 
 * `any`
 * 
 * The incoming activity is contained in the `context` object's [activity](xref:botbuilder-core.TurnContext.activity) property.
 * Call the `next` function to continue the processing of activity events. Not doing so will stop propagation of events for this activity.
 */
export type BotHandler = (context: TurnContext, next: () => Promise<void>) => Promise<any>;

/**
 * Event-emitting activity handler for bots. Extends [ActivityHandlerBase](xref:botbuilder-core.ActivityHandlerBase).
 *
 * @remarks
 * This provides an extensible class for handling incoming activities in an event-driven way.
 * You can register an arbitrary set of handlers for each event type.
 *
 * To register a handler for an event, use the corresponding _on event_ method. If multiple handlers are
 * registered for an event, they are run in the order in which they were registered.
 *
 * This object emits a series of _events_ as it processes an incoming activity.
 * A handler can stop the propagation of the event by not calling the continuation function.
 *
 * | Event type | Description |
 * | :--- | :--- |
 * | Turn | Emitted first for every activity. |
 * | Type-specific | Emitted for the specific activity type, before emitting an event for any sub-type. |
 * | Sub-type | Emitted for certain specialized events, based on activity content. |
 * | Dialog | Emitted as the final activity processing event. Designed for passing control to a dialog. |
 *
 * For example:
 * 
 * ```typescript
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
 * 
 * **See also**
 * - The [Bot Framework Activity schema](https://aka.ms/botSpecs-activitySchema)
 */
export class ActivityHandler extends ActivityHandlerBase {
    protected readonly handlers: {[type: string]: BotHandler[]} = {};

    /**
     * Registers an activity event handler for the _turn_ event, emitted for every incoming activity, regardless of type.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     */
    public onTurn(handler: BotHandler): this {
        return this.on('Turn', handler);
    }

    /**
     * Registers an activity event handler for the _message_ event, emitted for every incoming message activity.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * Message activities represent content intended to be shown within a conversational interface
     * and can contain text, speech, interactive cards, and binary or unknown attachments.
     * Not all message activities contain text, the activity's [text](xref:botframework-schema.Activity.text)
     * property can be `null` or `undefined`.
     */
    public onMessage(handler: BotHandler): this {
        return this.on('Message', handler);
    }

    /**
     * Registers an activity event handler for the _conversation update_ event, emitted for every incoming
     * conversation update activity.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * Conversation update activities describe a changes to a conversation's metadata, such as title, participants,
     * or other channel-specific information.
     * 
     * To handle when members are added to or removed from the conversation, use the
     * [onMembersAdded](xref:botbuilder-core.ActivityHandler.onMembersAdded) and
     * [onMembersRemoved](xref:botbuilder-core.ActivityHandler.onMembersRemoved) sub-type event handlers.
     */
    public onConversationUpdate(handler: BotHandler): this {
        return this.on('ConversationUpdate', handler);
    }

    /**
     * Registers an activity event handler for the _members added_ event, emitted for any incoming
     * conversation update activity that includes members added to the conversation.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * The activity's [membersAdded](xref:botframework-schema.Activity.membersAdded) property
     * contains the members added to the conversation, which can include the bot.
     * 
     * To handle conversation update events in general, use the
     * [onConversationUpdate](xref:botbuilder-core.ActivityHandler.onConversationUpdate) type-specific event handler.
     */
    public onMembersAdded(handler: BotHandler): this {
        return this.on('MembersAdded', handler);
    }

    /**
     * Registers an activity event handler for the _members removed_ event, emitted for any incoming
     * conversation update activity that includes members removed from the conversation.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * The activity's [membersRemoved](xref:botframework-schema.Activity.membersRemoved) property
     * contains the members removed from the conversation, which can include the bot.
     * 
     * To handle conversation update events in general, use the
     * [onConversationUpdate](xref:botbuilder-core.ActivityHandler.onConversationUpdate) type-specific event handler.
     */
    public onMembersRemoved(handler: BotHandler): this {
        return this.on('MembersRemoved', handler);
    }

    /**
     * Registers an activity event handler for the _message reaction_ event, emitted for every incoming
     * message reaction activity.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * Message reaction activities represent a social interaction on an existing message activity
     * within a conversation. The original activity is referred to by the message reaction activity's
     * [replyToId](xref:botframework-schema.Activity.replyToId) property. The
     * [from](xref:botframework-schema.Activity.from) property represents the source of the reaction,
     * such as the user that reacted to the message.
     * 
     * To handle when reactions are added to or removed from messages in the conversation, use the
     * [onReactionsAdded](xref:botbuilder-core.ActivityHandler.onReactionsAdded) and
     * [onReactionsRemoved](xref:botbuilder-core.ActivityHandler.onReactionsRemoved) sub-type event handlers.
     */
    public onMessageReaction(handler: BotHandler): this {
        return this.on('MessageReaction', handler);
    }

    /**
     * Registers an activity event handler for the _reactions added_ event, emitted for any incoming
     * message reaction activity that describes reactions added to a message.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * The activity's [reactionsAdded](xref:botframework-schema.Activity.reactionsAdded) property
     * includes one or more reactions that were added.
     * 
     * To handle message reaction events in general, use the
     * [onMessageReaction](xref:botbuilder-core.ActivityHandler.onMessageReaction) type-specific event handler.
     */
    public onReactionsAdded(handler: BotHandler): this {
        return this.on('ReactionsAdded', handler);
    }

    /**
     * Registers an activity event handler for the _reactions removed_ event, emitted for any incoming
     * message reaction activity that describes reactions removed from a message.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * The activity's [reactionsRemoved](xref:botframework-schema.Activity.reactionsRemoved) property
     * includes one or more reactions that were removed.
     * 
     * To handle message reaction events in general, use the
     * [onMessageReaction](xref:botbuilder-core.ActivityHandler.onMessageReaction) type-specific event handler.
     */
    public onReactionsRemoved(handler: BotHandler): this {
        return this.on('ReactionsRemoved', handler);
    }

    /**
     * Registers an activity event handler for the _event_ event, emitted for every incoming event activity.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * Event activities communicate programmatic information from a client or channel to a bot.
     * The meaning of an event activity is defined by the activity's
     * [name](xref:botframework-schema.Activity.name) property, which is meaningful within the scope
     * of a channel. Event activities are designed to carry both interactive information (such as
     * button clicks) and non-interactive information (such as a notification of a client
     * automatically updating an embedded speech model).
     * 
     * To handle a `tokens/response` event event, use the
     * [onTokenResponseEvent](xref:botbuilder-core.ActivityHandler.onTokenResponseEvent) sub-type
     * event handler. To handle other named events, add logic to this handler.
     */
    public onEvent(handler: BotHandler): this {
        return this.on('Event', handler);
    }

    /**
     * Registers an activity event handler for the _tokens-response_ event, emitted for any incoming
     * `tokens/response` event activity. These are generated as part of the OAuth authentication flow.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * The activity's [value](xref:botframework-schema.Activity.value) property contains the user token.
     * 
     * If your bot handles authentication using an [OAuthPrompt](xref:botbuilder-dialogs.OAuthPrompt)
     * within a dialog, then the dialog will need to receive this activity to complete the authentication flow.
     * 
     * To handle other named events and event events in general, use the
     * [onEvent](xref:botbuilder-core.ActivityHandler.onEvent) type-specific event handler.
     */
    public onTokenResponseEvent(handler: BotHandler): this {
        return this.on('TokenResponseEvent', handler);
    }

    /**
     * Registers an activity event handler for the _unrecognized activity type_ event, emitted for an
     * incoming activity with a type for which the [ActivityHandler](xref:botbuilder-core.ActivityHandler)
     * doesn't provide an event handler.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * The `ActivityHandler` does not define events for all activity types defined in the
     * [Bot Framework Activity schema](http://aka.ms/botSpecs-activitySchema). In addition,
     * channels and custom adapters can create [Activities](xref:botframework-schema.Activity) with
     * types not in the schema. When the activity handler receives such an event, it emits an unrecognized activity type event.
     * 
     * The activity's [type](xref:botframework-schema.Activity.type) property contains the activity type.
     */
    public onUnrecognizedActivityType(handler: BotHandler): this {
        return this.on('UnrecognizedActivityType', handler);
    }

    /**
     * Registers an activity event handler for the _dialog_ event, emitted as the last event for an incoming activity.
     * 
     * @param handler The event handler.
     * 
     * @remarks
     * Returns a reference to the [ActivityHandler](xref:botbuilder-core.ActivityHandler) object.
     * 
     * For example:
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
     */
    public onDialog(handler: BotHandler): this {
        return this.on('Dialog', handler);
    }

    /**
     * Initiates the event emission process.
     * 
     * @param context The context object for the current turn.
     *
     * @remarks
     * Typically, you would provide this method as the function handler that the adapter calls
     * to perform the bot's logic after the received activity has been pre-processed by the adapter
     * and routed through any middleware.
     * 
     * For example:
     * ```javascript
     *  server.post('/api/messages', (req, res) => {
     *      adapter.processActivity(req, res, async (context) => {
     *          // Route to main dialog.
     *          await bot.run(context);
     *      });
     * });
     * ```
     * 
     * **See also**
     * - [BotFrameworkAdapter.processActivity](xref:botbuilder.BotFrameworkAdapter.processActivity)
     */
    public async run(context: TurnContext): Promise<void> {
        await super.run(context);
    }

    /**
     * Called at the start of the event emission process.
     * 
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to use custom logic for emitting events. The default logic is defined by
     * [ActivityHandlerBase.onTurnActivity](xref:botbuilder-core.ActivityHandlerBase.onTurnActivity).
     */
    protected async onTurnActivity(context: TurnContext): Promise<void> {
        await this.handle(context, 'Turn', async () => {
            await super.onTurnActivity(context);
        });
    }

    /**
     * Runs all registered message handlers before calling
     * [defaultNextEvent](xref:botbuilder-core.ActivityHandler.defaultNextEvent).
     * 
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
