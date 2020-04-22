/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult, Activity } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';

export interface Recognizer {
    id: string;
    recognize(dialogContext: DialogContext, activity: Activity): Promise<RecognizerResult>;
}

export interface IntentMap {
    [name: string]: { score: number };
}

export function createRecognizerResult(text: string, intents?: IntentMap, entities?: object ): RecognizerResult {
    if (!intents) {
        intents = { 'None': { score: 0.0 } };
    }
    if (!entities) {
        entities = {};
    }
    return { text: text, intents: intents, entities: entities };
}
