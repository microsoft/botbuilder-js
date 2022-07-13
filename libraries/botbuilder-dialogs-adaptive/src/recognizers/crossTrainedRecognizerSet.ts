/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import merge from 'lodash/merge';
import pickBy from 'lodash/pickBy';
import { Activity, RecognizerResult, getTopScoringIntent } from 'botbuilder';
import { Converter, ConverterFactory, DialogContext, Recognizer, RecognizerConfiguration } from 'botbuilder-dialogs';
import { RecognizerListConverter } from '../converters';
import { AdaptiveRecognizer } from './adaptiveRecognizer';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

/**
 * Standard cross trained intent name prefix.
 */
const deferPrefix = 'DeferToRecognizer_';

export interface CrossTrainedRecognizerSetConfiguration extends RecognizerConfiguration {
    recognizers?: string[] | Recognizer[];
}

/**
 * Recognizer for selecting between cross trained recognizers.
 */
export class CrossTrainedRecognizerSet extends AdaptiveRecognizer implements CrossTrainedRecognizerSetConfiguration {
    static $kind = 'Microsoft.CrossTrainedRecognizerSet';

    /**
     * Gets or sets the input recognizers.
     */
    recognizers: Recognizer[] = [];

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof CrossTrainedRecognizerSetConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'recognizers':
                return RecognizerListConverter;
            default:
                return super.getConverter(property);
        }
    }

    /**
     * To recognize intents and entities in a users utterance.
     *
     * @param {DialogContext} dialogContext The dialog context.
     * @param {Activity} activity The activity.
     * @param {object} telemetryProperties Optional. Additional properties to be logged to telemetry with the recognizer result event.
     * @param {object} telemetryMetrics Optional. Additional metrics to be logged to telemetry with the recognizer result event.
     * @returns {Promise<RecognizerResult>} Promise of the intent recognized by the recognizer in the form of a RecognizerResult.
     */
    async recognize(
        dialogContext: DialogContext,
        activity: Activity,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>
    ): Promise<RecognizerResult> {
        if (!this.recognizers.length) {
            return {
                text: '',
                intents: { None: { score: 1.0 } },
            };
        }
        for (let i = 0; i < this.recognizers.length; i++) {
            if (!this.recognizers[i].id) {
                throw new Error('This recognizer requires that each recognizer in the set have an id.');
            }
        }

        const results = await Promise.all(
            this.recognizers.map(async (recognizer) => {
                const result = await recognizer.recognize(
                    dialogContext,
                    activity,
                    telemetryProperties,
                    telemetryMetrics
                );
                result['id'] = recognizer.id;
                return result;
            })
        );

        const result = this.processResults(results);
        this.trackRecognizerResult(
            dialogContext,
            TelemetryLoggerConstants.CrossTrainedRecognizerSetResultEvent,
            this.fillRecognizerResultTelemetryProperties(result, telemetryProperties, dialogContext),
            telemetryMetrics
        );
        return result;
    }

    /**
     * Process a list of raw results from recognizers.
     * If there is consensus among the cross trained recognizers, the recognizerResult structure from
     * the consensus recognizer is returned.
     *
     * @param {RecognizerResult[]} results A list of recognizer results to be processed.
     * @returns {RecognizerResult} The the result cross-trained by the multiple results of the cross-training recognizers.
     */
    private processResults(results: RecognizerResult[]): RecognizerResult {
        const recognizerResults: Record<string, RecognizerResult> = {};
        const intents = {};
        let text = '';
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const recognizer = this.recognizers[i];
            recognizerResults[recognizer.id] = result;
            const { intent } = getTopScoringIntent(result);
            intents[recognizer.id] = intent;
            text = result.text || '';
        }

        let consensusRecognizedId: string;
        for (let i = 0; i < this.recognizers.length; i++) {
            const recognizer = this.recognizers[i];
            let recognizerId = recognizer.id;
            let intent: string = intents[recognizer.id];
            if (this.isRedirect(intent)) {
                // follow redirect and see where it takes us
                recognizerId = this.getRedirectId(intent);
                intent = intents[recognizerId];
                while (recognizerId != recognizer.id && this.isRedirect(intent)) {
                    recognizerId = this.getRedirectId(intent);
                    intent = intents[recognizerId];
                }

                // if we ended up back at the recognizer.id and we have no consensus then it's a none intent
                if (recognizerId === recognizer.id && !consensusRecognizedId) {
                    const recognizerResult: RecognizerResult = {
                        text: recognizerResults[recognizer.id].text,
                        intents: { None: { score: 1.0 } },
                        sentiment: recognizerResults[recognizer.id].sentiment,
                    };
                    return recognizerResult;
                }
            }

            // we have a real intent and it's the first one we found
            if (!consensusRecognizedId) {
                if (intent && intent !== 'None') {
                    consensusRecognizedId = recognizerId;
                }
            } else {
                // we have a second recognizer result which is either none or real
                // if one of them is None intent, then go with the other one
                if (!intent || intent === 'None') {
                    // then we are fine with the one we have, just ignore this one
                    continue;
                } else if (recognizerId === consensusRecognizedId) {
                    // this is more consensus for this recognizer
                    continue;
                } else {
                    // ambiguous because we have 2 or more real intents, so return `ChooseIntent`,
                    // filter out redirect results and return `ChooseIntent`.
                    const recognizersWithRealIntents = pickBy(
                        recognizerResults,
                        (value) => !this.isRedirect(getTopScoringIntent(value).intent)
                    );
                    return this.createChooseIntentResult(recognizersWithRealIntents);
                }
            }
        }

        // we have consensus for consensusRecognizer, return the results of that recognizer as the result
        if (consensusRecognizedId) {
            return recognizerResults[consensusRecognizedId];
        }

        //find if matched entities found when hits the none intent
        const mergedEntities = results.reduce((acc, curr) => merge(acc, curr.entities), {});
        const sentiment = results.reduce((acc, curr) => merge(acc, curr.sentiment), {});

        // return none
        const recognizerResult: RecognizerResult = {
            text,
            intents: { None: { score: 1.0 } },
            entities: mergedEntities,
            sentiment: sentiment,
        };
        return recognizerResult;
    }

    /**
     * Check if an intent is triggering redirects.
     *
     * @param {string} intent The intent.
     * @returns {boolean} Boolean result of whether or not an intent begins with the `DeferToRecognizer_` prefix.
     */
    private isRedirect(intent: string): boolean {
        return intent?.startsWith(deferPrefix) ?? false;
    }

    /**
     * Extracts the redirect ID from an intent.
     *
     * @param {string} intent Intent string contains redirect id.
     * @returns {string} The redirect ID.
     */
    private getRedirectId(intent: string): string {
        return intent.substr(deferPrefix.length);
    }
}
