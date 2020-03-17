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

export class CurrencyEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.CurrencyEntityRecognizer';

    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeCurrency(text, culture);
    }
}