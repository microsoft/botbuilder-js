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
import { InputDialog, InputState } from './inputDialog';
import { StringExpression, NumberExpression } from 'adaptive-expressions';

/**
 * Input dialog for asking for numbers.
 */
export class NumberInput extends InputDialog {

    public defaultLocale?: StringExpression;

    public outputFormat?: NumberExpression;

    /**
     * @protected
     */
    protected onComputeId(): string {
        return `NumberInput[${ this.prompt && this.prompt.toString() }]`;
    }

    /**
     * @protected
     * Called when input has been received.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @returns InputState which reflects whether input was recognized as valid or not.
     */
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
