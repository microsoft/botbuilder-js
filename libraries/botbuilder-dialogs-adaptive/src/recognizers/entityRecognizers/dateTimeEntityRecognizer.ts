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

/**
 * Recognizes DateTime input.
 */
export class DateTimeEntityRecognizer extends TextEntityRecognizer {
    /**
     * @protected
     * DateTime recognizing implementation.
     * @param text Text to recognize.
     * @param culture Culture to use.
     * @returns The recognized `ModelResult` list.
     */
    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeDateTime(text, culture);
    }
}
