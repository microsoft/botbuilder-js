/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as msRest from '@azure/ms-rest-js';
import * as os from 'os';
import { LuisApplication, LuisRecognizerOptionsV2 } from './luisRecognizer';
import { CompositeChildModel, CompositeEntityModel, EntityModel, LuisResult } from './luisV2-models/luisResult';
import { LUISRuntimeClientV2 as LuisClient } from './luisV2-models/luisRuntimeClientV2';
import { LuisRecognizerInternal } from './luisRecognizerOptions';
import { NullTelemetryClient, TurnContext, RecognizerResult } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pjson: Record<'name' | 'version', string> = require('../package.json');

const LUIS_TRACE_TYPE = 'https://www.luis.ai/schemas/trace';
const LUIS_TRACE_NAME = 'LuisRecognizer';
const LUIS_TRACE_LABEL = 'Luis Trace';

/**
 * Validates if the options provided are valid [LuisRecognizerOptionsV2](xref:botbuilder-ai.LuisRecognizerOptionsV2).
 *
 * @param {any} options options to type test
 * @returns {boolean} A boolean value that indicates param options is a [LuisRecognizerOptionsV2](xref:botbuilder-ai.LuisRecognizerOptionsV2).
 */
export function isLuisRecognizerOptionsV2(options: unknown): options is LuisRecognizerOptionsV2 {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (options as any).apiVersion && (options as any).apiVersion === 'v2';
}

/**
 * Recognize intents in a user utterance using a configured LUIS model.
 */
export class LuisRecognizerV2 extends LuisRecognizerInternal {
    /**
     * Creates a new [LuisRecognizerV2](xref:botbuilder-ai.LuisRecognizerV2) instance.
     *
     * @param {LuisApplication} application An object conforming to the [LuisApplication](xref:botbuilder-ai.LuisApplication) definition or a string representing a LUIS application endpoint, usually retrieved from https://luis.ai.
     * @param {LuisRecognizerOptionsV2} options Optional. Options object used to control predictions. Should conform to the [LuisRecognizerOptionsV2](xref:botbuilder-ai.LuisRecognizerOptionsV2) definition.
     */
    constructor(application: LuisApplication, options?: LuisRecognizerOptionsV2) {
        super(application);

        // Create client
        // - We have to cast "creds as any" to avoid a build break relating to different versions
        //   of autorest being used by our various components.  This is just a build issue and
        //   shouldn't effect production bots.
        const creds = new msRest.TokenCredentials(application.endpointKey);
        const baseUri = application.endpoint || 'https://westus.api.cognitive.microsoft.com';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            ...options,
        };
    }

    options: LuisRecognizerOptionsV2;

    private luisClient: LuisClient;

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
     * @returns {Promise<RecognizerResult>} Analysis of utterance in form of [RecognizerResult](xref:botbuilder-core.RecognizerResult).
     */
    async recognizeInternal(utterance: string): Promise<RecognizerResult>;

    /**
     * @internal
     */
    async recognizeInternal(contextOrUtterance: DialogContext | TurnContext | string): Promise<RecognizerResult> {
        let utterance: string;
        let context: TurnContext;

        if (typeof contextOrUtterance === 'string') {
            utterance = contextOrUtterance;
        } else {
            context = contextOrUtterance instanceof TurnContext ? contextOrUtterance : contextOrUtterance.context;
            utterance = context.activity.text || '';
        }

        if (!utterance.trim()) {
            // Bypass LUIS if the activity's text is null or whitespace
            return {
                text: utterance,
                intents: {},
                entities: {},
            };
        }

        const luisPredictionOptions = this.options;

        const luisResult: LuisResult = await this.luisClient.prediction.resolve(
            this.application.applicationId,
            utterance,
            {
                verbose: luisPredictionOptions.includeAllIntents,
                customHeaders: {
                    'Ocp-Apim-Subscription-Key': this.application.endpointKey,
                    'User-Agent': this.getUserAgent(),
                },
                ...luisPredictionOptions,
            }
        );
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
            luisResult: luisPredictionOptions.includeAPIResults ? luisResult : null,
        };

        if (context != null) {
            this.emitTraceInfo(context, luisResult, result);
        }

        return result;
    }

    // Remove role and ensure that dot and space are not a part of entity names since we want to do JSON paths.
    private normalizeName(name: string): string {
        return name.replace(/\.| /g, '_');
    }

    // Get Intents from a LuisResult object.
    private getIntents(luisResult: LuisResult): Record<string, Record<'score', number>> {
        const intents: { [name: string]: { score: number } } = {};
        if (luisResult.intents) {
            luisResult.intents.reduce((prev, curr) => {
                prev[this.normalizeName(curr.intent)] = { score: curr.score };
                return prev;
            }, intents);
        } else {
            const topScoringIntent = luisResult.topScoringIntent;
            intents[this.normalizeName(topScoringIntent.intent)] = { score: topScoringIntent.score };
        }

        return intents;
    }

    private getEntitiesAndMetadata(
        entities: EntityModel[],
        compositeEntities: CompositeEntityModel[] | undefined,
        verbose: boolean
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): any {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entitiesAndMetadata: any = verbose ? { $instance: {} } : {};
        let compositeEntityTypes: string[] = [];

        // We start by populating composite entities so that entities covered by them are removed from the entities list
        if (compositeEntities) {
            compositeEntityTypes = compositeEntities.map(
                (compositeEntity: CompositeEntityModel) => compositeEntity.parentType
            );
            compositeEntities.forEach((compositeEntity: CompositeEntityModel) => {
                entities = this.populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
            });
        }

        entities.forEach((entity: EntityModel) => {
            // we'll address composite entities separately
            if (compositeEntityTypes.indexOf(entity.type) > -1) {
                return;
            }

            const val = this.getEntityValue(entity);
            if (val != null) {
                this.addProperty(entitiesAndMetadata, this.getNormalizedEntityName(entity), val);
                if (verbose) {
                    this.addProperty(
                        entitiesAndMetadata.$instance,
                        this.getNormalizedEntityName(entity),
                        this.getEntityMetadata(entity)
                    );
                }
            }
        });

        return entitiesAndMetadata;
    }

    private populateCompositeEntity(
        compositeEntity: CompositeEntityModel,
        entities: EntityModel[],
        entitiesAndMetadata: any, // eslint-disable-line @typescript-eslint/no-explicit-any
        verbose: boolean
    ): EntityModel[] {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const childrenEntities: any = verbose ? { $instance: {} } : {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let childrenEntitiesMetadata: any = {};

        // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
        const compositeEntityMetadata: EntityModel | undefined = entities.find((entity: EntityModel) => {
            // For now we are matching by value, which can be ambiguous if the same composite entity shows up with the same text
            // multiple times within an utterance, but this is just a stop gap solution till the indices are included in composite entities
            return entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value;
        });

        const filteredEntities: EntityModel[] = [];
        if (verbose) {
            childrenEntitiesMetadata = this.getEntityMetadata(compositeEntityMetadata);
        }

        // This is now implemented as O(n*k) search and can be reduced to O(n + k) using a map as an optimization if n or k grow
        const coveredSet = new Set();
        compositeEntity.children.forEach((childEntity: CompositeChildModel) => {
            for (let i = 0; i < entities.length; i++) {
                const entity: EntityModel = entities[i];
                if (
                    !coveredSet.has(i) &&
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
                            this.addProperty(
                                childrenEntities.$instance,
                                this.getNormalizedEntityName(entity),
                                this.getEntityMetadata(entity)
                            );
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
            this.addProperty(
                entitiesAndMetadata.$instance,
                this.getNormalizedEntityName(compositeEntityMetadata),
                childrenEntitiesMetadata
            );
        }

        return filteredEntities;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private getEntityValue(entity: EntityModel): any {
        if (entity.type.startsWith('builtin.geographyV2.')) {
            return {
                type: entity.type.substring(20),
                location: entity.entity,
            };
        }

        if (entity.type.startsWith('builtin.ordinalV2')) {
            return {
                relativeTo: entity.resolution.relativeTo,
                offset: Number(entity.resolution.offset),
            };
        }

        if (!entity.resolution) {
            return entity.entity;
        }

        if (entity.type.startsWith('builtin.datetimeV2.')) {
            if (!entity.resolution.values || !entity.resolution.values.length) {
                return entity.resolution;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const vals: any = entity.resolution.values;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const type = vals[0].type;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const timexes = vals.map((t: any) => t.timex);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const distinct = timexes.filter((v, i, a) => a.indexOf(v) === i);

            return { type: type, timex: distinct };
        } else {
            const res = entity.resolution;
            switch (entity.type) {
                case 'builtin.number':
                case 'builtin.ordinal':
                    return Number(res.value);
                case 'builtin.percentage': {
                    let svalue: string = res.value;
                    if (svalue.endsWith('%')) {
                        svalue = svalue.substring(0, svalue.length - 1);
                    }

                    return Number(svalue);
                }
                case 'builtin.age':
                case 'builtin.dimension':
                case 'builtin.currency':
                case 'builtin.temperature': {
                    const val = res.value;
                    const obj: Partial<Record<'number' | 'units', number>> = {};
                    if (val) {
                        obj.number = Number(val);
                    }
                    obj.units = res.unit;

                    return obj;
                }
                default:
                    // This will return null if there is no value/values which can happen when a new prebuilt is introduced
                    return entity.resolution.value ? entity.resolution.value : entity.resolution.values;
            }
        }
    }

    private getEntityMetadata(entity: EntityModel): Record<string, string | number> {
        const res: Record<string, string | number> = {
            startIndex: entity.startIndex,
            endIndex: entity.endIndex + 1,
            score: entity.score,
            text: entity.entity,
            type: entity.type,
        };
        if (entity.resolution && entity.resolution.subtype) {
            res.subtype = entity.resolution.subtype;
        }

        return res;
    }

    private getNormalizedEntityName(entity: EntityModel): string {
        // Type::Role -> Role
        let type = entity.type.split(':').pop();
        if (type.startsWith('builtin.datetimeV2.')) {
            type = 'datetime';
        } else if (type.startsWith('builtin.currency')) {
            type = 'money';
        } else if (type.startsWith('builtin.geographyV2')) {
            type = 'geographyV2';
        } else if (type.startsWith('builtin.ordinalV2')) {
            type = 'ordinalV2';
        } else if (type.startsWith('builtin.')) {
            type = type.substring(8);
        }
        if (entity.role !== null && entity.role !== '' && entity.role !== undefined) {
            type = entity.role;
        }

        return type.replace(/\.|\s/g, '_');
    }

    // If a property doesn't exist add it to a new array, otherwise append it to the existing array
    // eslint-disable-next-line @typescript-eslint/ban-types
    private addProperty(obj: object, key: string, value: unknown): void {
        if (key in obj) {
            obj[key] = obj[key].concat(value);
        } else {
            obj[key] = [value];
        }
    }

    private getSentiment(luis: LuisResult): Record<'label' | 'score', unknown> | undefined {
        if (luis.sentimentAnalysis) {
            return {
                label: luis.sentimentAnalysis.label,
                score: luis.sentimentAnalysis.score,
            };
        }
    }

    private getUserAgent(): string {
        // Note when the ms-rest dependency the LuisClient uses has been updated
        // this code should be modified to use the client's addUserAgentInfo() function.

        const packageUserAgent = `${pjson.name}/${pjson.version}`;
        const platformUserAgent = `(${os.arch()}-${os.type()}-${os.release()}; Node.js,Version=${process.version})`;
        const userAgent = `${packageUserAgent} ${platformUserAgent}`;

        return userAgent;
    }

    private emitTraceInfo(
        context: TurnContext,
        luisResult: LuisResult,
        recognizerResult: RecognizerResult
    ): Promise<unknown> {
        const traceInfo = {
            recognizerResult: recognizerResult,
            luisResult: luisResult,
            luisOptions: {
                Staging: this.options.staging,
            },
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
