/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizePhoneNumber } from '@microsoft/recognizers-text-sequence';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class PhoneNumberEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.PhoneNumberEntityRecognizer';

    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizePhoneNumber(text, culture);
    }
}