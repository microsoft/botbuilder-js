/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RecognizerResult, Activity, getTopScoringIntent } from 'botbuilder-core';
import { Configurable, DialogContext } from 'botbuilder-dialogs';
import { Recognizer } from './recognizer';

export interface RecognizerSetConfiguration {
    id?: string;
    recognizers?: Recognizer[];
}

export class RecognizerSet extends Configurable implements Recognizer {

    public static declarativeType = 'Microsoft.RecognizerSet';

    public id: string;

    public recognizers: Recognizer[] = [];

    public configure(config: RecognizerSetConfiguration): this {
        return super.configure(config);
    }

    public async recognize(dialogContext: DialogContext): Promise<RecognizerResult>;
    public async recognize(dialogContext: DialogContext, textOrActivity: Activity): Promise<RecognizerResult>;
    public async recognize(dialogContext: DialogContext, textOrActivity?: string | Activity, locale?: string): Promise<RecognizerResult> {
        let promises: Promise<RecognizerResult>[] = [];
        if (!textOrActivity) {
            promises = this.recognizers.map((recognizer: Recognizer): Promise<RecognizerResult> => {
                return recognizer.recognize(dialogContext);
            });
        } else if (typeof (textOrActivity) == 'object') {
            const activity: Activity = textOrActivity;
            promises = this.recognizers.map((recognizer: Recognizer): Promise<RecognizerResult> => {
                return recognizer.recognize(dialogContext, activity);
            });
        } else if (typeof (textOrActivity) == 'string') {
            const text = textOrActivity;
            promises = this.recognizers.map((recognizer: Recognizer): Promise<RecognizerResult> => {
                return recognizer.recognize(dialogContext, text, locale);
            });
        }

        let text: string;
        let alteredText: string;
        const intents = {};
        const entities = {};
        entities['$instance'] = {};

        const results = await Promise.all(promises);
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const { intent } = getTopScoringIntent(result);
            if (intent && intent != 'None') {
                // merge text
                if (!text) {
                    text = result.text;
                } else if (result.text != text) {
                    alteredText = text;
                }

                // merge intents
                for (const intentName in result.intents) {
                    const intentScore = result.intents[intentName].score;
                    if (intents.hasOwnProperty(intentName)) {
                        if (intentScore < intents[intentName].score) {
                            continue;
                        }
                    }
                    intents[intentName] = { score: intentScore };
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
                        if (!entities['$instance'].hasOwnProperty(entityName)) {
                            entities['$instance'][entityName] = [];
                        }
                        const entityValue = instanceData[entityName];
                        entities['$instance'][entityName].push(...entityValue);
                    }
                } else {
                    if (!entities.hasOwnProperty(property)) {
                        entities[property] = [];
                    }
                    const value = result.entities[property];
                    entities[property].push(...value);
                }
            }

        }

        if (Object.entries(intents).length == 0) {
            intents['None'] = { score: 1.0 };
        }

        const recognizerResult: RecognizerResult = { text, alteredText, intents, entities };
        return recognizerResult;
    }
}