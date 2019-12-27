/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'botframework-expressions';
import { InputDialogConfiguration, InputDialog, InputState } from './inputDialog';

export interface TextInputConfiguration extends InputDialogConfiguration {
    outputFormat?: string;
}

export class TextInput extends InputDialog {

    public static declarativeType = 'Microsoft.TextInput';

    public outputFormat: string;

    public configure(config: TextInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `TextInput[${ this.prompt.value.toString() }]`;
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Treat input as a string
        let input: string = dc.state.getValue(InputDialog.VALUE_PROPERTY).toString();

        if (this.outputFormat) {
            const outputExpression = new ExpressionEngine().parse(this.outputFormat);
            const { value, error } = outputExpression.tryEvaluate(dc.state);
            if (!error) {
                input = value.toString();
            } else {
                throw new Error(`OutputFormat expression evaluation resulted in an error. Expression: ${ outputExpression.toString() }. Error: ${ error }`);
            }
        }

        // Save formated value and ensure length > 0
        dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
        return input.length > 0 ? InputState.valid : InputState.unrecognized;
    }
}