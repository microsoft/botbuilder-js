/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeTemperature } from '@microsoft/recognizers-text-number-with-unit';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

/**
 * Recognizes temperature input.
 */
export class TemperatureEntityRecognizer extends TextEntityRecognizer {
    /**
     * @protected
     * Temperature recognizing implementation.
     * @param text Text to recognize.
     * @param culture Culture to use.
     * @returns The recognized `ModelResult` list.
     */
    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeTemperature(text, culture);
    }
}
