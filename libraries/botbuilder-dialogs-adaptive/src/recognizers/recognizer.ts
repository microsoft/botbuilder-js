/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult, Activity, getTopScoringIntent, BotTelemetryClient, NullTelemetryClient } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { telemetryClientKey } from '../telemetryExtensions';

/**
 * Recognizer base class.
 */
export class Recognizer {

    /**
     * Recognizers unique ID.
     */
    public id: string;


    /**
     * The telemetry client for logging events.
     * Default this to the NullTelemetryClient, which does nothing.
     */
    protected _telemetryClient: BotTelemetryClient = new NullTelemetryClient();

    /**
     * Gets the telemetry client for this dialog.
     */
    public get telemetryClient(): BotTelemetryClient {
        return this._telemetryClient;
    }

    /**
     * Sets the telemetry client for this dialog.
     */
    public set telemetryClient(client: BotTelemetryClient) {
        this._telemetryClient = client ? client : new NullTelemetryClient();
    }

    /**
     * To recognize intents and entities in a users utterance.
     *
     * @param dialogContext Dialog Context.
     * @param activity Activity.
     * @param telemetryProperties Additional properties to be logged to telemetry with event.
     * @param telemetryMetrics Additional metrics to be logged to telemetry with event.
     */
    public recognize(dialogContext: DialogContext, activity: Partial<Activity>, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }): Promise<RecognizerResult> {
        throw new Error('Please implement recognize function.');
    }

    /**
     * Uses the RecognizerResult to create a list of propeties to be included when tracking the result in telemetry.
     * @param recognizerResult Recognizer Result.
     * @param telemetryProperties A list of properties to append or override the properties created using the RecognizerResult.
     * @param dialogContext Dialog Context.
     * @returns A dictionary that can be included when calling the TrackEvent method on the TelemetryClient.
     */
    protected fillRecognizerResultTelemetryProperties(recognizerResult: RecognizerResult, telemetryProperties: { [key: string]: string }, dialogContext?: DialogContext): { [key: string]: string } {

        const { intent, score } = getTopScoringIntent(recognizerResult);

        const properties: { [key: string]: string } = {
            'Text': recognizerResult.text,
            'AlteredText': recognizerResult.alteredText,
            'TopIntent': Object.entries(recognizerResult.intents).length > 0 ? intent : undefined,
            'TopIntentScore': Object.entries(recognizerResult.intents).length > 0 ? score.toString() : undefined,
            'Intents': Object.entries(recognizerResult.intents).length > 0 ? JSON.stringify(recognizerResult.intents) : undefined,
            'Entities': recognizerResult.entities ? JSON.stringify(recognizerResult.entities) : undefined,
            'AdditionalProperties': this.stringifyAdditionalPropertiesOfRecognizerResult(recognizerResult)
        };
        // Additional Properties can override "stock" properties.
        if (telemetryProperties) {
            return Object.assign({}, properties, telemetryProperties);
        }
        return properties;
    }

    /**
     * @private
     */
    private stringifyAdditionalPropertiesOfRecognizerResult(recognizerResult: RecognizerResult): string {
        const generalProperties = new Set(['text', 'alteredText', 'intents', 'entities']);
        let additionalProperties: { [key: string]: string } = {};
        for (const key in recognizerResult) {
            if (!generalProperties.has(key)) {
                additionalProperties[key] = recognizerResult[key];
            }
        }
        return Object.keys(additionalProperties).length > 0 ? JSON.stringify(additionalProperties) : undefined;
    }

    /**
     * @protected
     * Tracks an event with the event name provided using the `BotTelemetryClient` attaching the properties / metrics.
     * @param dialogContext The `DialogContext` for the current turn of conversation.
     * @param eventName The name of the event to track.
     * @param telemetryProperties Optional. The properties to be included as part of the event tracking.
     * @param telemetryMetrics Optional. The metrics to be included as part of the event tracking.
     */
    protected trackRecognizerResult(dialogContext: DialogContext, eventName: string, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }) {
        if (this.telemetryClient instanceof NullTelemetryClient) {
            const turnStateTelemetryClient = dialogContext.context.turnState.get(telemetryClientKey);
            this.telemetryClient = turnStateTelemetryClient || this.telemetryClient;
        }
        this.telemetryClient.trackEvent({
                name: eventName,
                properties: telemetryProperties,
                metrics: telemetryMetrics
            });
    }
}

export interface IntentMap {
    [name: string]: { score: number };
}

/**
 * Creates a `RecognizerResult`.
 * @param text Utterance sent to recognizer.
 * @param intents A map of intent names to an object with score.
 * @param entities An object to represent the entities.
 * @returns A `RecognizerResult` object.
 */
export function createRecognizerResult(text: string, intents?: IntentMap, entities?: object ): RecognizerResult {
    if (!intents) {
        intents = { 'None': { score: 0.0 } };
    }
    if (!entities) {
        entities = {};
    }
    return { text: text, intents: intents, entities: entities };
}

