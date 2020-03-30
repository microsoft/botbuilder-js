/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RecognizerResult, Activity, ActivityTypes } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { Recognizer } from './recognizer';

export class ValueRecognizer implements Recognizer {

    public id: string;

    public async recognize(dialogContext: DialogContext): Promise<RecognizerResult>;
    public async recognize(dialogContext: DialogContext, activity?: Activity): Promise<RecognizerResult> {
        if (!activity) {
            activity = dialogContext.context.activity;
        }

        const recognizerResult: RecognizerResult = {
            text: activity.text,
            intents: {},
            entities: {}
        };

        if (activity.type == ActivityTypes.Message) {
            if (!activity.text && activity.value) {
                const value = activity.value;
                for (const property in value) {
                    if (property.toLowerCase() == 'intent') {
                        recognizerResult.intents[value[property]] = { score: 1.0 };
                    } else {
                        if (!recognizerResult.entities.hasOwnProperty(property)) {
                            recognizerResult.entities[property] = [];
                        }
                        recognizerResult.entities[property].push(value[property]);
                    }
                }
            }
        }

        return recognizerResult;
    }
}