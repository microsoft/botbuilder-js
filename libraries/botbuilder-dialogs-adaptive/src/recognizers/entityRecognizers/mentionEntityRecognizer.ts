/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeMention } from '@microsoft/recognizers-text-sequence';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class MentionEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.MentionEntityRecognizer';

    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeMention(text, culture);
    }
}