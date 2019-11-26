/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { LUISRuntimeClient as LuisClient, LUISRuntimeModels as LuisModels } from '@azure/cognitiveservices-luis-runtime';

import * as msRest from '@azure/ms-rest-js';
import { BotTelemetryClient, NullTelemetryClient, RecognizerResult, TurnContext } from 'botbuilder-core';
import * as os from 'os';
import * as Url from 'url-parse';
import { LuisTelemetryConstants } from './luisTelemetryConstants';

const pjson = require('../package.json');

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
    ModelID: string;
}

/**
 * @private
 */
interface LuisTraceInfo {
    recognizerResult: RecognizerResult;
    luisResult: LuisModels.LuisResult;
    luisOptions: LuisOptions;
    luisModel: LuisModel;
}

/**
 * Description of a LUIS application used for initializing a LuisRecognizer.
 */
export interface LuisApplication {
    /**
     * Your models application Id from LUIS
     */
    applicationId: string;

    /**
     *  (Optional) LUIS endpoint with a default of https://westus.api.cognitive.microsoft.com
     */
    endpoint?: string;

    /**
     * Endpoint key for talking to LUIS
     */
    endpointKey: string;
}

/**
 * Options per LUIS prediction.
 */
export interface LuisPredictionOptions extends LuisModels.PredictionResolveOptionalParams {
    /**
     * (Optional) Bing Spell Check subscription key.
     */
    bingSpellCheckSubscriptionKey?: string;

    /**
     * (Optional) Determine if all intents come back or only the top one.
     */
    includeAllIntents?: boolean;

    /**
     * (Optional) A value indicating whether or not instance data should be included in response.
     */
    includeInstanceData?: boolean;

    /**
     * (Optional) If queries should be logged in LUIS.
     */
    log?: boolean;

    /**
     * (Optional) Whether to spell check query.
     */
    spellCheck?: boolean;

    /**
     * (Optional) Whether to use the staging endpoint.
     */
    staging?: boolean;

    /**
     * (Optional) The time zone offset for resolving datetimes.
     */
    timezoneOffset?: number;

    /**
     * (Optional) Telemetry Client.
     */
    telemetryClient?: BotTelemetryClient;

    /**
     * (Optional) Designates whether personal information should be logged in telemetry.
     */
    logPersonalInformation?: boolean;
}

export interface LuisRecognizerTelemetryClient {
    /**
     * Gets a value indicating whether determines whether to log personal information that came from the user.
     */
    readonly logPersonalInformation: boolean;

    /**
     * Gets the currently configured botTelemetryClient that logs the events.
     */
    readonly telemetryClient: BotTelemetryClient;

    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     * @remarks
     * Returns a [RecognizerResult](../botbuilder-core/recognizerresult) containing any intents and entities recognized by LUIS.
     *
     * @param context Context for the current turn of conversation with the use.
     * @param telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Additional metrics to be logged to telemetry with the LuisResult event.
     */
    recognize(context: TurnContext, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }): Promise<RecognizerResult>;
}


/**
 * Recognize intents in a user utterance using a configured LUIS model.
 *
 * @remarks
 * This class is used to recognize intents and extract entities from incoming messages.
 * See this class in action [in this sample application](https://github.com/microsoft/BotBuilder-Samples/tree/master/samples/javascript_nodejs/14.nlp-with-dispatch).
 *
 * This component can be used within your bots logic by calling [recognize()](#recognize).
 */
export class LuisRecognizer implements LuisRecognizerTelemetryClient {
    private readonly _logPersonalInformation: boolean;
    private readonly _telemetryClient: BotTelemetryClient;

    private application: LuisApplication;
    private options: LuisPredictionOptions;
    private includeApiResults: boolean;

    private luisClient: LuisClient;
    private cacheKey: symbol = Symbol('results');

    /**
     * Creates a new LuisRecognizer instance.
     * @param application An object conforming to the [LuisApplication](#luisapplication) definition or a string representing a LUIS application endpoint, usually retrieved from https://luis.ai.
     * @param options (Optional) options object used to control predictions. Should conform to the [LuisPrectionOptions](#luispredictionoptions) definition.
     * @param includeApiResults (Optional) flag that if set to `true` will force the inclusion of LUIS Api call in results returned by [recognize()](#recognize). Defaults to a value of `false`.
     */
    constructor(application: string, options?: LuisPredictionOptions, includeApiResults?: boolean);
    constructor(application: LuisApplication, options?: LuisPredictionOptions, includeApiResults?: boolean);
    constructor(application: LuisApplication | string, options?: LuisPredictionOptions, includeApiResults?: boolean) {
        if (typeof application === 'string') {
            const parsedEndpoint: Url = Url(application);
            // Use exposed querystringify to parse the query string for the endpointKey value.
            const parsedQuery = Url.qs.parse(parsedEndpoint.query);
            this.application = {
                applicationId: parsedEndpoint.pathname.split('apps/')[1],
                // Note: The query string parser bundled with url-parse can return "null" as a value for the origin.
                endpoint: parsedEndpoint.origin,
                endpointKey: parsedQuery['subscription-key']
            };
        } else {
            const { applicationId, endpoint, endpointKey } = application;
            this.application = {
                applicationId: applicationId,
                endpoint: endpoint,
                endpointKey: endpointKey
            };
        }
        this.validateLuisApplication();

        this.options = {
            includeAllIntents: false,
            includeInstanceData: true,
            log: true,
            spellCheck: false,
            staging: false,
            ...options
        };
        this.includeApiResults = !!includeApiResults;

        // Create client
        // - We have to cast "creds as any" to avoid a build break relating to different versions
        //   of autorest being used by our various components.  This is just a build issue and
        //   shouldn't effect production bots.
        const creds: msRest.TokenCredentials = new msRest.TokenCredentials(this.application.endpointKey);
        const baseUri: string = this.application.endpoint || 'https://westus.api.cognitive.microsoft.com';
        this.luisClient = new LuisClient(creds as any, baseUri);

        this._telemetryClient = this.options.telemetryClient || new NullTelemetryClient();
        this._logPersonalInformation = this.options.logPersonalInformation || false;
    }

    /**
     * Gets a value indicating whether determines whether to log personal information that came from the user.
     */
    public get logPersonalInformation(): boolean { return this._logPersonalInformation; }

    /**
      * Gets the currently configured botTelemetryClient that logs the events.
      */
    public get telemetryClient(): BotTelemetryClient { return this._telemetryClient; }

    /**
     * Returns the name of the top scoring intent from a set of LUIS results.
     * @param results Result set to be searched.
     * @param defaultIntent (Optional) intent name to return should a top intent be found. Defaults to a value of `None`.
     * @param minScore (Optional) minimum score needed for an intent to be considered as a top intent. If all intents in the set are below this threshold then the `defaultIntent` will be returned.  Defaults to a value of `0.0`.
     */
    public static topIntent(results: RecognizerResult | undefined, defaultIntent: string = 'None', minScore: number = 0): string {
        let topIntent: string;
        let topScore: number = -1;
        if (results && results.intents) {
            // for (const name in results.intents) {
            Object.keys(results.intents).forEach((name: string) => {
                const score: any = results.intents[name].score;
                if (typeof score === 'number' && score > topScore && score >= minScore) {
                    topIntent = name;
                    topScore = score;
                }
            });
        }

        return topIntent || defaultIntent;
    }

    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     * @remarks
     * Returns a [RecognizerResult](../botbuilder-core/recognizerresult) containing any intents and entities recognized by LUIS.
     *
     * In addition to returning the results from LUIS, [recognize()](#recognize) will also
     * emit a trace activity that contains the LUIS results.
     *
     * Here is an example of recognize being used within a bot's turn handler: to interpret an incoming message:
     *
     * ```javascript
     * async onTurn(context) {
     *     if (turnContext.activity.type === ActivityTypes.Message) {
     *         const results = await luisRecognizer.recognize(turnContext);
     *         const topIntent = LuisRecognizer.topIntent(results);
     *         switch (topIntent) {
     *             case 'MyIntent':
     *                 // ... handle intent ...
     *                 break;
     *             case 'None':
     *                 // ... handle intent ...
     *                 break;
     *         }
     *     }
     * }
     * ```
     * @param context Context for the current turn of conversation with the use.
     * @param telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Additional metrics to be logged to telemetry with the LuisResult event.
     * @param options (Optional) options object used to control predictions. Should conform to the [LuisPrectionOptions](#luispredictionoptions) definition.
     */
    public recognize(context: TurnContext, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }, options?: LuisPredictionOptions): Promise<RecognizerResult> {
        const cached: any = context.turnState.get(this.cacheKey);
        const luisPredictionOptions = options ? this.setLuisPredictionOptions(this.options, options) : this.options;
        if (!cached) {
            const utterance: string = context.activity.text || '';
            let recognizerPromise: Promise<RecognizerResult>;

            if (!utterance.trim()) {
                // Bypass LUIS if the activity's text is null or whitespace
                recognizerPromise = Promise.resolve({
                    text: utterance,
                    intents: { '': { score: 1 } },
                    entities: {},
                });
            } else {
                recognizerPromise = this.luisClient.prediction.resolve(
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
                    .then((luisResult: LuisModels.LuisResult) => ({
                        text: luisResult.query,
                        alteredText: luisResult.alteredQuery,
                        intents: this.getIntents(luisResult),
                        entities: this.getEntitiesAndMetadata(
                            luisResult.entities,
                            luisResult.compositeEntities,
                            luisPredictionOptions.includeInstanceData === undefined || luisPredictionOptions.includeInstanceData
                        ),
                        sentiment: this.getSentiment(luisResult),
                        luisResult: (this.includeApiResults ? luisResult : null)
                    }));
            }

            return recognizerPromise
                .then((recognizerResult: RecognizerResult) => {
                    // Write to cache
                    context.turnState.set(this.cacheKey, recognizerResult);

                    // Log telemetry
                    this.onRecognizerResults(recognizerResult, context, telemetryProperties, telemetryMetrics);

                    return this.emitTraceInfo(context, recognizerResult.luisResult || null, recognizerResult).then(() => {
                        return recognizerResult;
                    });
                })
                .catch((error: any) => {
                    this.prepareErrorMessage(error);
                    throw error;
                });
        }

        return Promise.resolve(cached);
    }

    /**
     * Invoked prior to a LuisResult Event being logged.
     * @param recognizerResult The Luis Results for the call.
     * @param turnContext Context object containing information for a single turn of conversation with a user.
     * @param telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Additional metrics to be logged to telemetry with the LuisResult event.
     */
    protected async onRecognizerResults(recognizerResult: RecognizerResult, turnContext: TurnContext, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }): Promise<void> {
        await this.fillTelemetryProperties(recognizerResult, turnContext, telemetryProperties).then(props => {
            this.telemetryClient.trackEvent(
                {
                    name: LuisTelemetryConstants.luisResultEvent,
                    properties: props,
                    metrics: telemetryMetrics
                });
        });
        return;
    }

    /**
     * Fills the event properties for LuisResult event for telemetry.
     * These properties are logged when the recognizer is called.
     * @param recognizerResult Last activity sent from user.
     * @param turnContext Context object containing information for a single turn of conversation with a user.
     * @param telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @returns A dictionary that is sent as properties to BotTelemetryClient.trackEvent method for the LuisResult event.
     */
    protected async fillTelemetryProperties(recognizerResult: RecognizerResult, turnContext: TurnContext, telemetryProperties?: { [key: string]: string }): Promise<{ [key: string]: string }> {
        const topLuisIntent: string = LuisRecognizer.topIntent(recognizerResult);
        const intentScore: number = (recognizerResult.intents[topLuisIntent] && 'score' in recognizerResult.intents[topLuisIntent]) ?
            recognizerResult.intents[topLuisIntent].score : 0;

        // Add the intent score and conversation id properties
        const properties: { [key: string]: string } = {};
        properties[LuisTelemetryConstants.applicationIdProperty] = this.application.applicationId;
        properties[LuisTelemetryConstants.intentProperty] = topLuisIntent;
        properties[LuisTelemetryConstants.intentScoreProperty] = intentScore.toString();
        if (turnContext.activity.from) {
            properties[LuisTelemetryConstants.fromIdProperty] = turnContext.activity.from.id;;
        }

        if (recognizerResult.sentiment) {
            if (recognizerResult.sentiment.label) {
                properties[LuisTelemetryConstants.sentimentLabelProperty] = recognizerResult.sentiment.label;
            }

            if (recognizerResult.sentiment.score) {
                properties[LuisTelemetryConstants.sentimentScoreProperty] = recognizerResult.sentiment.score.toString();
            }
        }

        // Log entity names
        if (recognizerResult.entities) {
            properties[LuisTelemetryConstants.entitiesProperty] = JSON.stringify(recognizerResult.entities);
        }

        // Use the LogPersonalInformation flag to toggle logging PII data, text is a common example
        if (this.logPersonalInformation && turnContext.activity.text) {
            properties[LuisTelemetryConstants.questionProperty] = turnContext.activity.text;
        }

        // Additional Properties can override "stock" properties.
        if (telemetryProperties != null) {
            return Object.assign({}, properties, telemetryProperties);
        }

        return properties;
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
        const traceInfo: LuisTraceInfo = {
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

    private prepareErrorMessage(error: Error): void {
        // If the `error` received is a azure-cognitiveservices-luis-runtime error,
        // it may have a `response` property and `response.statusCode`.
        // If these properties exist, we should populate the error with a correct and informative error message.
        if ((error as any).response && (error as any).response.status) {
            switch ((error as any).response.status) {
                case 400:
                    error.message = [
                        `Response 400: The request's body or parameters are incorrect,`,
                        `meaning they are missing, malformed, or too large.`
                    ].join(' ');
                    break;
                case 401:
                    error.message = `Response 401: The key used is invalid, malformed, empty, or doesn't match the region.`;
                    break;
                case 403:
                    error.message = `Response 403: Total monthly key quota limit exceeded.`;
                    break;
                case 409:
                    error.message = `Response 409: Application loading in progress, please try again.`;
                    break;
                case 410:
                    error.message = `Response 410: Please retrain and republish your application.`;
                    break;
                case 414:
                    error.message = `Response 414: The query is too long. Please reduce the query length to 500 or less characters.`;
                    break;
                case 429:
                    error.message = `Response 429: Too many requests.`;
                    break;
                default:
                    error.message = [
                        `Response ${(error as any).response.status}: Unexpected status code received.`,
                        `Please verify that your LUIS application is properly setup.`
                    ].join(' ');
            }
        }
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

    private getEntityValue(entity: LuisModels.EntityModel): any {
        if (entity.type.startsWith("builtin.geographyV2.")) {
            return {
                "type": entity.type.substring(20),
                "location": entity.entity
            };
        }

        if (entity.type.startsWith('builtin.ordinalV2')) {
            return {
                "relativeTo": entity.resolution.relativeTo,
                "offset": Number(entity.resolution.offset)
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

                    let val = this.getEntityValue(entity);
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

    /**
     * Merges the default options set by the Recognizer contructor with the 'user' options passed into the 'recognize' method
    */
    private setLuisPredictionOptions(defaultOptions: LuisPredictionOptions, userOptions: LuisPredictionOptions): any {
        return Object.assign(defaultOptions, userOptions);
    }

    /**
     * Performs a series of valdiations on `LuisRecognizer.application`.
     * 
     * Note: Neither the LUIS Application ID nor the Endpoint Key are actual LUIS components, they are representations of what two valid values would appear as.
     */
    private validateLuisApplication(): void {
        if (!this.application.applicationId) {
            throw new Error(`Invalid \`applicationId\` value detected: ${this.application.applicationId}\nPlease make sure your applicationId is a valid LUIS Application Id, e.g. "b31aeaf3-3511-495b-a07f-571fc873214b".`);
        }
        if (!this.application.endpointKey) {
            throw new Error(`Invalid \`endpointKey\` value detected: ${this.application.endpointKey}\nPlease make sure your endpointKey is a valid LUIS Endpoint Key, e.g. "048ec46dc58e495482b0c447cfdbd291".`);
        }
    }
}
