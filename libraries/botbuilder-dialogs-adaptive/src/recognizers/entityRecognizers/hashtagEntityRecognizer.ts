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

/**
 * Recognizes hashtag input.
 */
export class HashtagEntityRecognizer extends TextEntityRecognizer {
    static $kind = 'Microsoft.HashtagEntityRecognizer';

    /**
     * @protected
     * Hashtag recognizing implementation.
     * @param text Text to recognize.
     * @param culture Culture to use.
     * @returns The recognized [ModelResult](xref:botbuilder-dialogs.ModelResult) list.
     */
    protected _recognize(text: string, culture: string): ModelResult[] {
        return recognizeHashtag(text, culture);
    }
}
