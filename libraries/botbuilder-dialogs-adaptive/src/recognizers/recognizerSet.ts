/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RecognizerResult, Activity, getTopScoringIntent, BotTelemetryClient, NullTelemetryClient } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { Recognizer, fillRecognizerResultTelemetryProperties } from './recognizer';

export class RecognizerSet implements Recognizer {

    public id: string;

    public recognizers: Recognizer[] = [];

    /**
     * Telemetry client.
     */
    public telemetryClient: BotTelemetryClient = new NullTelemetryClient();
    public async recognize(dialogContext: DialogContext, activity: Activity, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }): Promise<RecognizerResult> {
        const recognizerResult: RecognizerResult = {
            text: undefined,
            alteredText: undefined,
            intents: {},
            entities: {
                '$instance': {}
            }
        };
        const results = await Promise.all(this.recognizers.map((recognizer: Recognizer): Promise<RecognizerResult> => {
            return recognizer.recognize(dialogContext, activity, telemetryProperties, telemetryMetrics);
        }));

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const { intent } = getTopScoringIntent(result);
            if (intent && intent != 'None') {
                // merge text
                if (!recognizerResult.text) {
                    recognizerResult.text = result.text;
                } else if (result.text != recognizerResult.text) {
                    recognizerResult.alteredText = recognizerResult.text;
                }

                // merge intents
                for (const intentName in result.intents) {
                    const intentScore = result.intents[intentName].score;
                    if (recognizerResult.intents.hasOwnProperty(intentName)) {
                        if (intentScore < recognizerResult.intents[intentName].score) {
                            continue;
                        }
                    }
                    recognizerResult.intents[intentName] = { score: intentScore };
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
            for (const property in result.entities) {
                if (property == '$instance') {
                    const instanceData = result.entities['$instance'];
                    for (const entityName in instanceData) {
                        if (!recognizerResult.entities['$instance'].hasOwnProperty(entityName)) {
                            recognizerResult.entities['$instance'][entityName] = [];
                        }
                        const entityValue = instanceData[entityName];
                        recognizerResult.entities['$instance'][entityName].push(...entityValue);
                    }
                } else {
                    if (!recognizerResult.entities.hasOwnProperty(property)) {
                        recognizerResult.entities[property] = [];
                    }
                    const value = result.entities[property];
                    recognizerResult.entities[property].push(...value);
                }
            }

            for (const property in result) {
                if (property != 'text' && property != 'alteredText' && property != 'intents' && property != 'entities') {
                    // naive merge clobbers same key.
                    recognizerResult[property] = result[property];
                }
            }

        }

        if (Object.entries(recognizerResult.intents).length == 0) {
            recognizerResult.intents['None'] = { score: 1.0 };
        }


        this.telemetryClient.trackEvent(
            {
                name: 'RecognizerSetResult',
                properties: fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties, dialogContext),
                metrics: telemetryMetrics
            });
        
        return recognizerResult;
    }
}