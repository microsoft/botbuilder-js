/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeGUID } from '@microsoft/recognizers-text-sequence';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class GuidEntityRecognizer extends TextEntityRecognizer {
    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeGUID(text, culture);
    }
}
