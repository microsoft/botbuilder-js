/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, RecognizerResult } from 'botbuilder';
import { LuisResult, IntentModel, EntityModel, CompositeEntityModel } from '../generated/lib/models';
import { LuisClient } from '../generated';

const LUIS_TRACE_TYPE = 'https://www.luis.ai/schemas/trace';
const LUIS_TRACE_NAME = 'LuisRecognizer';
const LUIS_TRACE_LABEL = 'Luis Trace';

/**
 * @private
 */
interface LuisOptions {
    Staging?: boolean;
}

/**
 * @private
 */
interface LuisModel {
    ModelID: string,
}

/**
 * @private
 */
interface LuisTraceInfo {
    recognizerResult: RecognizerResult;
    luisResult: LuisResult;
    luisOptions: LuisOptions;
    luisModel: LuisModel;
}

/**
 * Description of a LUIS application used for initializing a LuisRecognizer.
 */
export interface LuisApplication {
    /** Your models application Id from LUIS */
    applicationId: string;

    /** (Optional) Azure region */
    azureRegion?: string;

    /** Endpoint key for talking to LUIS */
    endpointKey: string;
}

/**
 * Options per LUIS prediction.
 */
export interface LuisPredictionOptions {
    /** (Optional) Bing Spell Check subscription key. */
    bingSpellCheckSubscriptionKey?: string;

    /** (Optional) Determine if all intents come back or only the top one. */
    includeAllIntents?: boolean;

    /** (Optional) A value indicating whether or not instance data should be included in response. */
    includeInstanceData?: boolean;

    /** (Optional) If queries should be logged in LUIS. */
    log?: boolean;

    /** (Optional) Whether to spell check query. */
    spellCheck?: boolean;

    /** (Optional) Whether to use the staging endpoint. */
    staging?: boolean;

    /** (Optional) The time zone offset for resolving datetimes. */
    timezoneOffset?: number;
}

/**
 * Component used to recognize intents in a user utterance using a configured LUIS model.
 *
 * @remarks
 * This component can be used within your bots logic by calling [recognize()](#recognize).
 */
export class LuisRecognizer {
    private application: LuisApplication;
    private options: LuisPredictionOptions;
    private includeApiResults: boolean;

    private luisClient: LuisClient;
    private cacheKey = Symbol('results');

    /**
     * Creates a new LuisRecognizer instance.
     * @param application LUIS application to use.
     * @param options Options used to control predictions.
     */
    constructor(application: LuisApplication, options?: LuisPredictionOptions, includeApiResults?: boolean) {
        this.application = application;
        this.options = Object.assign({
            includeAllIntents: false,
            includeInstanceData: true,
            log: true,
            spellCheck: false,
            staging: false
        }, options);
        this.includeApiResults = !!includeApiResults;

        // Create client and override callbacks
        // TODO: Update this to the official SDK once available
        var baseUri = "https://" + (this.application.azureRegion || 'westus') + ".api.cognitive.microsoft.com";
        this.luisClient = new LuisClient(baseUri);
    }

    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     *
     * @remarks
     * In addition to returning the results from LUIS, [recognize()](#recognize) will also
     * emit a trace activity that contains the LUIS results.
     * @param context Context for the current turn of conversation with the use.
     */
    public recognize(context: TurnContext): Promise<RecognizerResult> {
        const cached = context.turnState.get(this.cacheKey);
        if (!cached) {
            const utterance = context.activity.text || '';
            return this.luisClient.prediction.resolve(
                this.application.applicationId, utterance,
                {
                    timezoneOffset: this.options.timezoneOffset,
                    verbose: this.options.includeAllIntents,
                    log: this.options.log,
                    customHeaders: { "Ocp-Apim-Subscription-Key": this.application.endpointKey}
                }
            )
                .then((luisResult: LuisResult) => {
                    // Map results
                    const recognizerResult: RecognizerResult = {
                        text: luisResult.query,
                        alteredText: luisResult.alteredQuery,
                        intents: this.getIntents(luisResult),
                        entities: this.getEntitiesAndMetadata(luisResult.entities, luisResult.compositeEntities, this.options.includeInstanceData === undefined || this.options.includeInstanceData),
                        sentiment: this.getSentiment(luisResult),
                        luisResult: this.includeApiResults ? luisResult : null,
                    };

                    // Write to cache
                    context.turnState.set(this.cacheKey, recognizerResult);

                    return this.emitTraceInfo(context, luisResult, recognizerResult).then(() => {
                        return recognizerResult;
                    });
                });
        }
        return Promise.resolve(cached);
    }

    /**
     * Returns the name of the top scoring intent from a set of LUIS results.
     * @param results Result set to be searched.
     * @param defaultIntent (Optional) intent name to return should a top intent be found. Defaults to a value of `None`.
     * @param minScore (Optional) minimum score needed for an intent to be considered as a top intent. If all intents in the set are below this threshold then the `defaultIntent` will be returned.  Defaults to a value of `0.0`.  
     */
    static topIntent(results: RecognizerResult | undefined, defaultIntent = 'None', minScore = 0.0): string {
        let topIntent: string | undefined = undefined;
        let topScore = -1;
        if (results && results.intents) {
            for (const name in results.intents) {
                const score = results.intents[name].score;
                if (typeof score === 'number' && score > topScore && score >= minScore) {
                    topIntent = name;
                    topScore = score;
                }
            }
        }
        return topIntent || defaultIntent;
    }

    private emitTraceInfo(context: TurnContext, luisResult: LuisResult, recognizerResult: RecognizerResult): Promise<any> {
        const traceInfo: LuisTraceInfo = {
            recognizerResult: recognizerResult,
            luisResult: luisResult,
            luisOptions: {
                Staging: this.options.staging
            },
            luisModel: {
                ModelID: this.application.applicationId
            }
        }
        return context.sendActivity({
            type: 'trace',
            valueType: LUIS_TRACE_TYPE,
            name: LUIS_TRACE_NAME,
            label: LUIS_TRACE_LABEL,
            value: traceInfo
        });
    }

    private normalizeName(name: string): string {
        return name.replace(/\.| /g, '_');
    }

    private getIntents(luisResult: LuisResult): any {
        const intents: { [name: string]: { score: number }; } = {};
        if (luisResult.intents) {
            luisResult.intents.reduce((prev: any, curr: IntentModel) => {
                prev[this.normalizeName(curr.intent)] = { score: curr.score };
                return prev;
            }, intents);
        } else {
            const topScoringIntent = luisResult.topScoringIntent;
            intents[this.normalizeName((topScoringIntent).intent)] = { score: topScoringIntent.score };
        }
        return intents;
    }

    private getEntitiesAndMetadata(entities: EntityModel[], compositeEntities: CompositeEntityModel[] | undefined, verbose: boolean): any {
        let entitiesAndMetadata: any = verbose ? { $instance: {} } : {};
        let compositeEntityTypes: string[] = [];

        // We start by populating composite entities so that entities covered by them are removed from the entities list
        if (compositeEntities) {
            compositeEntityTypes = compositeEntities.map(compositeEntity => compositeEntity.parentType);
            compositeEntities.forEach(compositeEntity => {
                entities = this.populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
            });
        }

        entities.forEach(entity => {
            // we'll address composite entities separately
            if (compositeEntityTypes.indexOf(entity.type) > -1) {
                return;
            }

            this.addProperty(entitiesAndMetadata, this.getNormalizedEntityName(entity), this.getEntityValue(entity));
            if (verbose) {
                this.addProperty(entitiesAndMetadata.$instance, this.getNormalizedEntityName(entity), this.getEntityMetadata(entity));
            }
        });

        return entitiesAndMetadata;
    }

    private getEntityValue(entity: EntityModel): any {
        if (!entity.resolution) {
            return entity.entity;
        }

        if (entity.type.startsWith('builtin.datetimeV2.')) {
            if (!entity.resolution.values || !entity.resolution.values.length) {
                return entity.resolution;
            }

            var vals = entity.resolution.values;
            var type = vals[0].type;
            var timexes = vals.map(t => t.timex);
            var distinct = timexes.filter((v, i, a) => a.indexOf(v) === i);
            return { type: type, timex: distinct };
        }
        else {
            var res = entity.resolution;
            switch (entity.type) {
                case "builtin.number":
                case "builtin.ordinal": return Number(res.value);
                case "builtin.percentage":
                    {
                        var svalue = res.value;
                        if (svalue.endsWith("%")) {
                            svalue = svalue.substring(0, svalue.length - 1);
                        }
                        return Number(svalue);
                    }
                case "builtin.age":
                case "builtin.dimension":
                case "builtin.currency":
                case "builtin.temperature":
                    {
                        var val = res.value;
                        var obj = {};
                        if (val) {
                            obj["number"] = Number(val);
                        }
                        obj["units"] = res.unit;
                        return obj;
                    }
                default:
                    return Object.keys(entity.resolution).length > 1 ?
                        entity.resolution :
                        entity.resolution.value ?
                            entity.resolution.value :
                            entity.resolution.values;
            }
        }
    }

    private getEntityMetadata(entity: EntityModel): any {
        var res = {
            startIndex: entity.startIndex,
            endIndex: entity.endIndex + 1,
            score: entity.score,
            text: entity.entity,
            type: entity.type,
        };
        if (entity.resolution && entity.resolution.subtype) {
            res["subtype"] = entity.resolution.subtype;
        }
        return res;
    }

    private getNormalizedEntityName(entity: EntityModel): string {
        // Type::Role -> Role
        var type = entity.type.split(':').pop();
        if (type.startsWith("builtin.datetimeV2.")) {
            type = "datetime";
        }
        if (type.startsWith("builtin.currency")) {
            type = "money";
        }
        if (type.startsWith('builtin.')) {
            type = type.substring(8);
        }
        if (entity.role != null && entity.role != "") {
            type = entity.role;
        }
        return type.replace(/\.|\s/g, "_");
    }

    private populateCompositeEntity(compositeEntity: CompositeEntityModel, entities: EntityModel[], entitiesAndMetadata: any, verbose: boolean): EntityModel[] {
        let childrenEntites: any = verbose ? { $instance: {} } : {};
        let childrenEntitiesMetadata: any = {};

        // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
        let compositeEntityMetadata: EntityModel | undefined = entities.find(entity => {
            // For now we are matching by value, which can be ambiguous if the same composite entity shows up with the same text 
            // multiple times within an utterance, but this is just a stop gap solution till the indices are included in composite entities
            return entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value
        });

        let filteredEntities: EntityModel[] = [];
        if (verbose) {
            childrenEntitiesMetadata = this.getEntityMetadata(compositeEntityMetadata);
        }

        // This is now implemented as O(n*k) search and can be reduced to O(n + k) using a map as an optimization if n or k grow
        let coveredSet = new Set();
        compositeEntity.children.forEach(childEntity => {
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                if (!coveredSet.has(i) &&
                    childEntity.type === entity.type &&
                    compositeEntityMetadata &&
                    entity.startIndex != undefined && compositeEntityMetadata.startIndex != undefined && entity.startIndex >= compositeEntityMetadata.startIndex &&
                    entity.endIndex != undefined && compositeEntityMetadata.endIndex != undefined && entity.endIndex <= compositeEntityMetadata.endIndex) {

                    // Add to the set to ensure that we don't consider the same child entity more than once per composite
                    coveredSet.add(i);
                    this.addProperty(childrenEntites, this.getNormalizedEntityName(entity), this.getEntityValue(entity));

                    if (verbose)
                        this.addProperty(childrenEntites.$instance, this.getNormalizedEntityName(entity), this.getEntityMetadata(entity));
                }
            };
        });

        // filter entities that were covered by this composite entity
        for (let i = 0; i < entities.length; i++) {
            if (!coveredSet.has(i))
                filteredEntities.push(entities[i]);
        }

        this.addProperty(entitiesAndMetadata, compositeEntity.parentType, childrenEntites);
        if (verbose) {
            this.addProperty(entitiesAndMetadata.$instance, compositeEntity.parentType, childrenEntitiesMetadata);
        }

        return filteredEntities;
    }

    /**
     * If a property doesn't exist add it to a new array, otherwise append it to the existing array
     * @param obj Object on which the property is to be set
     * @param key Property Key
     * @param value Property Value
     */
    private addProperty(obj: any, key: string, value: any) {
        if (key in obj)
            obj[key] = obj[key].concat(value);
        else
            obj[key] = [value];
    }

    private getSentiment(luis: LuisResult) {
        var result;
        if (luis.sentimentAnalysis) {
            result = {
                "label": luis.sentimentAnalysis.label,
                "score": luis.sentimentAnalysis.score
            };
        }
        return result;
    }
}
