/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ActivityTypes, RecognizerResult } from 'botbuilder';
import { DialogContext } from 'botbuilder-dialogs';
import { AdaptiveRecognizer } from './adaptiveRecognizer';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

/**
 * ValueRecognizer - Recognizer for mapping message activity. Value payload into intent/entities.
 *
 * @remarks
 * This recognizer will map MessageActivity Value payloads into intents and entities.
 *      activity.Value.intent => RecognizerResult.Intents.
 *      activity.Value.properties => RecognizerResult.Entities.
 */
export class ValueRecognizer extends AdaptiveRecognizer {
    /**
     * Runs current DialogContext.TurnContext.Activity through a recognizer and returns a [RecognizerResult](xref:botbuilder-core.RecognizerResult).
     *
     * @param dialogContext The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param activity [Activity](xref:botframework-schema.Activity) to recognize.
     * @param telemetryProperties Optional, additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Optional, additional metrics to be logged to telemetry with the LuisResult event.
     * @returns {Promise<RecognizerResult>} Analysis of utterance.
     */
    async recognize(
        dialogContext: DialogContext,
        activity: Activity,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
    ): Promise<RecognizerResult> {
        const recognizerResult: RecognizerResult = {
            text: activity.text,
            intents: {},
            entities: {},
        };

        if (activity.type == ActivityTypes.Message) {
            if (!activity.text && activity.value) {
                const value = activity.value;
                for (const property in value) {
                    if (property.toLowerCase() == 'intent') {
                        recognizerResult.intents[value[property]] = { score: 1.0 };
                    } else {
                        if (!Object.hasOwnProperty.call(recognizerResult.entities, property)) {
                            recognizerResult.entities[property] = [];
                        }
                        recognizerResult.entities[property].push(value[property]);
                    }
                }
            }
        }
        this.trackRecognizerResult(
            dialogContext,
            TelemetryLoggerConstants.ValueRecognizerResultEvent,
            this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties, dialogContext),
            telemetryMetrics
        );

        return recognizerResult;
    }
}
