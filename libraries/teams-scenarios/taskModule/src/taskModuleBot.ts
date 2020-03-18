// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    TeamsActivityHandler,
} from 'botbuilder';
import {
    Attachment,
    CardFactory,
    MessageFactory,
    TaskModuleContinueResponse,
    TaskModuleMessageResponse,
    TaskModuleRequest,
    TaskModuleResponse,
    TaskModuleTaskInfo,
    TurnContext,
} from 'botbuilder-core';

export class TaskModuleBot  extends TeamsActivityHandler {
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const card = this.getTaskModuleHeroCard();
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
    }

    protected async handleTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        var reply = MessageFactory.text("handleTeamsTaskModuleFetchAsync TaskModuleRequest" + JSON.stringify(taskModuleRequest));
        await context.sendActivity(reply);

        return {
            task: { 
                type: "continue", 
                value: {
                    card: this.getTaskModuleAdaptiveCard(),
                    height: 200,
                    width: 400,
                    title: "Adaptive Card: Inputs",
                } as TaskModuleTaskInfo, 
            } as TaskModuleContinueResponse
        } as TaskModuleResponse;
    }
    
    protected async handleTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        var reply = MessageFactory.text("handleTeamsTaskModuleFetchAsync Value: " + JSON.stringify(taskModuleRequest));
        await context.sendActivity(reply);

        return {
            task: { 
                type: "message", 
                value: "Hello", 
            } as TaskModuleMessageResponse
        } as TaskModuleResponse;
    }

    private getTaskModuleHeroCard() : Attachment {
        return CardFactory.heroCard("Task Module Invocation from Hero Card", 
            "This is a hero card with a Task Module Action button.  Click the button to show an Adaptive Card within a Task Module.",
            null, // No images
            [{type: "invoke", title:"Adaptive Card", value: {type:"task/fetch", data:"adaptivecard"} }]
            );
    }

    private getTaskModuleAdaptiveCard(): Attachment {
        return CardFactory.adaptiveCard({
            version: '1.0.0',
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'TextBlock',
                    text: `Enter Text Here`,
                },
                {
                    type: 'Input.Text',
                    id: 'usertext',
                    placeholder: 'add some text and submit',
                    IsMultiline: true,
                }
            ],
            actions: [
                {
                    type: 'Action.Submit',
                    title: 'Submit',
                }
            ]
        });
    }

}
