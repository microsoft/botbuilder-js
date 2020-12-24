/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { merge, pickBy } from 'lodash';
import { Activity, RecognizerResult, getTopScoringIntent } from 'botbuilder-core';
import { Converter, ConverterFactory, DialogContext, Recognizer, RecognizerConfiguration } from 'botbuilder-dialogs';
import { RecognizerListConverter } from '../converters';

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
export class CrossTrainedRecognizerSet extends Recognizer implements CrossTrainedRecognizerSetConfiguration {
    public static $kind = 'Microsoft.CrossTrainedRecognizerSet';

    /**
     * Gets or sets the input recognizers.
     */
    public recognizers: Recognizer[] = [];

    public getConverter(property: keyof CrossTrainedRecognizerSetConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'recognizers':
                return RecognizerListConverter;
            default:
                return super.getConverter(property);
        }
    }

    /**
     * To recognize intents and entities in a users utterance.
     */
    public async recognize(
        dialogContext: DialogContext,
        activity: Activity,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
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
            this.recognizers.map(
                (recognizer: Recognizer): Promise<RecognizerResult> => {
                    return recognizer.recognize(dialogContext, activity, telemetryProperties, telemetryMetrics);
                }
            )
        );

        const result = this.processResults(results);
        this.trackRecognizerResult(
            dialogContext,
            'CrossTrainedRecognizerSetResult',
            this.fillRecognizerResultTelemetryProperties(result, telemetryProperties),
            telemetryMetrics
        );
        return result;
    }

    /**
     * Process a list of raw results from recognizers.
     * If there is consensus among the cross trained recognizers, the recognizerResult structure from
     * the consensus recognizer is returned.
     *
     * @param results A list of recognizer results to be processed.
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

        // return none
        const recognizerResult: RecognizerResult = {
            text,
            intents: { None: { score: 1.0 } },
            entities: mergedEntities
        };
        return recognizerResult;
    }

    /**
     * Check if an intent is triggering redirects.
     * @param intent
     */
    private isRedirect(intent: string): boolean {
        return intent.startsWith(deferPrefix);
    }

    /**
     * Extracts the redirect id from an intent.
     * @param intent Intent string contains redirect id.
     */
    private getRedirectId(intent: string): string {
        return intent.substr(deferPrefix.length);
    }
}
