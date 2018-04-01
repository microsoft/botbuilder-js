/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext } from 'botbuilder';
import LuisClient = require('botframework-luis');
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
    };
}
export interface LuisRecognizerResult {
    /** Utterance sent to LUIS */
    text: string;
    /** Intents recognized for the utterance. A map of intent names to score is returned. */
    intents: {
        [name: string]: number;
    };
    /** Entities  */
    entities: any;
}
export declare class LuisRecognizer implements Middleware {
    private settings;
    private luisClient;
    private cacheKey;
    /**
     * Creates a new LuisRecognizer instance.
     * @param settings Settings used to configure the instance.
     */
    constructor(settings: LuisRecognizerSettings);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    /**
     * Returns the results cached from a previous call to [recognize()](#recognize) for the current
     * turn with the user.  This will return `undefined` if recognize() hasn't been called for the
     * current turn.
     * @param context Context for the current turn of conversation with the use.
     */
    get(context: TurnContext): LuisRecognizerResult | undefined;
    /**
     * Calls LUIS to recognize intents and entities in a users utterance. The results of the call
     * will be cached to the context object for the turn and future calls to recognize() for the
     * same context object will result in the cached value being returned. This behavior can be
     * overridden using the `force` parameter.
     * @param context Context for the current turn of conversation with the use.
     * @param force (Optional) flag that if `true` will force the call to LUIS even if a cached result exists. Defaults to a value of `false`.
     */
    recognize(context: TurnContext, force?: boolean): Promise<LuisRecognizerResult>;
    /**
     * Called internally to create a LuisClient instance. This is exposed to enable better unit
     * testing of teh recognizer.
     * @param baseUri Service endpoint being called.
     */
    protected createClient(baseUri: string): LuisClient;
    /**
     * Returns the name of the top scoring intent from a set of LUIS results.
     * @param results Result set to be searched.
     * @param defaultIntent (Optional) intent name to return should a top intent be found. Defaults to a value of `None`.
     * @param minScore (Optional) minimum score needed for an intent to be considered as a top intent. If all intents in the set are below this threshold then the `defaultIntent` will be returned.  Defaults to a value of `0.0`.
     */
    static topIntent(results: LuisRecognizerResult | undefined, defaultIntent?: string, minScore?: number): string;
    private getIntents(luisResult);
    private getEntitiesAndMetadata(entities, compositeEntities, verbose);
    private getEntityValue(entity);
    private getEntityMetadata(entity);
    private getNormalizedEntityType(entity);
    private populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
    /**
     * If a property doesn't exist add it to a new array, otherwise append it to the existing array
     * @param obj Object on which the property is to be set
     * @param key Property Key
     * @param value Property Value
     */
    private addProperty(obj, key, value);
}
