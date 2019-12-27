/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Attachment } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { InputDialogConfiguration, InputDialog, InputState } from './inputDialog';

export interface AttachmentInputConfiguration extends InputDialogConfiguration {
    outputFormat?: AttachmentOutputFormat;
}

export enum AttachmentOutputFormat {
    All = 'All',
    First = 'First'
}

export class AttachmentInput extends InputDialog {

    public static declarativeType = 'Microsoft.AttachmentInput';

    public outputFormat = AttachmentOutputFormat.First;

    public configure(config: AttachmentInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `AttachmentInput[${ this.prompt.value.toString() }]`;
    }

    protected getDefaultInput(dc: DialogContext): any {
        const attachments = dc.context.activity.attachments;
        return Array.isArray(attachments) && attachments.length > 0 ? attachments : undefined;
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input and filter out non-attachments
        let input: Attachment | Attachment[] = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        const attachments = Array.isArray(input) ? input : [input];
        const first = attachments.length > 0 ? attachments[0] : undefined;
        if (typeof first != 'object' || (!first.contentUrl && !first.content)) {
            return InputState.unrecognized;
        }

        // Format output and return success
        switch (this.outputFormat) {
            case AttachmentOutputFormat.All:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, attachments);
                break;
            case AttachmentOutputFormat.First:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, first);
                break;
        }

        return InputState.valid;
    }
}