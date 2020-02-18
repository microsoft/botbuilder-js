/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { recognizeIpAddress } from '@microsoft/recognizers-text-sequence';
import { ModelResult } from 'botbuilder-dialogs';
import { TextEntityRecognizer } from './textEntityRecognizer';

export class IpEntityRecognizer extends TextEntityRecognizer {
    public static declarativeType = 'Microsoft.IpEntityRecognizer';

    protected recognize(text: string, culture: string): ModelResult[] {
        return recognizeIpAddress(text, culture);
    }
}