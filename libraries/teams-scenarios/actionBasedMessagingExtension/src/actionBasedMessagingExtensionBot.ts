// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    Attachment,
    CardFactory,
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    TaskModuleContinueResponse,
    TaskModuleMessageResponse,
    TaskModuleResponseBase,
    TeamsActivityHandler,
    TurnContext
} from 'botbuilder';

/**
 * After installing this bot you can click on the 3 dots to pull up the extension menu. You should be able to click on the search extension
 * and the bot will start. Interact with the cards to execrcise the flows.
 */
export class ActionBasedMessagingExtensionBot extends TeamsActivityHandler {
    /**
     * Initializes a new instance of the `ActionBasedMessagingExtensionBot` class.
     */
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`You said '${context.activity.text}'`);
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
    protected async handleTeamsMessagingExtensionSubmitAction(context, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const data = action.data;
        let body: MessagingExtensionActionResponse;
        if (data && data.done) {
            // The commandContext check doesn't need to be used in this scenario as the manifest specifies the shareMessage command only works in the "message" context.
            const sharedMessage = (action.commandId === 'shareMessage' && action.commandContext === 'message')
                ? `Shared message: <div style="background:#F0F0F0">${JSON.stringify(action.messagePayload)}</div><br/>`
                : '';
            const preview = CardFactory.thumbnailCard('Created Card', `Your input: ${data.userText}`);
            const heroCard = CardFactory.heroCard('Created Card', `${sharedMessage}Your input: <pre>${data.userText}</pre>`);
            body = {
                composeExtension: {
                    attachmentLayout: 'list',
                    attachments: [
                        { ...heroCard, preview }
                    ],
                    type: 'result'
                }
            };
        } else if (action.commandId === 'createWithPreview') {
            // The commandId is definied in the manifest of the Teams Application
            const activityPreview = {
                attachments: [
                    this.taskModuleResponseCard(action)
                ]
            } as Activity;

            body = {
                composeExtension: {
                    activityPreview,
                    type: 'botMessagePreview'
                }
            };
        } else {
            body = {
                task: this.taskModuleResponse(action, false)
            };
        }

        return body;
    }

    /**
     * @protected
     * This method fires when an user uses an Action-based Messaging Extension from the Teams Client.
     * It should send back the tab or task module for the user to interact with.
     */
    protected async handleTeamsMessagingExtensionFetchTask(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        return {
            task: this.taskModuleResponse(action, false)
        };
    }

    /**
     * @protected
     */
    protected async handleTeamsMessagingExtensionBotMessagePreviewSend(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        let body: MessagingExtensionActionResponse;
        const card = this.getCardFromPreviewMessage(action);
        if (!card) {
            body = {
                task: {
                    type: 'message',
                    value: 'Missing user edit card. Something wrong on Teams client.'
                } as TaskModuleMessageResponse
            };
        } else {
            body = undefined;
            await context.sendActivity({ attachments: [card] });
        }

        return body;
    }

    /**
     * @protected
     */
    protected async handleTeamsMessagingExtensionBotMessagePreviewEdit(context, value: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const card = this.getCardFromPreviewMessage(value);
        let body: MessagingExtensionActionResponse;
        if (!card) {
            body = {
                task: {
                    type: 'message',
                    value: 'Missing user edit card. Something wrong on Teams client.'
                } as TaskModuleMessageResponse
            };
        } else {
            body = {
                task: {
                    type: 'continue',
                    value: { card }
                } as TaskModuleContinueResponse
            };
        }

        return body;
    }

    /**
     * @private
     */
    private getCardFromPreviewMessage(query: MessagingExtensionAction): Attachment {
        const userEditActivities = query.botActivityPreview;
        return userEditActivities
            && userEditActivities[0]
            && userEditActivities[0].attachments
            && userEditActivities[0].attachments[0];
    }

    /**
     * @private
     */
    private taskModuleResponse(query: any, done: boolean): TaskModuleResponseBase {
        if (done) {
            return {
                type: 'message',
                value: 'Thanks for your inputs!'
            } as TaskModuleMessageResponse;
        } else {
            return {
                type: 'continue',
                value: {
                    card: this.taskModuleResponseCard(query, (query.data && query.data.userText) || undefined),
                    title: 'More Page'
                }
            } as TaskModuleContinueResponse;
        }
    }

    /**
     * @private
     */
    private taskModuleResponseCard(data: any, textValue?: string) {
        return CardFactory.adaptiveCard({
            actions: [
                {
                    data: {
                        done: false
                    },
                    title: 'Next',
                    type: 'Action.Submit'
                },
                {
                    data: {
                        done: true
                    },
                    title: 'Submit',
                    type: 'Action.Submit'
                }
            ],
            body: [
                {
                    size: 'large',
                    text: `Your request:`,
                    type: 'TextBlock',
                    weight: 'bolder'
                },
                {
                    items: [
                        {
                            text: JSON.stringify(data),
                            type: 'TextBlock',
                            wrap: true
                        }
                    ],
                    style: 'emphasis',
                    type: 'Container'
                },
                {
                    id: 'userText',
                    placeholder: 'Type text here...',
                    type: 'Input.Text',
                    value: textValue
                }
            ],
            type: 'AdaptiveCard',
            version: '1.0.0'
        });
    }
}
