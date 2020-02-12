/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BotFrameworkAdapter } from '../botFrameworkAdapter';
import {
    Activity,
    ActivityTypes,
    BotCallbackHandlerKey,
    CardFactory,
    ConversationReference,
    OAuthCard,
    OAuthLoginTimeoutMsValue,
    TokenResponse,
    TokenPollingSettings,
    TokenPollingSettingsKey,
    TurnContext,
} from 'botbuilder-core';

/**
 * Looks for OAuthCards in Activity attachments and takes action on them
 */
export class TokenResolver {
    private static readonly PollingIntervalMs: number = 1000;

    public static checkForOAuthCards(adapter: BotFrameworkAdapter, context: TurnContext, activity: Activity, log?: string[]) {
        if (!activity || !activity.attachments) {
            return;
        }

        for (const attachment of activity.attachments) {
            if (attachment.contentType == CardFactory.contentTypes.oauthCard) {
                const oauthCard = <OAuthCard>attachment.content;
                if (!oauthCard.connectionName) {
                    throw new Error(`The OAuthPrompt's ConnectionName property is missing a value.`);
                }

                let pollingTimeoutMs = context.turnState.get(TokenPollingSettingsKey);

                if (!pollingTimeoutMs) {
                    pollingTimeoutMs = OAuthLoginTimeoutMsValue;
                }

                let pollingTimeout: Date = new Date();
                pollingTimeout.setMilliseconds(pollingTimeout.getMilliseconds() + pollingTimeoutMs);

                setTimeout(() => this.pollForToken(adapter, context, activity, oauthCard.connectionName, pollingTimeout, log), TokenResolver.PollingIntervalMs);
            }
        }
    }

    private static pollForToken(adapter: BotFrameworkAdapter, context: TurnContext, activity: Activity, connectionName: string, pollingTimeout: Date, log?: string[]) {
        if (pollingTimeout > new Date()) {
            const tokenApiClientCredentials = context.turnState.get(adapter.TokenApiClientCredentialsKey);
            adapter.getUserToken(context, connectionName, tokenApiClientCredentials).then((tokenResponse: TokenResponse) => {
                let pollingIntervalMs = TokenResolver.PollingIntervalMs;
                if (tokenResponse) {
                    if (tokenResponse.token) {
                        const logic = context.turnState.get(BotCallbackHandlerKey);
                        const eventActivity = <Activity>TokenResolver.createTokenResponseActivity(TurnContext.getConversationReference(activity), tokenResponse.token, connectionName);
                        // received a token, send it to the bot and end polling
                        adapter.processActivityDirect(eventActivity, logic).then(() => {
                        }).catch(reason => {
                            adapter.onTurnError(context, new Error(reason)).then(() => { });
                        });
                        if (log)
                            log.push('Returned token');
                        return;
                    } else if (tokenResponse.properties && tokenResponse.properties[TokenPollingSettingsKey]) {
                        const pollingSettings = <TokenPollingSettings>tokenResponse.properties[TokenPollingSettingsKey];
                        if (pollingSettings.timeout <= 0) {
                            // end polling
                            if (log)
                                log.push('End polling');
                            return;
                        }
                        if (pollingSettings.interval > 0) {
                            // reset the polling interval
                            if (log)
                                log.push(`Changing polling interval to ${pollingSettings.interval}`);
                            pollingIntervalMs = pollingSettings.interval;
                        }
                    }
                }
                if (log)
                    log.push('Polling again');
                setTimeout(() => this.pollForToken(adapter, context, activity, connectionName, pollingTimeout), pollingIntervalMs);
            });
        }
    }

    private static createTokenResponseActivity(relatesTo: Partial<ConversationReference>, token: string, connectionName: string): Partial<Activity> {
        let tokenResponse: Partial<Activity> = {
            id: this.generate_guid(),
            timestamp: new Date(),
            type: ActivityTypes.Event,
            serviceUrl: relatesTo.serviceUrl,
            from: relatesTo.user,
            recipient: relatesTo.bot,
            replyToId: relatesTo.activityId,
            channelId: relatesTo.channelId,
            conversation: relatesTo.conversation,
            name: 'tokens/response',
            relatesTo: <ConversationReference>relatesTo,
            value: {
                token: token,
                connectionName: connectionName
            }
        };
        return tokenResponse;
    }

    private static generate_guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
}
