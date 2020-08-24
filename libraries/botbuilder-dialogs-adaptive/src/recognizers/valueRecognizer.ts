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

export class ValueRecognizer extends Recognizer {

    public async recognize(dialogContext: DialogContext, activity: Activity, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }): Promise<RecognizerResult> {
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
        this.trackRecognizerResult(dialogContext, 'ValueRecognizerResult', this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties), telemetryMetrics);

        return recognizerResult;
    }
}
