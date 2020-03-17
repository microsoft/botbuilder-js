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
import { EnumExpression } from '../expressionProperties';

export interface AttachmentInputConfiguration extends InputDialogConfiguration {
    outputFormat?: string | AttachmentOutputFormat;
}

export enum AttachmentOutputFormat {
    all = 'all',
    first = 'first'
}

export class AttachmentInput extends InputDialog {

    public static declarativeType = 'Microsoft.AttachmentInput';

    public outputFormat: EnumExpression = new EnumExpression(AttachmentOutputFormat.first);

    public configure(config: AttachmentInputConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'outputFormat':
                        this.outputFormat = new EnumExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    protected onComputeId(): string {
        return `AttachmentInput[${ this.prompt.toString() }]`;
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