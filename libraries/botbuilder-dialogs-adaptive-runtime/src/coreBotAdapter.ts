// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ClaimsIdentity, SkillValidation } from 'botframework-connector';

import {
    ActivityEx,
    BotFrameworkAdapter,
    BotFrameworkAdapterSettings,
    ConversationState,
    InputHints,
    MessageFactory,
    TurnContext,
    UserState,
    useBotState,
} from 'botbuilder';

export class CoreBotAdapter extends BotFrameworkAdapter {
    constructor(
        settings: Partial<BotFrameworkAdapterSettings>,
        private readonly conversationState: ConversationState,
        userState: UserState
    ) {
        super(settings);

        useBotState(this, userState, conversationState);

        this.onTurnError = async (turnContext, err) => {
            console.error('[onTurnError] unhandled error', err);

            await this.sendErrorMessage(turnContext, err);
            await this.sendEoCToParentIfSkill(turnContext, err);
            await this.clearConversationState(turnContext);
        };
    }

    private async sendErrorMessage(turnContext: TurnContext, error: Error): Promise<void> {
        try {
            let errorMessageText = 'The bot encountered an error or bug';
            let errorMessage = MessageFactory.text(errorMessageText, errorMessageText, InputHints.IgnoringInput);
            await turnContext.sendActivity(errorMessage);

            errorMessageText = 'To continue to run this bot, please fix the bot source code.';
            errorMessage = MessageFactory.text(errorMessageText, errorMessageText, InputHints.ExpectingInput);
            await turnContext.sendActivity(errorMessage);

            await turnContext.sendTraceActivity(
                'OnTurnError Trace',
                error,
                'https://www.botframework.com/schemas/error',
                'TurnError'
            );
        } catch (err) {
            console.error('Exception caught in sendErrorMessage', err);
        }
    }

    private async sendEoCToParentIfSkill(turnContext: TurnContext, error: Error): Promise<void> {
        if (!this.isSkillBot(turnContext)) {
            return;
        }

        try {
            const endOfConversation = ActivityEx.createEndOfConversationActivity();
            endOfConversation.code = 'SkillError';
            endOfConversation.text = error.message;
            await turnContext.sendActivity(endOfConversation);
        } catch (err) {
            console.error('Exception caught in sendEoCToParentIfSkill', err);
        }
    }

    private async clearConversationState(turnContext: TurnContext): Promise<void> {
        try {
            await this.conversationState.delete(turnContext);
        } catch (err) {
            console.error('Exception caught in clearConversationState', err);
        }
    }

    private isSkillBot(turnContext: TurnContext): boolean {
        const claimsIdentity = turnContext.turnState.get<ClaimsIdentity>(turnContext.adapter.BotIdentityKey);
        return SkillValidation.isSkillClaim(claimsIdentity?.claims ?? []);
    }
}
