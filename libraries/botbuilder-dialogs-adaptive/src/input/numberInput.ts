/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Recognizers from '@microsoft/recognizers-text-number';
import { Activity } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { ExpressionEngine, Expression } from 'adaptive-expressions';
import { InputDialogConfiguration, InputDialog, InputState } from './inputDialog';

export interface NumberInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: string;
    outputFormat?: string;
}

export class NumberInput extends InputDialog {

    public static declarativeType = 'Microsoft.NumberInput';

    private _outputFormatExpression: Expression;

    public defaultLocale?: string;

    public get outputFormat(): string {
        return this._outputFormatExpression ? this._outputFormatExpression.toString() : undefined;
    }

    public set outputFormat(value: string) {
        this._outputFormatExpression = value ? new ExpressionEngine().parse(value) : undefined;
    }

    public configure(config: NumberInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `NumberInput[${ this.prompt.toString() }]`;
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input if needed
        let input: any = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        if (typeof input !== 'number') {
            // Find locale to use
            const activity: Activity = dc.context.activity;
            const locale = activity.locale || this.defaultLocale || 'en-us';

            // Recognize input
            const results: any = Recognizers.recognizeNumber(input, locale);
            if (results.length > 0 && results[0].resolution) {
                input = parseFloat(results[0].resolution.value);
            } else {
                return InputState.unrecognized;
            }
        }

        dc.state.setValue(InputDialog.VALUE_PROPERTY, input);

        if (this._outputFormatExpression) {
            const { value, error } = this._outputFormatExpression.tryEvaluate(dc.state);
            if (!error) {
                dc.state.setValue(InputDialog.VALUE_PROPERTY, value);
            } else {
                throw new Error(`OutputFormat expression evaluation resulted in an error. Expression ${ this._outputFormatExpression.toString() }. Error: ${ error }`);
            }
        }

        return InputState.valid;
    }
}