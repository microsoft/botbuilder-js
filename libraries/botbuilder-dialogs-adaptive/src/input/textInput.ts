/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringExpression, StringExpressionConverter } from 'adaptive-expressions';
import { Converters, DialogContext, Properties } from 'botbuilder-dialogs';
import { InputDialog, InputState } from './inputDialog';

export class TextInput extends InputDialog {
    public static $kind = 'Microsoft.TextInput';

    public outputFormat: StringExpression;

    public get converters(): Converters<Properties<TextInput>> {
        return Object.assign({}, super.converters, {
            outputFormat: new StringExpressionConverter(),
        });
    }

    protected onComputeId(): string {
        return `TextInput[${this.prompt && this.prompt.toString()}]`;
    }

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
