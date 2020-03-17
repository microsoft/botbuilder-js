/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeDateTime } from '@microsoft/recognizers-text-date-time';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class DateTimeEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.DateTimeEntityRecognizer';

    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeDateTime(text, culture);
    }
}