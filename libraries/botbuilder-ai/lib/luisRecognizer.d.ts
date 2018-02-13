/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Recognizer, RecognizerResult } from 'botbuilder';
export interface LuisRecognizerOptions {
    /** Your models AppId */
    appId: string;
    /** Your subscription key. */
    subscriptionKey: string;
    /** (Optional) service endpoint to call. Defaults to "https://westus.api.cognitive.microsoft.com". */
    serviceEndpoint?: string;
    /** (Optional) request options passed to service call.  */
    options?: {
        timezoneOffset?: number;
        contextId?: string;
        verbose?: boolean;
        forceSet?: string;
        allowSampling?: string;
        customHeaders?: {
            [headerName: string]: string;
        };
    };
}
export declare class LuisRecognizer extends Recognizer {
    private options;
    private luisClient;
    constructor(options: LuisRecognizerOptions);
    constructor(appId: string, subscriptionKey: string);
    static recognize(utterance: string, options: LuisRecognizerOptions): Promise<RecognizerResult>;
    protected recognizeAndMap(utterance: string, verbose: boolean): Promise<RecognizerResult>;
    private getIntents(intents);
    private getEntitiesAndMetadata(entities, compositeEntities, verbose);
    private getEntityValue(entity);
    private getEntityMetadata(entity);
    private populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
    /**
     * If a property doesn't exist add it to a new array, otherwise append it to the existing array
     * @param obj Object on which the property is to be set
     * @param key Property Key
     * @param value Property Value
     */
    private addProperty(obj, key, value);
}
