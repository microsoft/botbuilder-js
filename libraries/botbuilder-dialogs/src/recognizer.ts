/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    Activity,
    BotTelemetryClient,
    getTopScoringIntent,
    NullTelemetryClient,
    RecognizerResult,
} from 'botbuilder-core';
import { Configurable } from './configurable';
import { DialogContext } from './dialogContext';
import { DialogTurnStateConstants } from './dialogTurnStateConstants';

export interface RecognizerConfiguration {
    id?: string;
    telemetryClient?: BotTelemetryClient;
}

export class Recognizer extends Configurable implements RecognizerConfiguration {
    /**
     * Recognizers unique ID.
     */
    public id: string;

    /**
     * The telemetry client for logging events.
     * Default this to the NullTelemetryClient, which does nothing.
     */
    public telemetryClient: BotTelemetryClient = new NullTelemetryClient();

    /**
     * To recognize intents and entities in a users utterance.
     *
     * @param {DialogContext} dialogContext Dialog Context.
     * @param {Partial<Activity>} activity Activity.
     * @param {Record<string, string>} telemetryProperties Additional properties to be logged to telemetry with event.
     * @param {Record<string, number>} telemetryMetrics Additional metrics to be logged to telemetry with event.
     * @returns {Promise<RecognizerResult>} Recognized result.
     */
    public recognize(
        dialogContext: DialogContext,
        activity: Partial<Activity>,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number> 
    ): Promise<RecognizerResult> {
        throw new Error('Please implement recognize function.');
    }

    /**
     * Creates choose intent result in the case that there is conflicting or ambigious signals from the recognizers.
     *
     * @param {Record<string, RecognizerResult>} recognizerResults A group of recognizer results.
     * @returns {RecognizerResult} Recognizer result which is ChooseIntent.
     */
    protected createChooseIntentResult(recognizerResults: Record<string, RecognizerResult>): RecognizerResult {
        let text: string;
        type candidateType = { id: string; intent: string; score: number; result: RecognizerResult };
        const candidates = Object.entries(recognizerResults).reduce((candidates: candidateType[], [key, result]) => {
            text = result.text;
            const { intent, score } = getTopScoringIntent(result);
            if (intent !== 'None') {
                candidates.push({
                    id: key,
                    intent,
                    score,
                    result,
                });
            }
            return candidates;
        }, []);

        if (candidates.length) {
            // return `ChooseIntent` with candidates array.
            const recognizerResult: RecognizerResult = {
                text,
                intents: { ChooseIntent: { score: 1.0 } },
                candidates,
            };
            return recognizerResult;
        }

        // just return a `None` intent.
        const recognizerResult: RecognizerResult = {
            text,
            intents: { None: { score: 1.0 } },
        };
        return recognizerResult;
    }

    /**
     * Uses the RecognizerResult to create a list of propeties to be included when tracking the result in telemetry.
     * @param recognizerResult Recognizer Result.
     * @param telemetryProperties A list of properties to append or override the properties created using the RecognizerResult.
     * @param dialogContext Dialog Context.
     * @returns A dictionary that can be included when calling the TrackEvent method on the TelemetryClient.
     */
    protected fillRecognizerResultTelemetryProperties(
        recognizerResult: RecognizerResult,
        telemetryProperties: { [key: string]: string },
        dialogContext?: DialogContext
    ): { [key: string]: string } {
        const { intent, score } = getTopScoringIntent(recognizerResult);

        const properties: { [key: string]: string } = {
            Text: recognizerResult.text,
            AlteredText: recognizerResult.alteredText,
            TopIntent: Object.entries(recognizerResult.intents).length > 0 ? intent : undefined,
            TopIntentScore: Object.entries(recognizerResult.intents).length > 0 ? score.toString() : undefined,
            Intents:
                Object.entries(recognizerResult.intents).length > 0
                    ? JSON.stringify(recognizerResult.intents)
                    : undefined,
            Entities: recognizerResult.entities ? JSON.stringify(recognizerResult.entities) : undefined,
            AdditionalProperties: this.stringifyAdditionalPropertiesOfRecognizerResult(recognizerResult),
        };
        // Additional Properties can override "stock" properties.
        if (telemetryProperties) {
            return Object.assign({}, properties, telemetryProperties);
        }
        return properties;
    }

    private stringifyAdditionalPropertiesOfRecognizerResult(recognizerResult: RecognizerResult): string {
        const generalProperties = new Set(['text', 'alteredText', 'intents', 'entities']);
        const additionalProperties: { [key: string]: string } = {};
        for (const key in recognizerResult) {
            if (!generalProperties.has(key)) {
                additionalProperties[key] = recognizerResult[key];
            }
        }
        return Object.keys(additionalProperties).length > 0 ? JSON.stringify(additionalProperties) : undefined;
    }

    protected trackRecognizerResult(
        dialogContext: DialogContext,
        eventName: string,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
    ): void {
        if (this.telemetryClient instanceof NullTelemetryClient) {
            const turnStateTelemetryClient = dialogContext.context.turnState.get(
                DialogTurnStateConstants.telemetryClient
            );
            this.telemetryClient = turnStateTelemetryClient || this.telemetryClient;
        }
        this.telemetryClient.trackEvent({
            name: eventName,
            properties: telemetryProperties,
            metrics: telemetryMetrics,
        });
    }
}
