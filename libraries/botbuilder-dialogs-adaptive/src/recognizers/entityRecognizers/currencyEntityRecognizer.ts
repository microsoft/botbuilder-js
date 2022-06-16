/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeCurrency } from '@microsoft/recognizers-text-number-with-unit';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

/**
 * Recognizes currency input.
 */
export class CurrencyEntityRecognizer extends TextEntityRecognizer {
    static $kind = 'Microsoft.CurrencyEntityRecognizer';

    /**
     * @protected
     * Currency recognizing implementation.
     * @param text Text to recognize.
     * @param culture Culture to use.
     * @returns The recognized [ModelResult](xref:botbuilder-dialogs.ModelResult) list.
     */
    protected _recognize(text: string, culture: string): ModelResult[] {
        return recognizeCurrency(text, culture);
    }
}
