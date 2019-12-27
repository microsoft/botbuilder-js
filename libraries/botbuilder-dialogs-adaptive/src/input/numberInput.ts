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
import { ExpressionEngine } from 'botframework-expressions';
import { InputDialogConfiguration, InputDialog, InputState } from './inputDialog';

export interface NumberInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: string;
    outputFormat?: string;
}

export class NumberInput extends InputDialog {

    public static declarativeType = 'Microsoft.NumberInput';

    public defaultLocale?: string;

    public outputFormat?: string;

    public configure(config: NumberInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `NumberInput[${ this.prompt.value.toString() }]`;
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

        if (this.outputFormat) {
            const outputExpression = new ExpressionEngine().parse(this.outputFormat);
            const { value, error } = outputExpression.tryEvaluate(dc.state);
            if (!error) {
                dc.state.setValue(InputDialog.VALUE_PROPERTY, value);
            } else {
                throw new Error(`OutputFormat expression evaluation resulted in an error. Expression ${outputExpression.toString()}. Error: ${error}`);
            }
        }

        return InputState.valid;
    }
}