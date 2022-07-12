/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, RecognizerResult, getTopScoringIntent } from 'botbuilder';
import { Converter, ConverterFactory, DialogContext, Recognizer, RecognizerConfiguration } from 'botbuilder-dialogs';
import { RecognizerListConverter } from '../converters';
import { AdaptiveRecognizer } from './adaptiveRecognizer';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

export interface RecognizerSetConfiguration extends RecognizerConfiguration {
    recognizers?: string[] | Recognizer[];
}

/**
 * A recognizer class whose result is the union of results from multiple recognizers into one RecognizerResult.
 */
export class RecognizerSet extends AdaptiveRecognizer implements RecognizerSetConfiguration {
    static $kind = 'Microsoft.RecognizerSet';

    recognizers: Recognizer[] = [];

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof RecognizerSetConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'recognizers':
                return RecognizerListConverter;
            default:
                return super.getConverter(property);
        }
    }

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
        const results = await Promise.all(
            this.recognizers.map(
                (recognizer: Recognizer): Promise<RecognizerResult> => {
                    return recognizer.recognize(dialogContext, activity, telemetryProperties, telemetryMetrics);
                }
            )
        );

        const recognizerResult: RecognizerResult = this.mergeResults(results);

        this.trackRecognizerResult(
            dialogContext,
            TelemetryLoggerConstants.RecognizerSetResultEvent,
            this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties, dialogContext),
            telemetryMetrics
        );

        return recognizerResult;
    }

    private mergeResults(results: RecognizerResult[]) {
        const mergedRecognizerResult: RecognizerResult = {
            text: undefined,
            alteredText: undefined,
            intents: {},
            entities: {
                $instance: {},
            },
        };

        for (const result of results) {
            const { intent: intentName } = getTopScoringIntent(result);
            if (intentName && intentName !== 'None') {
                // merge text
                if (!mergedRecognizerResult.text) {
                    mergedRecognizerResult.text = result.text;
                } else if (result.text !== mergedRecognizerResult.text) {
                    mergedRecognizerResult.alteredText = result.text;
                }

                // merge intents
                for (const [intentName, intent] of Object.entries(result.intents)) {
                    const intentScore = intent.score ?? 0;
                    if (Object.hasOwnProperty.call(mergedRecognizerResult.intents, intentName)) {
                        if (intentScore < mergedRecognizerResult.intents[intentName].score) {
                            // we already have a higher score for this intent
                            continue;
                        }
                    }

                    mergedRecognizerResult.intents[intentName] = intent;
                }
            }

            // merge entities
            // entities shape is:
            //   {
            //      "name": ["value1","value2","value3"],
            //      "$instance": {
            //          "name": [ { "startIndex" : 15, ... }, ... ]
            //      }
            //   }
            if (result.entities) {
                for (const [propertyName, propertyVal] of Object.entries(result.entities)) {
                    if (propertyName === '$instance') {
                        for (const [entityName, entityValue] of Object.entries(propertyVal)) {
                            const mergedInstanceEntities = (mergedRecognizerResult.entities['$instance'][
                                entityName
                            ] ??= []);
                            mergedInstanceEntities.push(...entityValue);
                        }
                    } else {
                        const mergedEntities = (mergedRecognizerResult.entities[propertyName] ??= []);
                        mergedEntities.push(...(propertyVal as any));
                    }
                }
            }

            for (const property in result) {
                if (
                    property != 'text' &&
                    property != 'alteredText' &&
                    property != 'intents' &&
                    property != 'entities'
                ) {
                    // naive merge clobbers same key.
                    mergedRecognizerResult[property] = result[property];
                }
            }
        }

        if (Object.entries(mergedRecognizerResult.intents).length === 0) {
            mergedRecognizerResult.intents['None'] = { score: 1.0 };
        }

        return mergedRecognizerResult;
    }
}
