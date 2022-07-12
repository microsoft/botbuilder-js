/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Attachment } from 'botbuilder';
import { Converter, ConverterFactory, DialogContext } from 'botbuilder-dialogs';
import { EnumExpression, EnumExpressionConverter } from 'adaptive-expressions';
import { EnumProperty } from '../properties';
import { InputDialog, InputDialogConfiguration, InputState } from './inputDialog';

export enum AttachmentOutputFormat {
    all = 'all',
    first = 'first',
}

export interface AttachmentInputConfiguration extends InputDialogConfiguration {
    outputFormat?: EnumProperty<AttachmentOutputFormat>;
}

/**
 * Input dialog which prompts the user to send a file.
 */
export class AttachmentInput extends InputDialog implements AttachmentInputConfiguration {
    static $kind = 'Microsoft.AttachmentInput';
    outputFormat: EnumExpression<AttachmentOutputFormat> = new EnumExpression<AttachmentOutputFormat>(
        AttachmentOutputFormat.first
    );

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof AttachmentInputConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'outputFormat':
                return new EnumExpressionConverter<AttachmentOutputFormat>(AttachmentOutputFormat);
            default:
                return super.getConverter(property);
        }
    }

    protected onComputeId(): string {
        return `AttachmentInput[${this.prompt && this.prompt.toString()}]`;
    }

    /**
     * @protected
     * Called when input has been received.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns [InputState](xref:botbuilder-dialogs-adaptive.InputState) which reflects whether input was recognized as valid or not.
     */
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
