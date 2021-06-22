/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import fetch from 'node-fetch';
import { RequestInfo, RequestInit } from 'node-fetch';
import { LUISRuntimeModels as LuisModels } from '@azure/cognitiveservices-luis-runtime';
import { LuisApplication, LuisRecognizerOptionsV3 } from './luisRecognizer';
import { LuisRecognizerInternal } from './luisRecognizerOptions';
import { NullTelemetryClient, TurnContext, RecognizerResult } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { ExternalEntity, validateExternalEntity } from './externalEntity';
import { validateDynamicList } from './dynamicList';
import * as z from 'zod';

const LUIS_TRACE_TYPE = 'https://www.luis.ai/schemas/trace';
const LUIS_TRACE_NAME = 'LuisRecognizer';
const LUIS_TRACE_LABEL = 'LuisV3 Trace';
const _dateSubtypes = ['date', 'daterange', 'datetime', 'datetimerange', 'duration', 'set', 'time', 'timerange'];
const _geographySubtypes = ['poi', 'city', 'countryRegion', 'continent', 'state'];
const MetadataKey = '$instance';

/**
 * Validates if the options provided are valid [LuisRecognizerOptionsV3](xref:botbuilder-ai.LuisRecognizerOptionsV3).
 *
 * @param {any} options options to type test
 * @returns {boolean} A boolean value that indicates param options is a [LuisRecognizerOptionsV3](xref:botbuilder-ai.LuisRecognizerOptionsV3).
 */
export function isLuisRecognizerOptionsV3(options: unknown): options is LuisRecognizerOptionsV3 {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (options as any).apiVersion && (options as any).apiVersion === 'v3';
}

/**
 * Recognize intents in a user utterance using a configured LUIS model.
 */
export class LuisRecognizerV3 extends LuisRecognizerInternal {
    /**
     * Creates a new [LuisRecognizerV3](xref:botbuilder-ai.LuisRecognizerV3) instance.
     *
     * @param {LuisApplication} application An object conforming to the [LuisApplication](xref:botbuilder-ai.LuisApplication) definition or a string representing a LUIS application endpoint, usually retrieved from https://luis.ai.
     * @param {LuisRecognizerOptionsV3} options Optional. Options object used to control predictions. Should conform to the [LuisRecognizerOptionsV3](xref:botbuilder-ai.LuisRecognizerOptionsV3) definition.
     */
    constructor(application: LuisApplication, options?: LuisRecognizerOptionsV3) {
        super(application);

        this.predictionOptions = {
            includeAllIntents: false,
            includeInstanceData: true,
            log: true,
            preferExternalEntities: true,
            datetimeReference: '',
            slot: 'production',
            telemetryClient: new NullTelemetryClient(),
            logPersonalInformation: false,
            includeAPIResults: true,
            ...options,
        };
    }

    predictionOptions: LuisRecognizerOptionsV3;

    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     *
     * @param {TurnContext} context The [TurnContext](xref:botbuilder-core.TurnContext).
     * @returns {Promise<RecognizerResult>} Analysis of utterance in form of [RecognizerResult](xref:botbuilder-core.RecognizerResult).
     */
    async recognizeInternal(context: DialogContext | TurnContext): Promise<RecognizerResult>;

    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     *
     * @param {string} utterance The utterance to be recognized.
     */
    async recognizeInternal(utterance: string): Promise<RecognizerResult>;

    /**
     * @internal
     */
    async recognizeInternal(contextOrUtterance: DialogContext | TurnContext | string): Promise<RecognizerResult> {
        if (typeof contextOrUtterance === 'string') {
            const utterance = contextOrUtterance;
            return this.recognize(null, utterance, this.predictionOptions);
        } else {
            if (contextOrUtterance instanceof DialogContext) {
                const dialogContext = contextOrUtterance;
                const activity = dialogContext.context.activity;
                let options = this.predictionOptions;
                if (options.externalEntityRecognizer) {
                    // call external entity recognizer
                    const matches = await options.externalEntityRecognizer.recognize(dialogContext, activity);
                    // TODO: checking for 'text' because we get an extra non-real entity from the text recognizers
                    if (matches.entities && Object.entries(matches.entities).length) {
                        options = {
                            apiVersion: 'v3',
                            externalEntities: [],
                        };
                        const entities = matches.entities;
                        const instance = entities['$instance'];
                        if (instance) {
                            Object.entries(entities)
                                .filter(([key, _value]) => key !== 'text' && key !== '$instance')
                                .reduce((externalEntities: ExternalEntity[], [key, value]) => {
                                    const instances: unknown[] = instance[`${key}`];
                                    const values: unknown[] = Array.isArray(value) ? value : [];
                                    if (instances?.length === values?.length) {
                                        instances.forEach((childInstance) => {
                                            if (
                                                z
                                                    .object({ startIndex: z.number(), endIndex: z.number() })
                                                    .nonstrict()
                                                    .check(childInstance)
                                            ) {
                                                const start = childInstance.startIndex;
                                                const end = childInstance.endIndex;
                                                externalEntities.push({
                                                    entityName: key,
                                                    startIndex: start,
                                                    entityLength: end - start,
                                                    resolution: value,
                                                });
                                            }
                                        });
                                    }
                                    return externalEntities;
                                }, options.externalEntities);
                        }
                    }
                }
                // call luis recognizer with options.externalEntities populated from externalEntityRecognizer
                return this.recognize(dialogContext.context, activity?.text ?? '', options);
            } else {
                const turnContext = contextOrUtterance;
                return this.recognize(turnContext, turnContext?.activity?.text ?? '', this.predictionOptions);
            }
        }
    }

    private async recognize(
        context: TurnContext,
        utterance: string,
        options: LuisRecognizerOptionsV3
    ): Promise<RecognizerResult> {
        if (!utterance.trim()) {
            // Bypass LUIS if the activity's text is null or whitespace
            return Promise.resolve({
                text: utterance,
                intents: {},
                entities: {},
            });
        }

        const uri = this.buildUrl(options);
        const httpOptions = this.buildRequestBody(utterance, options);

        const data = await fetch(uri, httpOptions);
        const response = await data.json();
        if (response.error) {
            const errObj = response.error;
            const errMessage = errObj.code ? `${errObj.code}: ${errObj.message}` : errObj.message;
            throw new Error(`[LUIS Recognition Error]: ${errMessage}`);
        }

        const result: RecognizerResult = {
            text: utterance,
            intents: getIntents(response.prediction),
            entities: extractEntitiesAndMetadata(response.prediction),
            sentiment: getSentiment(response.prediction),
            luisResult: this.predictionOptions.includeAPIResults ? response : null,
        };

        if (this.predictionOptions.includeInstanceData) {
            result.entities[MetadataKey] = result.entities[MetadataKey] ? result.entities[MetadataKey] : {};
        }

        // Intentionally not using "context != null" (loose inequality) check here because context should explicitly be null from the
        // internal recognizeInternal() "if (typeof contextOrUtterance === 'string')" block. This route is taken
        // when recognize is called with a string utterance and not a TurnContext. So, if context is undefined (not null)
        // at this point, we have a bigger issue that needs to be caught.
        if (context !== null) {
            this.emitTraceInfo(context, response.prediction, result, options);
        }

        return result;
    }

    private buildUrl(options: LuisRecognizerOptionsV3): RequestInfo {
        const baseUri = this.application.endpoint || 'https://westus.api.cognitive.microsoft.com';
        let uri = `${baseUri}/luis/prediction/v3.0/apps/${this.application.applicationId}`;

        if (options.version) {
            uri += `/versions/${options.version}/predict`;
        } else {
            uri += `/slots/${options.slot}/predict`;
        }

        const params = `?verbose=${options.includeInstanceData}&log=${options.log}&show-all-intents=${options.includeAllIntents}`;

        uri += params;
        return uri;
    }

    private buildRequestBody(utterance: string, options: LuisRecognizerOptionsV3): RequestInit {
        const content = {
            query: utterance,
            options: {
                preferExternalEntities: options.preferExternalEntities,
            },
        };

        if (options.datetimeReference) {
            content.options['datetimeReference'] = options.datetimeReference;
        }

        if (options.dynamicLists) {
            options.dynamicLists.forEach((list) => validateDynamicList(list));
            content['dynamicLists'] = options.dynamicLists;
        }

        if (options.externalEntities) {
            options.externalEntities.forEach((entity) => validateExternalEntity(entity));
            content['externalEntities'] = options.externalEntities;
        }

        return {
            method: 'POST',
            body: JSON.stringify(content),
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': this.application.endpointKey,
            },
        };
    }

    private emitTraceInfo(
        context: TurnContext,
        luisResult: LuisModels.LuisResult,
        recognizerResult: RecognizerResult,
        options: LuisRecognizerOptionsV3
    ): Promise<unknown> {
        const traceInfo = {
            recognizerResult: recognizerResult,
            luisResult: luisResult,
            luisOptions: options,
            luisModel: {
                ModelID: this.application.applicationId,
            },
        };

        return context.sendActivity({
            type: 'trace',
            valueType: LUIS_TRACE_TYPE,
            name: LUIS_TRACE_NAME,
            label: LUIS_TRACE_LABEL,
            value: traceInfo,
        });
    }
}

function normalizeName(name) {
    return name.replace(/\.| /g, '_');
}

function getIntents(luisResult) {
    // let intents: { [name: string]: { score: number } } = {};
    const intents = {};
    if (luisResult.intents) {
        for (const intent in luisResult.intents) {
            intents[normalizeName(intent)] = { score: luisResult.intents[intent].score };
        }
    }

    return intents;
}

function normalizeEntity(entity) {
    const splitEntity = entity.split(':');
    const entityName = splitEntity[splitEntity.length - 1];
    return entityName.replace(/\.| /g, '_');
}

function mapProperties(source, inInstance) {
    let result = source;
    if (source instanceof Array) {
        const narr = [];
        for (const item of source) {
            // Check if element is geographyV2
            let isGeographyV2 = '';
            if (item['type'] && _geographySubtypes.includes(item['type'])) {
                isGeographyV2 = item['type'];
            }

            if (!inInstance && isGeographyV2) {
                const geoEntity: Partial<Record<'location' | 'type', string>> = {};
                for (const itemProps in item) {
                    if (itemProps === 'value') {
                        geoEntity.location = item[itemProps];
                    }
                }
                geoEntity.type = isGeographyV2;
                narr.push(geoEntity);
            } else {
                narr.push(mapProperties(item, inInstance));
            }
        }
        result = narr;
    } else if (source instanceof Object && typeof source !== 'string') {
        const nobj: Partial<{
            datetime: unknown;
            datetimeV1: unknown;
            type: string;
            timex: unknown[];
            units: unknown;
        }> = {};

        // Fix datetime by reverting to simple timex
        if (!inInstance && source.type && typeof source.type === 'string' && _dateSubtypes.includes(source.type)) {
            const timexs = source.values;
            const arr = [];
            if (timexs) {
                const unique = [];
                for (const elt of timexs) {
                    if (elt.timex && !unique.includes(elt.timex)) {
                        unique.push(elt.timex);
                    }
                }

                for (const timex of unique) {
                    arr.push(timex);
                }

                nobj.timex = arr;
            }

            nobj.type = source.type;
        } else {
            // Map or remove properties
            for (const property in source) {
                const name = normalizeEntity(property);
                const isArray = source[property] instanceof Array;
                const isString = typeof source[property] === 'string';
                const isInt = Number.isInteger(source[property]);
                const val = mapProperties(source[property], inInstance || property == MetadataKey);
                if (name == 'datetime' && isArray) {
                    nobj.datetimeV1 = val;
                } else if (name == 'datetimeV2' && isArray) {
                    nobj.datetime = val;
                } else if (inInstance) {
                    // Correct $instance issues
                    if (name == 'length' && isInt) {
                        nobj['endIndex'] = source[name] + source.startIndex;
                    } else if (!((isInt && name === 'modelTypeId') || (isString && name === 'role'))) {
                        nobj[name] = val;
                    }
                } else {
                    // Correct non-$instance values
                    if (name == 'unit' && isString) {
                        nobj.units = val;
                    } else {
                        nobj[name] = val;
                    }
                }
            }
        }
        result = nobj;
    }
    return result;
}

function extractEntitiesAndMetadata(prediction) {
    const entities = prediction.entities;
    return mapProperties(entities, false);
}

function getSentiment(luis): Record<'label' | 'score', unknown> | undefined {
    if (luis.sentiment) {
        return {
            label: luis.sentiment.label,
            score: luis.sentiment.score,
        };
    }
}
