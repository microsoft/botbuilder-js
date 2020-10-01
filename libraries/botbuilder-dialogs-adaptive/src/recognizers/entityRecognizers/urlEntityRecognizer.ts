/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeURL } from '@microsoft/recognizers-text-sequence';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

/**
 * Recognizes URL input.
 */
export class UrlEntityRecognizer extends TextEntityRecognizer {
    /**
     * @protected
     * URL recognizing implementation.
     * @param text Text to recognize.
     * @param culture Culture to use.
     * @returns The recognized `ModelResult` list.
     */
    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeURL(text, culture);
    }
}
