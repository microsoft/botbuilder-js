/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Intent, IntentRecognizer } from 'botbuilder';
import LuisClient = require('botframework-luis');
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
export declare class LuisRecognizer extends IntentRecognizer {
    private options;
    private luisClient;
    constructor(options: LuisRecognizerOptions);
    constructor(appId: string, subscriptionKey: string);
    static recognize(utterance: string, options: LuisRecognizerOptions): Promise<Intent>;
    protected static recognizeAndMap(client: LuisClient, utterance: string, options: LuisRecognizerOptions): Promise<Intent>;
}
