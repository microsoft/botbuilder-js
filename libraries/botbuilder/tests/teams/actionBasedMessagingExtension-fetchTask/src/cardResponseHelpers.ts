// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    Attachment,
    InputHints,
    MessagingExtensionActionResponse,
    MessagingExtensionAttachment,
    MessagingExtensionResult,
    MessageFactory,
    TaskModuleTaskInfo,
    TaskModuleContinueResponse,
} from 'botbuilder';

export class CardResponseHelpers {
    public static toTaskModuleResponse(cardAttachment: Attachment): MessagingExtensionActionResponse  {
        return <MessagingExtensionActionResponse> {
            task: <TaskModuleContinueResponse> {
                value: <TaskModuleTaskInfo> {
                    card: <Attachment> cardAttachment
                },
                height: 450, 
                width: 500, 
                title: 'Task Module Fetch Example'
            }
        }
    }

    public static toComposeExtensionResultResponse(cardAttachment: Attachment) : MessagingExtensionActionResponse {
        
        return <MessagingExtensionActionResponse> {
            composeExtension: <MessagingExtensionResult> {
                type: 'result',
                attachmentLayout: 'list',
                attachments: [ <MessagingExtensionAttachment> cardAttachment ]

            }
        }
    }

    public static toMessagingExtensionBotMessagePreviewResponse(cardAttachment: Attachment) : MessagingExtensionActionResponse {
        return <MessagingExtensionActionResponse> {
            composeExtension: <MessagingExtensionResult> {
                type: 'botMessagePreview',
                activityPreview: MessageFactory.attachment(cardAttachment, null, null, InputHints.ExpectingInput) as Activity,
            }
        }
    }
}
