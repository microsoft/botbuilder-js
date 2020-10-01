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

/**
 * ValueRecognizer - Recognizer for mapping message activity value payload into intent/entities.
 */
export class ValueRecognizer extends Recognizer {
    /**
     * Runs current `DialogContext.context.activity` through a recognizer and returns a `RecognizerResult`.
     * @param dialogContext The `DialogContext` for the current turn of conversation.
     * @param activity The `Activity` to recognize.
     * @param telemetryProperties Optional. Additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Optional. Additional metrics to be logged to telemetry with the LuisResult event.
     * @returns Recognized `RecognizerResult` Promise.
     */
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
