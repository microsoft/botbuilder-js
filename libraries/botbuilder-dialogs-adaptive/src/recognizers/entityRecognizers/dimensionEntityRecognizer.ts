/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeDimension } from '@microsoft/recognizers-text-number-with-unit';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class DimensionEntityRecognizer extends TextEntityRecognizer {
    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeDimension(text, culture);
    }
}