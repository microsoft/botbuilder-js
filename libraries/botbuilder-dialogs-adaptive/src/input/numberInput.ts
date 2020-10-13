/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Recognizers from '@microsoft/recognizers-text-number';
import {
    Expression,
    NumberExpression,
    NumberExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';
import { Activity } from 'botbuilder-core';
import { Converter, ConverterFactory, DialogContext } from 'botbuilder-dialogs';
import { InputDialog, InputDialogConfiguration, InputState } from './inputDialog';

export interface NumberInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: string | Expression | StringExpression;
    outputFormat?: number | string | Expression | NumberExpression;
}

export class NumberInput extends InputDialog {
    public static $kind = 'Microsoft.NumberInput';

    public defaultLocale?: StringExpression;

    public outputFormat?: NumberExpression;

    public getConverter(property: keyof NumberInputConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'defaultLocale':
                return new StringExpressionConverter();
            case 'outputFormat':
                return new NumberExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    protected onComputeId(): string {
        return `NumberInput[${this.prompt && this.prompt.toString()}]`;
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input if needed
        let input: any = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        if (typeof input !== 'number') {
            // Find locale to use
            const activity: Activity = dc.context.activity;
            const locale = activity.locale || this.defaultLocale.getValue(dc.state) || 'en-us';

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
            const value = this.outputFormat.getValue(dc.state);
            dc.state.setValue(InputDialog.VALUE_PROPERTY, value);
        }

        return InputState.valid;
    }
}
