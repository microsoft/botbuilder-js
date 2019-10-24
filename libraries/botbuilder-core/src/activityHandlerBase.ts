/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    ActivityTypes,
    ChannelAccount,
    MessageReaction,
    TurnContext } from '.';

/**
 * Defines the core behavior for event-emitting activity handlers for bots.
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
 * | Type-specific | Emitted for the specific activity type, before emitting an event for any sub-type. |
 * | Sub-type | Emitted for certain specialized events, based on activity content. |
 * 
 * **See also**
 * - The [Bot Framework Activity schema](https://aka.ms/botSpecs-activitySchema)
 */
export class ActivityHandlerBase {
    /**
     * Called at the start of the event emission process.
     * 
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to use custom logic for emitting events.
     * 
     * The default logic is to call any type-specific and sub-type handlers registered via
     * the various _on event_ methods. Type-specific events are defined for:
     * - Message activities
     * - Conversation update activities
     * - Message reaction activities
     * - Event activities
     * - _Unrecognized_ activities, ones that this class has not otherwise defined an _on event_ method for.
     */
    protected async onTurnActivity(context: TurnContext): Promise<void> {
        switch (context.activity.type) {
            case ActivityTypes.Message:
                await this.onMessageActivity(context);
                break;
            case ActivityTypes.ConversationUpdate:
                await this.onConversationUpdateActivity(context);
                break;
            case ActivityTypes.MessageReaction:
                await this.onMessageReactionActivity(context);
                break;
            case ActivityTypes.Event:
                await this.onEventActivity(context);
                break;
            default:
            // handler for unknown or unhandled types
                await this.onUnrecognizedActivity(context);
                break;
        }
    }

    /**
     * Provides a hook for emitting the _message_ event.
     * 
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to run registered _message_ handlers and then continue the event
     * emission process.
     */
    protected async onMessageActivity(context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Provides a hook for emitting the _conversation update_ event.
     * 
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to run registered _conversation update_ handlers and then continue the event
     * emission process.
     * 
     * The default logic is:
     * - If members other than the bot were added to the conversation,
     *   call [onMembersAddedActivity](xref:botbuilder-core.ActivityHandlerBase.onMembersAddedActivity).
     * - If members other than the bot were removed from the conversation,
     *   call [onMembersRemovedActivity](xref:botbuilder-core.ActivityHandlerBase.onMembersRemovedActivity).
     */
    protected async onConversationUpdateActivity(context: TurnContext): Promise<void> {
        if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
            if (context.activity.membersAdded.filter(m => context.activity.recipient && context.activity.recipient.id !== m.id).length) {
                await this.onMembersAddedActivity(context.activity.membersAdded, context);
            }
        } else if (context.activity.membersRemoved && context.activity.membersRemoved.length > 0) {
            if (context.activity.membersRemoved.filter(m => context.activity.recipient && context.activity.recipient.id !== m.id).length) {
                await this.onMembersRemovedActivity(context.activity.membersRemoved, context);
            }
        }
    }

    /**
     * Provides a hook for emitting the _message reaction_ event.
     * 
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to run registered _message reaction_ handlers and then continue the event
     * emission process.
     * 
     * The default logic is:
     * - If reactions were added to a message,
     *   call [onReactionsAddedActivity](xref:botbuilder-core.ActivityHandlerBase.onReactionsAddedActivity).
     * - If reactions were removed from a message,
     *   call [onReactionsRemovedActivity](xref:botbuilder-core.ActivityHandlerBase.onReactionsRemovedActivity).
     */
    protected async onMessageReactionActivity(context: TurnContext): Promise<void> {
        if (context.activity.reactionsAdded && context.activity.reactionsAdded.length > 0) {
            await this.onReactionsAddedActivity(context.activity.reactionsAdded, context);
        } else if (context.activity.reactionsRemoved && context.activity.reactionsRemoved.length > 0) {
            await this.onReactionsRemovedActivity(context.activity.reactionsRemoved, context);
        }
    }

    /**
     * Provides a hook for emitting the _event_ event.
     * 
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to run registered _event_ handlers and then continue the event
     * emission process.
     */
    protected async onEventActivity(context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Provides a hook for emitting the _unrecognized_ event.
     * 
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to run registered _unrecognized_ handlers and then continue the event
     * emission process.
     */
    protected async onUnrecognizedActivity(context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Provides a hook for emitting the _members added_ event,
     * a sub-type of the _conversation update_ event.
     * 
     * @param membersAdded An array of the members added to the conversation.
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to run registered _members added_ handlers and then continue the event
     * emission process.
     */
    protected async onMembersAddedActivity(membersAdded: ChannelAccount[], context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Provides a hook for emitting the _members removed_ event,
     * a sub-type of the _conversation update_ event.
     * 
     * @param membersRemoved An array of the members removed from the conversation.
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to run registered _members removed_ handlers and then continue the event
     * emission process.
     */
    protected async onMembersRemovedActivity(membersRemoved: ChannelAccount[], context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Provides a hook for emitting the _reactions added_ event,
     * a sub-type of the _message reaction_ event.
     * 
     * @param reactionsAdded An array of the reactions added to a message.
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to run registered _reactions added_ handlers and then continue the event
     * emission process.
     */
    protected async onReactionsAddedActivity(reactionsAdded: MessageReaction[], context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Provides a hook for emitting the _reactions removed_ event,
     * a sub-type of the _message reaction_ event.
     * 
     * @param reactionsRemoved An array of the reactions removed from a message.
     * @param context The context object for the current turn.
     * 
     * @remarks
     * Overwrite this method to run registered _reactions removed_ handlers and then continue the event
     * emission process.
     */
    protected async onReactionsRemovedActivity(reactionsRemoved: MessageReaction[], context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Called to initiate the event emission process.
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

        if (!context) {
            throw new Error(`Missing TurnContext parameter`);
        }

        if (!context.activity) {
            throw new Error(`TurnContext does not include an activity`);
        }

        if (!context.activity.type) {
            throw new Error(`Activity is missing it's type`);
        }

        // List of all Activity Types:
        // https://github.com/Microsoft/botbuilder-js/blob/master/libraries/botframework-schema/src/index.ts#L1627
        await this.onTurnActivity(context);
    }
}
