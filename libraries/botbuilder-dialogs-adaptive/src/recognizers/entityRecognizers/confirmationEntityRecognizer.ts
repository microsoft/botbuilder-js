/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeBoolean } from '@microsoft/recognizers-text-choice';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

/**
 * Recognizes yes/no confirmation style input.
 */
export class ConfirmationEntityRecognizer extends TextEntityRecognizer {
    /**
     * @protected
     * Yes/no confirmation style input recognizing implementation.
     * @param text Text to recognize.
     * @param culture Culture to use.
     * @returns The recognized `ModelResult` list.
     */
    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeBoolean(text, culture);
    }
}
