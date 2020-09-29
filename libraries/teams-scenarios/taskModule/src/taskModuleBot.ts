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

/**
 * This bot can be installed at any scope. If you @mention the bot you will get the task module. You can interact with the task module to
 * hit the other functions.
 */
export class TaskModuleBot  extends TeamsActivityHandler {
    /**
     * Initializes a new instance of the `TaskModuleBot` class.
     */
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

    /**
     * @protected
     */
    protected async handleTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        var reply = MessageFactory.text("handleTeamsTaskModuleFetch TaskModuleRequest" + JSON.stringify(taskModuleRequest));
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

    /**
     * @protected
     */
    protected async handleTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        var reply = MessageFactory.text("handleTeamsTaskModuleSubmit Value: " + JSON.stringify(taskModuleRequest));
        await context.sendActivity(reply);

        return {
            task: {
                type: "message",
                value: "Hello",
            } as TaskModuleMessageResponse
        } as TaskModuleResponse;
    }

    /**
     * @private
     */
    private getTaskModuleHeroCard() : Attachment {
        return CardFactory.heroCard("Task Module Invocation from Hero Card",
            "This is a hero card with a Task Module Action button.  Click the button to show an Adaptive Card within a Task Module.",
            null, // No images
            [{type: "invoke", title:"Adaptive Card", value: {type:"task/fetch", data:"adaptivecard"} }]
            );
    }

    /**
     * @private
     */
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
