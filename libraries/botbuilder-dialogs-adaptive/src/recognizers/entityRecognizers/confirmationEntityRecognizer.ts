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

export class ConfirmationEntityRecognizer extends TextEntityRecognizer {
    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeBoolean(text, culture);
    }
}
