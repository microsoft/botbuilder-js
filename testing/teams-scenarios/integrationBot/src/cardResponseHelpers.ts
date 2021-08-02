// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    Attachment,
    InputHints,
    MessageFactory,
    MessagingExtensionActionResponse,
    MessagingExtensionAttachment,
    MessagingExtensionResult,
    TaskModuleContinueResponse,
    TaskModuleTaskInfo
} from 'botbuilder';

/**
 * Helper for an [Attachment](xref:botframework-schema.Attachment) as CardResponse.
 */
export class CardResponseHelpers {
    /**
     * Assigns an [Attachment](xref:botframework-schema.Attachment) to a new [MessagingExtensionActionResponse](xref:botframework-schema.MessagingExtensionActionResponse) object as a task.
     * @param cardAttachment [Attachment](xref:botframework-schema.Attachment) to be assigned.
     * @returns A [MessagingExtensionActionResponse](xref:botframework-schema.MessagingExtensionActionResponse) object.
     */
    public static toTaskModuleResponse(cardAttachment: Attachment): MessagingExtensionActionResponse {
        return {
            task: {
                height: 450,
                title: 'Task Module Fetch Example',
                    value: {
                        card: cardAttachment
                    } as TaskModuleTaskInfo,
                width: 500
            } as TaskModuleContinueResponse
        } as MessagingExtensionActionResponse;
    }

    /**
     * Assigns an [Attachment](xref:botframework-schema.Attachment) to a new [MessagingExtensionActionResponse](xref:botframework-schema.MessagingExtensionActionResponse) object as a compose extension.
     * @param cardAttachment [Attachment](xref:botframework-schema.Attachment) to be assigned.
     * @returns A [MessagingExtensionActionResponse](xref:botframework-schema.MessagingExtensionActionResponse) object.
     */
    public static toComposeExtensionResultResponse(cardAttachment: Attachment): MessagingExtensionActionResponse {
        return {
            composeExtension: {
                attachmentLayout: 'list',
                attachments: [cardAttachment as MessagingExtensionAttachment],
                type: 'result'

            } as MessagingExtensionResult
        } as MessagingExtensionActionResponse;
    }

    /**
     * Assigns an [Attachment](xref:botframework-schema.Attachment) to a new [MessagingExtensionActionResponse](xref:botframework-schema.MessagingExtensionActionResponse) object
     * as a compose extension with type of botMessagePreview.
     * @param cardAttachment [Attachment](xref:botframework-schema.Attachment) to be assigned.
     * @returns A [MessagingExtensionActionResponse](xref:botframework-schema.MessagingExtensionActionResponse) object.
     */
    public static toMessagingExtensionBotMessagePreviewResponse(cardAttachment: Attachment): MessagingExtensionActionResponse {
        return {
            composeExtension: {
                activityPreview: MessageFactory.attachment(cardAttachment, null, null, InputHints.ExpectingInput) as Activity,
                type: 'botMessagePreview'
            } as MessagingExtensionResult
        } as MessagingExtensionActionResponse;
    }
}
