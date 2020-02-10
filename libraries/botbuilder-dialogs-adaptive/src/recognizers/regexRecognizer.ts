/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult, Entity, Activity, ActivityTypes } from 'botbuilder-core';
import { Configurable, DialogContext } from 'botbuilder-dialogs';
import { Recognizer } from './recognizer';
import { IntentPattern } from './intentPattern';
import { EntityRecognizer, TextEntity, EntityRecognizerSet } from './entityRecognizers';

export interface RegexRecognizerConfiguration {
    id?: string;
    intents?: IntentPattern[];
    entities?: EntityRecognizer[];
}

export class RegexRecognizer extends Configurable implements Recognizer {

    public static declarativeType = 'Microsoft.RegexRecognizer';

    /**
     * Id of the recognizer.
     */
    public id: string;

    /**
     * Dictionary of patterns -> intent names.
     */
    public intents: IntentPattern[] = [];

    /**
     * The entity recognizers.
     */
    public entities: EntityRecognizer[] = [];

    public configure(config: RegexRecognizerConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'intents':
                        this.intents = value.map((v: any): IntentPattern => new IntentPattern(v.intent, v.pattern));
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }
        return this;
    }

    public async recognize(dialogContext: DialogContext): Promise<RecognizerResult>;
    public async recognize(dialogContext: DialogContext, textOrActivity: Activity): Promise<RecognizerResult>;
    public async recognize(dialogContext: DialogContext, textOrActivity?: string | Activity, locale?: string): Promise<RecognizerResult> {
        let text = '';
        if (!textOrActivity) {
            const activity: Activity = dialogContext.context.activity;
            if (activity && activity.type == ActivityTypes.Message) {
                text = activity.text;
                locale = activity.locale;
            }
        } else if (typeof(textOrActivity) == 'object') {
            const activity: Activity = textOrActivity;
            if (activity.type == ActivityTypes.Message) {
                text = activity.text;
                locale = activity.locale;
            }
        } else if (typeof(textOrActivity) == 'string') {
            text = textOrActivity;
        }

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
            const matches = [...text.matchAll(intentPattern.regex)];
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
        return recognizerResult;
    }
}
