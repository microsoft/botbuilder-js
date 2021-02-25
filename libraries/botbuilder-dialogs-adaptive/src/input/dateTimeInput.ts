/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Recognizers from '@microsoft/recognizers-text-date-time';
import { Expression, StringExpression, StringExpressionConverter } from 'adaptive-expressions';
import { Converter, ConverterFactory, DialogContext } from 'botbuilder-dialogs';
import { InputDialog, InputDialogConfiguration, InputState } from './inputDialog';

export interface DateTimeInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: string | Expression | StringExpression;
    outputFormat?: string | Expression | StringExpression;
}

/**
 * Input dialog to collect a datetime from the user.
 */
export class DateTimeInput extends InputDialog implements DateTimeInputConfiguration {
    public static $kind = 'Microsoft.DateTimeInput';

    public defaultLocale: StringExpression;

    public outputFormat: StringExpression;

    public getConverter(property: keyof DateTimeInputConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'defaultLocale':
                return new StringExpressionConverter();
            case 'outputFormat':
                return new StringExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * @protected
     */
    protected onComputeId(): string {
        return `DateTimeInput[${this.prompt && this.prompt.toString()}]`;
    }

    /**
     * @protected
     * Called when input has been received.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns [InputState](xref:botbuilder-dialogs-adaptive.InputState) which reflects whether input was recognized as valid or not.
     */
    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input and filter out non-attachments
        const input: object = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        /**
         * @deprecated Note: Default locale will be considered for deprecation as part of 4.13.
         */
        const locale: string = dc.getLocale() ?? this.defaultLocale?.getValue(dc.state);
        const results: any[] = Recognizers.recognizeDateTime(input.toString(), locale);

        if (results.length > 0 && results[0].resolution) {
            const values = results[0].resolution.values;
            dc.state.setValue(InputDialog.VALUE_PROPERTY, values);
            if (this.outputFormat) {
                const value = this.outputFormat.getValue(dc.state);
                dc.state.setValue(InputDialog.VALUE_PROPERTY, value);
            }
        } else {
            return InputState.unrecognized;
        }
        return InputState.valid;
    }
}
