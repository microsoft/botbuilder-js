// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Attachment,
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    CardFactory,
    TaskModuleTaskInfo,
    TaskModuleContinueResponse,
} from 'botbuilder';

import { SubmitExampleData  } from './submitExampleData';

export class AdaptiveCardHelper {
    public static toSubmitExampleData(action: MessagingExtensionAction): SubmitExampleData {
        const activityPreview = action.botActivityPreview[0];
        const attachmentContent = activityPreview.attachments[0].content;
        
        const userText: string  = attachmentContent.body[1].text;
        var choiceSet = attachmentContent.body[3];

        return <SubmitExampleData>
        {
            Question : userText,
            MultiSelect : choiceSet.isMultiSelect ? "true" : "false",
            Option1 : choiceSet.choices[0].title,
            Option2 : choiceSet.choices[1].title,
            Option3 : choiceSet.choices[2].title,
        };
    }

    public static createTaskModuleAdaptiveCardResponse(userText: string = null, isMultiSelect: boolean = true, 
        option1: string = null, option2: string = null, option3: string = null): MessagingExtensionActionResponse  {
        
        const responseCard = CardFactory.adaptiveCard({
            version : '1.0',
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'TextBlock',
                    text: 'This is an Adaptive Card within a Task Module',
                    weight: 'bolder',
                },
                { type: 'TextBlock', text: 'Enter text for Question:' },
                { type: 'Input.Text', id: 'Question', placeholder: 'Question text here', value: userText },
                { type: 'TextBlock', text: 'Options for Question:' },
                { type: 'TextBlock', text: 'Is Multi-Select:' },
                { type: 'Input.ChoiceSet', id: 'MultiSelect', value: isMultiSelect ? 'true' : 'false', style:'expanded', isMultiSelect: false,
                    choices: [{title: 'True', value: 'true'}, {title: 'False', value: 'false'}] },
                { type: 'Input.Text', id: 'Option1', placeholder: 'Option 1 here', value: option1 },
                { type: 'Input.Text', id: 'Option2', placeholder: 'Option 2 here', value: option2 },
                { type: 'Input.Text', id: 'Option3', placeholder: 'Option 3 here', value: option3 },
            ],
            actions: [
                {
                    type: 'Action.Submit',
                    title: 'Submit',
                    data: { 
                         submitLocation: 'messagingExtensionFetchTask',
                    }
                },
            ]
        }

        );

        return <MessagingExtensionActionResponse> 
                { task: <TaskModuleContinueResponse> { 
                        type: 'continue', 
                        value: <TaskModuleTaskInfo> { 
                            title: 'Task Module Fetch Example',
                            height: 450, 
                            width: 500, 
                            url: null,
                            card: <Attachment> responseCard,
                        }
                    }
                };
    }
    public static toAdaptiveCardAttachment(data: SubmitExampleData) : Attachment {
        return CardFactory.adaptiveCard({
            version: '1.0',
            type: 'AdaptiveCard',
            body: [
                { type: 'TextBlock', text: 'Adaptive Card from Task Module', weight: 'bolder' },
                { type: 'TextBlock', text: `${data.Question}`, id:"Question" },
                { type: 'Input.Text', id: 'Answer', placeholder: 'Answer here...' },
                { type: 'Input.ChoiceSet', id: 'Choices', isMultiSelect: Boolean(data.MultiSelect), style: 'expanded',
                    choices: [{title: data.Option1, value: data.Option1}, 
                            {title: data.Option2, value: data.Option2},
                            {title: data.Option3, value: data.Option3}] },
            ],
            actions: [
                { type: 'Action.Submit', title: 'Submit', data: { submitLocation: 'messagingExtensionSubmit'} },
            ]
        });
    }
}