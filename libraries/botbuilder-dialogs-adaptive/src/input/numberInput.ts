/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Recognizers from '@microsoft/recognizers-text-number';
import { Converter, ConverterFactory, DialogContext } from 'botbuilder-dialogs';
import { InputDialog, InputDialogConfiguration, InputState } from './inputDialog';
import { NumberProperty, StringProperty } from '../properties';

import {
    NumberExpression,
    NumberExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

export interface NumberInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: StringProperty;
    outputFormat?: NumberProperty;
}

/**
 * Input dialog for asking for numbers.
 */
export class NumberInput extends InputDialog implements NumberInputConfiguration {
    static $kind = 'Microsoft.NumberInput';

    defaultLocale?: StringExpression;

    outputFormat?: NumberExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof NumberInputConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'defaultLocale':
                return new StringExpressionConverter();
            case 'outputFormat':
                return new NumberExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * @protected
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `NumberInput[${this.prompt && this.prompt.toString()}]`;
    }

    /**
     * @protected
     * Called when input has been received.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns [InputState](xref:botbuilder-dialogs-adaptive.InputState) which reflects whether input was recognized as valid or not.
     */
    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input if needed
        let input: any = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        if (typeof input !== 'number') {
            // Find locale to use
            /**
             * @deprecated Note: Default locale will be considered for deprecation as part of 4.13.
             */
            const locale = dc.getLocale() ?? this.defaultLocale?.getValue(dc.state) ?? '';

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
