/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext, Middleware } from 'botbuilder';
import { LuisResult } from './luisSchema';
import LuisClient = require('botframework-luis');
export interface LuisRecognizerSettings {
    /** Your models AppId */
    appId: string;
    /** Your subscription key. */
    subscriptionKey: string;
    /** (Optional) service endpoint to call. Defaults to "https://westus.api.cognitive.microsoft.com/". */
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
export declare class LuisRecognizer implements Middleware {
    static nextInstance: number;
    private settings;
    private cacheKey;
    constructor(settings: LuisRecognizerSettings);
    onProcessRequest(context: BotContext, next: () => Promise<void>): Promise<void>;
    recognize(context: BotContext, force?: boolean): Promise<LuisResult>;
    get(context: BotContext): LuisResult | undefined;
    getIntentsAndEntities(query: string): Promise<LuisResult>;
    protected createLuisClient(serviceEndpoint: string): LuisClient;
}
