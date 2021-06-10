// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotFrameworkAuthentication, ClaimsIdentity, SkillValidation } from 'botframework-connector';

import {
    ActivityEx,
    CloudAdapter,
    ConversationState,
    InputHints,
    MessageFactory,
    TurnContext,
    UserState,
    useBotState,
} from 'botbuilder';

export class CoreBotAdapter extends CloudAdapter {
    constructor(
        botFrameworkAuthentication: BotFrameworkAuthentication,
        private readonly conversationState: ConversationState,
        userState: UserState
    ) {
        super(botFrameworkAuthentication);

        useBotState(this, userState, conversationState);

        this.onTurnError = async (context, err) => {
            console.error('[onTurnError] unhandled error', err);

            await this.sendErrorMessage(context, err).catch(() => null);
            await this.sendEoCToParentIfSkill(context, err).catch(() => null);
            await this.clearConversationState(context).catch(() => null);

            throw err; // re-throw to delegate error handling to integration libraries
        };
    }

    private async sendErrorMessage(context: TurnContext, error: Error): Promise<void> {
        try {
            let errorMessageText = 'The bot encountered an error or bug';
            let errorMessage = MessageFactory.text(errorMessageText, errorMessageText, InputHints.IgnoringInput);
            await context.sendActivity(errorMessage);

            errorMessageText = 'To continue to run this bot, please fix the bot source code.';
            errorMessage = MessageFactory.text(errorMessageText, errorMessageText, InputHints.ExpectingInput);
            await context.sendActivity(errorMessage);

            await context.sendTraceActivity(
                'OnTurnError Trace',
                error,
                'https://www.botframework.com/schemas/error',
                'TurnError'
            );
        } catch (err) {
            console.error('[sendErrorMessage]:', err);
        }
    }

    private async sendEoCToParentIfSkill(context: TurnContext, error: Error): Promise<void> {
        if (!this.isSkillBot(context)) {
            return;
        }

        try {
            const endOfConversation = ActivityEx.createEndOfConversationActivity();
            endOfConversation.code = 'SkillError';
            endOfConversation.text = error.message;
            await context.sendActivity(endOfConversation);
        } catch (err) {
            console.error('[sendEoCToParentIfSkill]:', err);
        }
    }

    private async clearConversationState(context: TurnContext): Promise<void> {
        try {
            await this.conversationState.delete(context);
        } catch (err) {
            console.error('[clearConversationState]:', err);
        }
    }

    private isSkillBot(context: TurnContext): boolean {
        const claimsIdentity = context.turnState.get<ClaimsIdentity>(context.adapter.BotIdentityKey);
        return SkillValidation.isSkillClaim(claimsIdentity?.claims ?? []);
    }
}
