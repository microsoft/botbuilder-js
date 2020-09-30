/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Attachment } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { InputDialog, InputState } from './inputDialog';
import { EnumExpression } from 'adaptive-expressions';

export enum AttachmentOutputFormat {
    all = 'all',
    first = 'first'
}

/**
 * Input dialog which prompts the user to send a file.
 */
export class AttachmentInput extends InputDialog {

    public outputFormat: EnumExpression<AttachmentOutputFormat> = new EnumExpression<AttachmentOutputFormat>(AttachmentOutputFormat.first);

    /**
     * @protected
     */
    protected onComputeId(): string {
        return `AttachmentInput[${ this.prompt && this.prompt.toString() }]`;
    }

    /**
     * @protected
     */
    protected getDefaultInput(dc: DialogContext): any {
        const attachments = dc.context.activity.attachments;
        return Array.isArray(attachments) && attachments.length > 0 ? attachments : undefined;
    }

    /**
     * @protected
     * Called when input has been received.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @returns InputState which reflects whether input was recognized as valid or not.
     */
    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input and filter out non-attachments
        let input: Attachment | Attachment[] = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        const attachments = Array.isArray(input) ? input : [input];
        const first = attachments.length > 0 ? attachments[0] : undefined;
        if (typeof first != 'object' || (!first.contentUrl && !first.content)) {
            return InputState.unrecognized;
        }

        // Format output and return success
        switch (this.outputFormat.getValue(dc.state)) {
            case AttachmentOutputFormat.all:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, attachments);
                break;
            case AttachmentOutputFormat.first:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, first);
                break;
        }

        return InputState.valid;
    }
}
