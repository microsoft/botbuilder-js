/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeEmail } from '@microsoft/recognizers-text-sequence';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class EmailEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.EmailEntityRecognizer';

    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeEmail(text, culture);
    }
}