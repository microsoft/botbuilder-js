/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from 'botbuilder-dialogs';
import { InputDialog, InputState } from './inputDialog';
import { StringExpression } from 'adaptive-expressions';

/**
 * Declarative text input to gather text data from users.
 */
export class TextInput extends InputDialog {

    public outputFormat: StringExpression;

    /**
     * @protected
     */
    protected onComputeId(): string {
        return `TextInput[${ this.prompt && this.prompt.toString() }]`;
    }

    /**
     * @protected
     * Called when input has been received.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @returns InputState which reflects whether input was recognized as valid or not.
     */
    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Treat input as a string
        let input: string = dc.state.getValue(InputDialog.VALUE_PROPERTY).toString();

        if (this.outputFormat) {
            const value = this.outputFormat.getValue(dc.state);
            input = value.toString();
        }

        // Save formated value and ensure length > 0
        dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
        return input.length > 0 ? InputState.valid : InputState.unrecognized;
    }
}
