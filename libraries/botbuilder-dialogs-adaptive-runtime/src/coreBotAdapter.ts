// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';
import { BotFrameworkAuthentication, ClaimsIdentity, SkillValidation } from 'botframework-connector';

import {
    ActivityEx,
    CloudAdapter,
    ConversationState,
    InputHints,
    MessageFactory,
    Response,
    TurnContext,
    UserState,
    useBotState,
} from 'botbuilder';

const ErrorT = t.Record({
    message: t.String,
    statusCode: t.Optional(t.Number),
});

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

            const res = context.turnState.get<Response | undefined>(this.ResponseKey);

            if (res) {
                // Try to extract errors wrapped in, for example, DialogContextError
                let anyErr = err as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                if (anyErr.error instanceof Error) {
                    anyErr = anyErr.error;
                }

                if (ErrorT.guard(anyErr)) {
                    res.status(anyErr.statusCode ?? 500);
                    res.send(anyErr.message);
                } else {
                    res.status(500);
                    res.send(anyErr);
                }

                res.end();
            }

            await this.sendErrorMessage(context, err);
            await this.sendEoCToParentIfSkill(context, err);
            await this.clearConversationState(context);
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
            console.error('Exception caught in sendErrorMessage', err);
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
            console.error('Exception caught in sendEoCToParentIfSkill', err);
        }
    }

    private async clearConversationState(context: TurnContext): Promise<void> {
        try {
            await this.conversationState.delete(context);
        } catch (err) {
            console.error('Exception caught in clearConversationState', err);
        }
    }

    private isSkillBot(context: TurnContext): boolean {
        const claimsIdentity = context.turnState.get<ClaimsIdentity>(context.adapter.BotIdentityKey);
        return SkillValidation.isSkillClaim(claimsIdentity?.claims ?? []);
    }
}
