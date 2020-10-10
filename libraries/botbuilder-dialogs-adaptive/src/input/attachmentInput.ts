/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Attachment } from 'botbuilder-core';
import { Converters, DialogContext, Properties } from 'botbuilder-dialogs';
import { InputDialog, InputState } from './inputDialog';
import { EnumExpression, EnumExpressionConverter } from 'adaptive-expressions';

export enum AttachmentOutputFormat {
    all = 'all',
    first = 'first',
}

export class AttachmentInput extends InputDialog {
    public static $kind = 'Microsoft.AttachmentInput';

    public outputFormat: EnumExpression<AttachmentOutputFormat> = new EnumExpression<AttachmentOutputFormat>(
        AttachmentOutputFormat.first
    );

    public get converters(): Converters<Properties<AttachmentInput>> {
        return Object.assign({}, super.converters, {
            outputFormat: new EnumExpressionConverter<AttachmentOutputFormat>(AttachmentOutputFormat),
        });
    }

    protected onComputeId(): string {
        return `AttachmentInput[${this.prompt && this.prompt.toString()}]`;
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input and filter out non-attachments
        const input: Attachment | Attachment[] = dc.state.getValue(InputDialog.VALUE_PROPERTY);
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
