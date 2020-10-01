/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult, Entity, Activity } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { Recognizer } from './recognizer';
import { IntentPattern } from './intentPattern';
import { EntityRecognizer, TextEntity, EntityRecognizerSet } from './entityRecognizers';

/**
 * Recognizer implementation which uses regex expressions to identify intents.
 */
export class RegexRecognizer extends Recognizer {
    /**
     * Dictionary of patterns -> intent names.
     */
    public intents: IntentPattern[] = [];

    /**
     * The entity recognizers.
     */
    public entities: EntityRecognizer[] = [];

    /**
     * Runs current `DialogContext.context.activity` through a recognizer and returns a `RecognizerResult`.
     * @param dialogContext The `DialogContext` for the current turn of conversation.
     * @param activity The `Activity` to recognize.
     * @param telemetryProperties Optional. Additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Optional. Additional metrics to be logged to telemetry with the LuisResult event.
     * @returns Recognized `RecognizerResult` Promise.
     */
    public async recognize(dialogContext: DialogContext, activity: Activity, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }): Promise<RecognizerResult> {
        const text = activity.text || '';
        const locale = activity.locale || 'en-us';

        const recognizerResult: RecognizerResult = {
            text: text,
            intents: {},
            entities: {}
        };

        const entityPool: Entity[] = [];

        const textEntity = new TextEntity(text);
        textEntity['start'] = 0;
        textEntity['end'] = text.length;
        textEntity['score'] = 1.0;

        entityPool.push(textEntity);

        for (let i = 0; i < this.intents.length; i++) {
            const intentPattern = this.intents[i];

            const matches = [];
            let matched: RegExpExecArray;
            const regexp = intentPattern.regex;
            while (matched = regexp.exec(text)) {
                matches.push(matched);
                if (regexp.lastIndex == text.length) {
                    break; // to avoid infinite loop
                }
            }

            if (matches.length > 0) {
                const intentKey = intentPattern.intent.split(' ').join('_');
                if (!recognizerResult.intents.hasOwnProperty(intentKey)) {
                    recognizerResult.intents[intentKey] = { score: 1.0 };
                    recognizerResult.intents[intentKey]['pattern'] = intentPattern.pattern;
                }

                for (let j = 0; j < matches.length; j++) {
                    const match = matches[j];
                    if (match.groups) {
                        for (const name in match.groups) {
                            const text = match.groups[name];
                            if (text) {
                                const entity: Entity = {
                                    type: name,
                                };
                                entity['text'] = text;
                                entity['start'] = match.index;
                                entity['end'] = match.index + text.length;
                                entityPool.push(entity);
                            }
                        }
                    }
                }

                break;
            }
        }

        if (this.entities) {
            const entitySet = new EntityRecognizerSet();
            entitySet.push(...this.entities);
            const newEntities = await entitySet.recognizeEntities(dialogContext, text, locale, entityPool);
            if (newEntities.length > 0) {
                entityPool.push(...newEntities);
            }
        }

        for (let i = 0; i < entityPool.length; i++) {
            const entityResult = entityPool[i];
            let values = [];
            if (!recognizerResult.entities.hasOwnProperty(entityResult.type)) {
                recognizerResult.entities[entityResult.type] = values;
            } else {
                values = recognizerResult.entities[entityResult.type];
            }
            values.push(entityResult['text']);

            let instanceRoot = {};
            if (!recognizerResult.entities.hasOwnProperty('$instance')) {
                recognizerResult.entities['$instance'] = instanceRoot;
            } else {
                instanceRoot = recognizerResult.entities['$instance'];
            }

            let instanceData = [];
            if (!instanceRoot.hasOwnProperty(entityResult.type)) {
                instanceRoot[entityResult.type] = instanceData;
            } else {
                instanceData = instanceRoot[entityResult.type];
            }

            const instance = {
                startIndex: entityResult['start'],
                endIndex: entityResult['end'],
                score: 1.0,
                text: entityResult['text'],
                type: entityResult['type'],
                resolution: entityResult['resolution']
            };
            instanceData.push(instance);
        }

        if (Object.entries(recognizerResult.intents).length == 0) {
            recognizerResult.intents['None'] = { score: 1.0 };
        }

        await dialogContext.context.sendTraceActivity('RegexRecognizer', recognizerResult, 'RecognizerResult', 'Regex RecognizerResult');
        this.trackRecognizerResult(dialogContext, 'RegexRecognizerResult', this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties), telemetryMetrics);
        return recognizerResult;
    }
}
