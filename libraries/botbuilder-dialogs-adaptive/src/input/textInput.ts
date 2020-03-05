/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from 'botbuilder-dialogs';
import { ExpressionEngine, Expression } from 'adaptive-expressions';
import { InputDialogConfiguration, InputDialog, InputState } from './inputDialog';

export interface TextInputConfiguration extends InputDialogConfiguration {
    outputFormat?: string;
}

export class TextInput extends InputDialog {

    public static declarativeType = 'Microsoft.TextInput';

    private _outputFormatExpression: Expression;

    public get outputFormat(): string {
        return this._outputFormatExpression ? this._outputFormatExpression.toString() : undefined;
    }

    public set outputFormat(value: string) {
        this._outputFormatExpression = value ? new ExpressionEngine().parse(value) : undefined;
    }

    public configure(config: TextInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `TextInput[${ this.prompt.toString() }]`;
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Treat input as a string
        let input: string = dc.state.getValue(InputDialog.VALUE_PROPERTY).toString();

        if (this._outputFormatExpression) {
            const { value, error } = this._outputFormatExpression.tryEvaluate(dc.state);
            if (!error) {
                input = value.toString();
            } else {
                throw new Error(`OutputFormat expression evaluation resulted in an error. Expression: ${ this._outputFormatExpression.toString() }. Error: ${ error }`);
            }
        }

        // Save formated value and ensure length > 0
        dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
        return input.length > 0 ? InputState.valid : InputState.unrecognized;
    }
}