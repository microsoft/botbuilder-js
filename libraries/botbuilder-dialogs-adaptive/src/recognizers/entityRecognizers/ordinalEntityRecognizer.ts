/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeOrdinal } from '@microsoft/recognizers-text-number';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

/**
 * Recognizes ordinal input.
 */
export class OrdinalEntityRecognizer extends TextEntityRecognizer {
    static $kind = 'Microsoft.OrdinalEntityRecognizer';

    /**
     * @protected
     * Ordinal recognizing implementation.
     * @param text Text to recognize.
     * @param culture Culture to use.
     * @returns The recognized [ModelResult](xref:botbuilder-dialogs.ModelResult) list.
     */
    protected _recognize(text: string, culture: string): ModelResult[] {
        return recognizeOrdinal(text, culture);
    }
}
