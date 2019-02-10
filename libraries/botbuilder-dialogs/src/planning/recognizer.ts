/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, RecognizerResult } from 'botbuilder-core';

export interface Recognizer {
    recognize(context: TurnContext): Promise<RecognizerResult>;
}