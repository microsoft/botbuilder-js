/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, RecognizerResult } from 'botbuilder';
import LuisClient = require('botframework-luis');
/**
 * Settings used to configure an instance of `LuisRecognizer`.
 */
export interface LuisRecognizerSettings {
    /** Your models AppId */
    appId: string;
    /** Your subscription key. */
    subscriptionKey: string;
    /** (Optional) service endpoint to call. Defaults to "https://westus.api.cognitive.microsoft.com". */
    serviceEndpoint?: string;
    /** (Optional) if set to true, we return the metadata of the returned intents/entities. Defaults to true */
    verbose?: boolean;
    /** (Optional) request options passed to service call.  */
    options?: {
        timezoneOffset?: number;
        verbose?: boolean;
        forceSet?: string;
        allowSampling?: string;
        customHeaders?: {
            [headerName: string]: string;
        };
        staging?: boolean;
    };
}
/**
 * Component used to recognize intents in a user utterance using a configured LUIS model.
 *
 * @remarks
 * This component can be used within your bots logic by calling [recognize()](#recognize).
 */
export declare class LuisRecognizer {
    private settings;
    private luisClient;
    private cacheKey;
    /**
     * Creates a new LuisRecognizer instance.
     * @param settings Settings used to configure the instance.
     */
    constructor(settings: LuisRecognizerSettings);
    /**
     * Calls LUIS to recognize intents and entities in a users utterance.
     *
     * @remarks
     * In addition to returning the results from LUIS, [recognize()](#recognize) will also
     * emit a trace activity that contains the LUIS results.
     * @param context Context for the current turn of conversation with the use.
     */
    recognize(context: TurnContext): Promise<RecognizerResult>;
    /**
     * Called internally to create a LuisClient instance.
     *
     * @remarks
     * This is exposed to enable better unit testing of the recognizer.
     * @param baseUri Service endpoint being called.
     */
    protected createClient(baseUri: string): LuisClient;
    /**
     * Returns the name of the top scoring intent from a set of LUIS results.
     * @param results Result set to be searched.
     * @param defaultIntent (Optional) intent name to return should a top intent be found. Defaults to a value of `None`.
     * @param minScore (Optional) minimum score needed for an intent to be considered as a top intent. If all intents in the set are below this threshold then the `defaultIntent` will be returned.  Defaults to a value of `0.0`.
     */
    static topIntent(results: RecognizerResult | undefined, defaultIntent?: string, minScore?: number): string;
    private emitTraceInfo(context, luisResult, recognizerResult);
    private normalizeName(name);
    private getIntents(luisResult);
    private getEntitiesAndMetadata(entities, compositeEntities, verbose);
    private getEntityValue(entity);
    private getEntityMetadata(entity);
    private getNormalizedEntityName(entity);
    private populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
    /**
     * If a property doesn't exist add it to a new array, otherwise append it to the existing array
     * @param obj Object on which the property is to be set
     * @param key Property Key
     * @param value Property Value
     */
    private addProperty(obj, key, value);
}
