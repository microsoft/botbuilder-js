// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotFrameworkAuthentication } from 'botframework-connector';
import { CloudAdapter, ConversationState, UserState, useBotState } from 'botbuilder';

/**
 * An adapter that implements the Core Bot and can be hosted in different cloud environments both public and private.
 */
export class CoreBotAdapter extends CloudAdapter {
    /**
     * @param botFrameworkAuthentication BotFrameworkAuthentication](xref:botframework-connector.BotFrameworkAuthentication) instance.
     * @param conversationState State management object for conversation state.
     * @param userState Stored user state.
     */
    constructor(
        botFrameworkAuthentication: BotFrameworkAuthentication,
        private readonly conversationState: ConversationState,
        userState: UserState
    ) {
        super(botFrameworkAuthentication);

        useBotState(this, userState, conversationState);

        this.onTurnError = async (context, err) => {
            console.error('[onTurnError] unhandled error', err);

            // Send the exception message to the user. Since the default behavior does not
            // send logs or trace activities, the bot appears hanging without any activity
            // to the user.
            await context.sendActivity(err instanceof Error ? err.message : err).catch(() => null);

            // Delete the conversationState for the current conversation to prevent the
            // bot from getting stuck in a error-loop caused by being in a bad state.
            await this.conversationState.delete(context);

            throw err; // re-throw to delegate error handling to integration libraries
        };
    }
}
