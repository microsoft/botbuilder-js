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

export class OrdinalEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.OrdinalEntityRecognizer';

    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeOrdinal(text, culture);
    }
}