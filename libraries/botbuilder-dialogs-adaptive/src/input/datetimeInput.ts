/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Recognizers from '@microsoft/recognizers-text-date-time';
import { DialogContext } from 'botbuilder-dialogs';
import { ExpressionEngine, Expression } from 'adaptive-expressions';
import { InputDialogConfiguration, InputDialog, InputState } from './inputDialog';


export interface DatetimeInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: string;
    outputFormat?: string;
}

export class DateTimeInput extends InputDialog {

    public static declarativeType = 'Microsoft.DateTimeInput';

    private _outputFormatExpression: Expression;

    public defaultLocale: string;

    public get outputFormat(): string {
        return this._outputFormatExpression ? this._outputFormatExpression.toString() : undefined;
    }

    public set outputFormat(value: string) {
        this._outputFormatExpression = value ? new ExpressionEngine().parse(value) : undefined;
    }

    public configure(config: DatetimeInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `DateTimeInput[${ this.prompt.toString() }]`;
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input and filter out non-attachments
        const input: object = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        const locale: string = dc.context.activity.locale || this.defaultLocale || 'en-us';
        const results: any[] = Recognizers.recognizeDateTime(input.toString(), locale);

        if (results.length > 0 && results[0].resolution) {
            const values = results[0].resolution.values;
            dc.state.setValue(InputDialog.VALUE_PROPERTY, values);
            if (this._outputFormatExpression) {
                const { value, error } = this._outputFormatExpression.tryEvaluate(dc.state);
                if (!error) {
                    dc.state.setValue(InputDialog.VALUE_PROPERTY, value);
                } else {
                    throw new Error(`OutputFormat expression evaluation resulted in an error. Expression: ${ this._outputFormatExpression.toString() }. Error: ${ error }`);
                }
            }
        } else {
            return InputState.unrecognized;
        }
        return InputState.valid;
    }

}