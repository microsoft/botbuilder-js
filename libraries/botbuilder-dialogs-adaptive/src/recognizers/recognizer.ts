/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult, Activity, getTopScoringIntent, BotTelemetryClient, NullTelemetryClient } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';

export abstract class Recognizer {

    /**
     * Recognizers unique ID.
     */
    public id: string;

    public constructor(){};

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

    public abstract recognize(dialogContext: DialogContext, activity: Partial<Activity>, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }): Promise<RecognizerResult>;

    /**
     * Uses the RecognizerResult to create a list of propeties to be included when tracking the result in telemetry.
     * @param recognizerResult Recognizer Result.
     * @param telemetryProperties A list of properties to append or override the properties created using the RecognizerResult.
     * @param dialogContext Dialog Context.
     * @returns A dictionary that can be included when calling the TrackEvent method on the TelemetryClient.
     */
    public fillRecognizerResultTelemetryProperties(recognizerResult: RecognizerResult, telemetryProperties: { [key: string]: string }, dialogContext?: DialogContext){
        
        const {intent, score} = getTopScoringIntent(recognizerResult);

        var properties: { [key: string]: string; } = {
            'Text': recognizerResult.text ,
            'AlteredText': recognizerResult.alteredText ,
            'TopIntent': Object.entries(recognizerResult.intents).length > 0 ? intent : undefined ,
            'TopIntentScore': Object.entries(recognizerResult.intents).length > 0 ? score.toString() : undefined ,
            'Intents': Object.entries(recognizerResult.intents).length > 0 ? JSON.stringify(recognizerResult.intents) : undefined , 
            'Entities': recognizerResult.entities ? recognizerResult.entities.toString() : undefined ,
            'AdditionalProperties': recognizerResult.properties ? (Object.entries(recognizerResult.properties).length > 0 ? JSON.stringify(recognizerResult.properties) : undefined ) : undefined
        };


        // Additional Properties can override "stock" properties.
        if (telemetryProperties){
            return Object.assign({}, properties, telemetryProperties);
        }
        return properties;
    }

    
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

