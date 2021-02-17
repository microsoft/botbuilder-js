// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotFrameworkAdapter, ConversationState, useBotState, UserState } from 'botbuilder';
import { AuthenticationConfiguration } from 'botframework-connector';

export class CoreBotAdapter extends BotFrameworkAdapter {
    constructor(authConfig: AuthenticationConfiguration, conversationState: ConversationState, userState: UserState) {
        super({ authConfig });

        // attach storage?
        useBotState(this, userState, conversationState);

        this.onTurnError = async (turnContext, err) => {
            console.error(err);

            await turnContext.sendActivity(err.message, err.message);

            try {
                await conversationState.delete(turnContext);
            } catch (err) {
                console.error('Exception caught on attempting to delete conversation state', err);
            }
        };
    }
}
