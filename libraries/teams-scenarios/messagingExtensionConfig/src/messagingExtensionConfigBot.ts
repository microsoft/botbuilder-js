// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    MessagingExtensionActionResponse,
    MessagingExtensionResult,
    MessagingExtensionSuggestedAction,
    MessagingExtensionQuery,
    TeamsActivityHandler,
    TurnContext,
} from 'botbuilder';

import {
    ActionTypes,
} from 'botframework-schema'

/**
 * After uploading the manifest you can click the dots in the extension menu at the bottom, or search for the
 * exntesion in the command bar. From the extension window or the command bar you can click on the 3 dots on the specific extension to trigger
 * the OnMessageActivityAsync function. If you click on the "Settings" tab you will fire the OnTeamsMessagingExtensionConfigurationSettingAsync
 * function.
 */
export class MessagingExtensionConfigBot  extends TeamsActivityHandler {
    /**
     * Initializes a new instance of the `MessagingExtensionConfigBot` class.
     */
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`echo: '${context.activity.text}'`);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    /**
     * @protected
     */
    protected async handleTeamsMessagingExtensionConfigurationQuerySettingUrl(context: TurnContext, query: MessagingExtensionQuery){
        return <MessagingExtensionActionResponse>
        {
            composeExtension: <MessagingExtensionResult> {
                type: 'config',
                suggestedActions: <MessagingExtensionSuggestedAction> {
                    actions: [
                        {
                            type: ActionTypes.OpenUrl,
                            value: 'https://teamssettingspagescenario.azurewebsites.net',
                        },
                    ]
                    }
            }
        }
    }

    /**
     * @protected
     */
    protected async handleTeamsMessagingExtensionConfigurationSetting(context: TurnContext, settings){
        // This event is fired when the settings page is submitted
        await context.sendActivity(`onTeamsMessagingExtensionSettings event fired with ${ JSON.stringify(settings) }`);
    }
}
