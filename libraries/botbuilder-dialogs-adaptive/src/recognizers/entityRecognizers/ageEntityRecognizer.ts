/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeAge } from '@microsoft/recognizers-text-number-with-unit';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class AgeEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.AgeEntityRecognizer';

    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeAge(text, culture);
    }
}