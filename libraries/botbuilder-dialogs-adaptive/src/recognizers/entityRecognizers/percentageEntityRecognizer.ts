/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizePercentage } from '@microsoft/recognizers-text-number';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class PercentageEntityRecognizer extends TextEntityRecognizer {
    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizePercentage(text, culture);
    }
}
