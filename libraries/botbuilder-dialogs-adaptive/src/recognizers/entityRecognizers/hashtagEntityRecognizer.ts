/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeHashtag } from '@microsoft/recognizers-text-sequence';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class HashtagEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.HashtagEntityRecognizer';

    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeHashtag(text, culture);
    }
}