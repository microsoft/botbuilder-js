/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityTypes, TurnContext } from '.';

/**
 * Activity handling base class bots.
 * 
 * @remarks
 * This provides an inheritble base class for processing incoming events.
 * `onActivity()` contains dispatching logic based on the `Activity.type`.
 * Developers should implement the `on*Activity()` methods with processing
 * logic for each `Activity.type` their bot supports.
 */
export class ActivityHandlerBase {
    /**
     * Overwrite this method to use different dispatching logic than by Activity type.
     * @remarks
     * The default logic is below:
     * ```ts
     *      switch (context.activity.type) {
     *          case ActivityTypes.Message:
     *              await this.onMessageActivity(context);
     *              break;
     *          case ActivityTypes.ConversationUpdate:
     *              await this.onConversationUpdateActivity(context);
     *              break;
     *          case ActivityTypes.MessageReaction:
     *              await this.onMessageReactionActivity(context);
     *              break;
     *          case ActivityTypes.Event:
     *              await this.onEventActivity(context);
     *              break;
     *          default:
     *              // handler for unknown or unhandled types
     *              await this.onUnrecognizedActivity(context);
     *              break;
     *      }
     * ```
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onActivity(context: TurnContext): Promise<void> {
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
     * Used to process incoming "Message" Activities. Implement this method to process Message activities.
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onMessageActivity(context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Used to process incoming "ConversationUpdate" Activities. Implement this method to process ConversationUpdate activities.
     * ConversationUpdate Activties
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onConversationUpdateActivity(context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Used to process incoming "MessageReaction" Activities. Implement this method to process MessageReaction activities.
     * @remarks
     * MessageReaction Activities can be further broken into subtypes, e.g. ReactionsAdded, ReactionsRemoved. 
     * These two example subtypes can be determined by inspecting the incoming Activity for the property `reactionsAdded`
     * and `reactionsRemoved`.
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onMessageReactionActivity(context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Used to process incoming "Event" Activities. Implement this method to process Event activities.
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onEventActivity(context: TurnContext): Promise<void> {
        return;
    }

    /**
     * Used to process incoming Activities with unrecognized types. Implement this method to process these activities.
     * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
     */
    protected async onUnrecognizedActivity(context: TurnContext): Promise<void> {
        return;
    }


    /**
     * `run()` is the main "activity handler" function used to ingest activities for processing by Activity Type.
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

        // List of all Activity Types:
        // https://github.com/Microsoft/botbuilder-js/blob/master/libraries/botframework-schema/src/index.ts#L1627
        await this.onActivity(context);
    }
}
