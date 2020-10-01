/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeAge } from '@microsoft/recognizers-text-number-with-unit';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

/**
 * Recognizes age input.
 */
export class AgeEntityRecognizer extends TextEntityRecognizer {
    /**
     * @protected
     * Age recognizing implementation.
     * @param text Text to recognize.
     * @param culture Culture to use.
     * @returns The recognized `ModelResult` list.
     */
    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeAge(text, culture);
    }
}
