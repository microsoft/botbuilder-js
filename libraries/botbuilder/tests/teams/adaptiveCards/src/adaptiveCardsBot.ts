// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    ActionTypes,
    Attachment,
    CardFactory,
    InvokeResponse,
    MessageFactory,
    TaskModuleRequest,
    TaskModuleResponseBase,
    TaskModuleMessageResponse,
    TaskModuleTaskInfo,
    TeamsActivityHandler,
    TurnContext
} from 'botbuilder';

//
// You can @mention the bot the text "1", "2", or "3". "1" will send back adaptive cards. "2" will send back a 
// task module that contains an adpative card. "3" will return an adpative card that contains BF card actions.
//
export class AdaptiveCardsBot  extends TeamsActivityHandler {
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            TurnContext.removeRecipientMention(context.activity);
            let text = context.activity.text;
            if (text && text.length > 0) {
                text = text.trim();
                if (text == '1')
                {
                    await this.sendAdaptiveCard1(context);
                }
                else if (text == '2')
                {
                    await this.sendAdaptiveCard2(context);
                }
                else if (text == '3')
                {
                    await this.sendAdaptiveCard3(context);
                }
                else
                {
                    await context.sendActivity(`You said: ${text}`);
                }
            }
            else {
                await context.sendActivity('App sent a message with empty text');
                const activityValue = context.activity.value;
                if (activityValue) {
                    await context.sendActivity(`but with value ${JSON.stringify(activityValue)}`);
                }
            }
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

    protected async onTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleTaskInfo> {
        await context.sendActivity(MessageFactory.text(`OnTeamsTaskModuleFetchAsync TaskModuleRequest: ${JSON.stringify(taskModuleRequest)}`));

        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
                {
                   "type": "TextBlock",
                   "text": "This is an Adaptive Card within a Task Module"
                }
            ],
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": "Action.Submit",
                    "data": {
                        "submitLocation": "taskModule"
                    }
                }
            ]
        });

        return <TaskModuleTaskInfo> {
            card: card,
            height: 200,
            width: 400,
            title: 'Task Module Example'
        };
    }

    protected async onTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponseBase> {
        await context.sendActivity(MessageFactory.text(`OnTeamsTaskModuleSubmit value: ${ JSON.stringify(taskModuleRequest) }`));
        return <TaskModuleMessageResponse>{ type: 'message', value: 'Thanks!' };
    }

    protected async onTeamsCardActionInvoke(context: TurnContext): Promise<InvokeResponse> {
        await context.sendActivity(MessageFactory.text(`OnTeamsCardActionInvoke value: ${JSON.stringify(context.activity.value)}`));
        return <InvokeResponse>{ status: 200 };
    }

    private async sendAdaptiveCard1(context: TurnContext): Promise<void> {
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
                {
                    "type": "TextBlock",
                    "text": "Bot Builder actions"
                }
            ],
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": "imBack",
                    "data": {
                        "msteams": {
                        "type": "imBack",
                        "value": "text"
                        }
                    }
                },
                {
                    "type": "Action.Submit",
                    "title": "message back",
                    "data": {
                        "msteams": {
                            "type": "messageBack",
                            "value": { "key": "value" }
                        }
                    }
                },
                {
                    "type": "Action.Submit",
                    "title": "message back local echo",
                    "data": {
                        "msteams": {
                            "type": "messageBack",
                            "text": "text received by bots",
                            "displayText": "display text message back",
                            "value": { "key": "value" }
                        }
                    },
                },
                {
                    "type": "Action.Submit",
                    "title": "invoke",
                    "data": {
                        "msteams": {
                            "type": "invoke",
                            "value": { "key": "value" }
                        }
                    }
                }
            ]
        });

        await context.sendActivity(MessageFactory.attachment(card));
    }

    private async sendAdaptiveCard2(context: TurnContext): Promise<void> {
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
                {
                    "type": "TextBlock",
                    "text": "Task Module Adaptive Card"
                }
            ],
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": "Launch Task Module",
                    "data": {
                        "msteams": {
                            "type": "invoke",
                            "value": {
                                "hiddenKey": "hidden value from task module launcher",
                                "type": "task/fetch"
                            }
                        }
                    }
                }
            ]
        });

        await context.sendActivity(MessageFactory.attachment(card));
    }

    private async sendAdaptiveCard3(context: TurnContext): Promise<void> {
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
                {
                    "type": "TextBlock",
                    "text": "Bot Builder actions"
                },
                {
                    "type": "Input.Text",
                    "id": "x"
                }
            ],
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": "Action.Submit",
                    "data": {
                        "key": "value"
                    }
                }
            ]
        });
        
        await context.sendActivity(MessageFactory.attachment(card));
    }
}
