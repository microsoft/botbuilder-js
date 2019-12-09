/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LUISRuntimeClient as LuisClient, LUISRuntimeModels as LuisModels } from '@azure/cognitiveservices-luis-runtime';
import * as msRest from '@azure/ms-rest-js';
import { LuisRecognizerInternal } from './luisRecognizerOptions'
import { LuisApplication, LuisRecognizerOptionsV2} from './luisRecognizer'
import { NullTelemetryClient, TurnContext, RecognizerResult } from 'botbuilder-core';
import * as os from 'os';
const pjson = require('../package.json');
const LUIS_TRACE_TYPE = 'https://www.luis.ai/schemas/trace';
const LUIS_TRACE_NAME = 'LuisRecognizer';
const LUIS_TRACE_LABEL = 'Luis Trace';



export function isLuisRecognizerOptionsV2(options: any): options is LuisRecognizerOptionsV2 {
    return (options.apiVersion && options.apiVersion === "v2");
}

export class LuisRecognizerV2 extends LuisRecognizerInternal {  
    constructor (application: LuisApplication, options?: LuisRecognizerOptionsV2) { 
        super(application);
        // Create client
        // - We have to cast "creds as any" to avoid a build break relating to different versions
        //   of autorest being used by our various components.  This is just a build issue and
        //   shouldn't effect production bots.
        const creds: msRest.TokenCredentials = new msRest.TokenCredentials(application.endpointKey);
        const baseUri: string = application.endpoint || 'https://westus.api.cognitive.microsoft.com';
        this.luisClient = new LuisClient(creds as any, baseUri);

        this.options = {
            includeAllIntents: false,
            includeInstanceData: true,
            log: true,
            spellCheck: false,
            staging: false,
            telemetryClient: new NullTelemetryClient(), 
            logPersonalInformation: false, 
            includeAPIResults: true,
            ...options
        };
    }

    public options: LuisRecognizerOptionsV2;

    private luisClient: LuisClient;

    async recognizeInternalAsync(context: TurnContext): Promise<RecognizerResult> {
        const luisPredictionOptions = this.options;
        const utterance: string = context.activity.text || '';

        if (!utterance.trim()) {
            // Bypass LUIS if the activity's text is null or whitespace
            return {
                text: utterance,
                intents: { '': { score: 1 } },
                entities: {},
            };
        }
        
        const luisResult: LuisModels.LuisResult  = await this.luisClient.prediction.resolve(
            this.application.applicationId, utterance,
            {
                verbose: luisPredictionOptions.includeAllIntents,
                customHeaders: {
                    'Ocp-Apim-Subscription-Key': this.application.endpointKey,
                    'User-Agent': this.getUserAgent()
                },
                ...luisPredictionOptions
            })
        // Map results
        const result = {
            text: luisResult.query,
            alteredText: luisResult.alteredQuery,
            intents: this.getIntents(luisResult),
            entities: this.getEntitiesAndMetadata(
                luisResult.entities,
                luisResult.compositeEntities,
                luisPredictionOptions.includeInstanceData === undefined || luisPredictionOptions.includeInstanceData
            ),
            sentiment: this.getSentiment(luisResult),
            luisResult: (luisPredictionOptions.includeAPIResults ? luisResult : null)
        };

        this.emitTraceInfo(context, luisResult, result);
        return result;
    }

    private normalizeName(name: string): string {
        return name.replace(/\.| /g, '_');
    }

    private getIntents(luisResult: LuisModels.LuisResult): any {
        const intents: { [name: string]: { score: number } } = {};
        if (luisResult.intents) {
            luisResult.intents.reduce(
                (prev: any, curr: LuisModels.IntentModel) => {
                    prev[this.normalizeName(curr.intent)] = { score: curr.score };

                    return prev;
                },
                intents
            );
        } else {
            const topScoringIntent: LuisModels.IntentModel = luisResult.topScoringIntent;
            intents[this.normalizeName((topScoringIntent).intent)] = { score: topScoringIntent.score };
        }

        return intents;
    }

    private getEntitiesAndMetadata(
        entities: LuisModels.EntityModel[],
        compositeEntities: LuisModels.CompositeEntityModel[] | undefined,
        verbose: boolean
    ): any {
        const entitiesAndMetadata: any = verbose ? { $instance: {} } : {};
        let compositeEntityTypes: string[] = [];

        // We start by populating composite entities so that entities covered by them are removed from the entities list
        if (compositeEntities) {
            compositeEntityTypes = compositeEntities.map((compositeEntity: LuisModels.CompositeEntityModel) => compositeEntity.parentType);
            compositeEntities.forEach((compositeEntity: LuisModels.CompositeEntityModel) => {
                entities = this.populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
            });
        }

        entities.forEach((entity: LuisModels.EntityModel) => {
            // we'll address composite entities separately
            if (compositeEntityTypes.indexOf(entity.type) > -1) {
                return;
            }

            let val = this.getEntityValue(entity);
            if (val != null) {
                this.addProperty(entitiesAndMetadata, this.getNormalizedEntityName(entity), val);
                if (verbose) {
                    this.addProperty(entitiesAndMetadata.$instance, this.getNormalizedEntityName(entity), this.getEntityMetadata(entity));
                }
            }
        });

        return entitiesAndMetadata;
    }

    private populateCompositeEntity(
        compositeEntity: LuisModels.CompositeEntityModel,
        entities: LuisModels.EntityModel[],
        entitiesAndMetadata: any,
        verbose: boolean
    ): LuisModels.EntityModel[] {
        const childrenEntities: any = verbose ? { $instance: {} } : {};
        let childrenEntitiesMetadata: any = {};

        // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
        const compositeEntityMetadata: LuisModels.EntityModel | undefined = entities.find((entity: LuisModels.EntityModel) => {
            // For now we are matching by value, which can be ambiguous if the same composite entity shows up with the same text
            // multiple times within an utterance, but this is just a stop gap solution till the indices are included in composite entities
            return entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value;
        });

        const filteredEntities: LuisModels.EntityModel[] = [];
        if (verbose) {
            childrenEntitiesMetadata = this.getEntityMetadata(compositeEntityMetadata);
        }

        // This is now implemented as O(n*k) search and can be reduced to O(n + k) using a map as an optimization if n or k grow
        const coveredSet: Set<any> = new Set();
        compositeEntity.children.forEach((childEntity: LuisModels.CompositeChildModel) => {
            for (let i = 0; i < entities.length; i++) {
                const entity: LuisModels.EntityModel = entities[i];
                if (!coveredSet.has(i) &&
                    childEntity.type === entity.type &&
                    compositeEntityMetadata &&
                    entity.startIndex !== undefined &&
                    compositeEntityMetadata.startIndex !== undefined &&
                    entity.startIndex >= compositeEntityMetadata.startIndex &&
                    entity.endIndex !== undefined &&
                    compositeEntityMetadata.endIndex !== undefined &&
                    entity.endIndex <= compositeEntityMetadata.endIndex
                ) {

                    // Add to the set to ensure that we don't consider the same child entity more than once per composite
                    coveredSet.add(i);

                    const val = this.getEntityValue(entity);
                    if (val != null) {
                        this.addProperty(childrenEntities, this.getNormalizedEntityName(entity), val);
                        if (verbose) {
                            this.addProperty(childrenEntities.$instance, this.getNormalizedEntityName(entity), this.getEntityMetadata(entity));
                        }
                    }
                }
            }
        });

        // filter entities that were covered by this composite entity
        for (let i = 0; i < entities.length; i++) {
            if (!coveredSet.has(i)) {
                filteredEntities.push(entities[i]);
            }
        }

        this.addProperty(entitiesAndMetadata, this.getNormalizedEntityName(compositeEntityMetadata), childrenEntities);
        if (verbose) {
            this.addProperty(entitiesAndMetadata.$instance, this.getNormalizedEntityName(compositeEntityMetadata), childrenEntitiesMetadata);
        }

        return filteredEntities;
    }

    private getEntityValue(entity: LuisModels.EntityModel): any {
        if (entity.type.startsWith('builtin.geographyV2.')) {
            return {
                'type': entity.type.substring(20),
                'location': entity.entity
            };
        }

        if (entity.type.startsWith('builtin.ordinalV2')) {
            return {
                'relativeTo': entity.resolution.relativeTo,
                'offset': Number(entity.resolution.offset)
            }
        }

        if (!entity.resolution) {
            return entity.entity;
        }

        if (entity.type.startsWith('builtin.datetimeV2.')) {
            if (!entity.resolution.values || !entity.resolution.values.length) {
                return entity.resolution;
            }

            const vals: any = entity.resolution.values;
            const type: any = vals[0].type;
            const timexes: any[] = vals.map((t: any) => t.timex);
            const distinct: any = timexes.filter((v: any, i: number, a: any[]) => a.indexOf(v) === i);

            return { type: type, timex: distinct };
        } else {
            const res: any = entity.resolution;
            switch (entity.type) {
                case 'builtin.number':
                case 'builtin.ordinal': return Number(res.value);
                case 'builtin.percentage':
                    {
                        let svalue: string = res.value;
                        if (svalue.endsWith('%')) {
                            svalue = svalue.substring(0, svalue.length - 1);
                        }

                        return Number(svalue);
                    }
                case 'builtin.age':
                case 'builtin.dimension':
                case 'builtin.currency':
                case 'builtin.temperature':
                    {
                        const val: any = res.value;
                        const obj: any = {};
                        if (val) {
                            obj.number = Number(val);
                        }
                        obj.units = res.unit;

                        return obj;
                    }
                default:
                    // This will return null if there is no value/values which can happen when a new prebuilt is introduced
                    return entity.resolution.value ?
                        entity.resolution.value :
                        entity.resolution.values;
            }
        }
    }

    private getEntityMetadata(entity: LuisModels.EntityModel): any {
        const res: any = {
            startIndex: entity.startIndex,
            endIndex: entity.endIndex + 1,
            score: entity.score,
            text: entity.entity,
            type: entity.type
        };
        if (entity.resolution && entity.resolution.subtype) {
            res.subtype = entity.resolution.subtype;
        }

        return res;
    }

    private getNormalizedEntityName(entity: LuisModels.EntityModel): string {
        // Type::Role -> Role
        let type: string = entity.type.split(':').pop();
        if (type.startsWith('builtin.datetimeV2.')) {
            type = 'datetime';
        }
        else if (type.startsWith('builtin.currency')) {
            type = 'money';
        }
        else if (type.startsWith('builtin.geographyV2')) {
            type = 'geographyV2';
        }
        else if (type.startsWith('builtin.ordinalV2')) {
            type = 'ordinalV2';
        }
        else if (type.startsWith('builtin.')) {
            type = type.substring(8);
        }
        if (entity.role !== null && entity.role !== '' && entity.role !== undefined) {
            type = entity.role;
        }

        return type.replace(/\.|\s/g, '_');
    }

        /**
     * If a property doesn't exist add it to a new array, otherwise append it to the existing array
     * @param obj Object on which the property is to be set
     * @param key Property Key
     * @param value Property Value
     */
    private addProperty(obj: any, key: string, value: any): void {
        if (key in obj) {
            obj[key] = obj[key].concat(value);
        } else {
            obj[key] = [value];
        }
    }


    private getSentiment(luis: LuisModels.LuisResult): any {
        let result: any;
        if (luis.sentimentAnalysis) {
            result = {
                label: luis.sentimentAnalysis.label,
                score: luis.sentimentAnalysis.score
            };
        }

        return result;
    }

    private getUserAgent(): string {

        // Note when the ms-rest dependency the LuisClient uses has been updated
        // this code should be modified to use the client's addUserAgentInfo() function.

        const packageUserAgent = `${pjson.name}/${pjson.version}`;
        const platformUserAgent = `(${os.arch()}-${os.type()}-${os.release()}; Node.js,Version=${process.version})`;
        const userAgent = `${packageUserAgent} ${platformUserAgent}`;

        return userAgent;
    }

    private emitTraceInfo(context: TurnContext, luisResult: LuisModels.LuisResult, recognizerResult: RecognizerResult): Promise<any> {
        const traceInfo: any = {
            recognizerResult: recognizerResult,
            luisResult: luisResult,
            luisOptions: {
                Staging: this.options.staging
            },
            luisModel: {
                ModelID: this.application.applicationId
            }
        };

        return context.sendActivity({
            type: 'trace',
            valueType: LUIS_TRACE_TYPE,
            name: LUIS_TRACE_NAME,
            label: LUIS_TRACE_LABEL,
            value: traceInfo
        });
    }

}