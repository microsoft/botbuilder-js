/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { BotContext, Middleware, ActivityTypes } from 'botbuilder';
import { LuisResult, Intent } from './luisSchema'; 
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
        timezoneOffset? : number; 
        contextId? : string; 
        verbose? : boolean; 
        forceSet? : string; 
        allowSampling?: string; 
        customHeaders?: { [headerName: string]: string; };
    };
}

export class LuisRecognizer implements Middleware {
    static nextInstance = 0;
    private settings: LuisRecognizerSettings;
    private cacheKey: string;

    constructor(settings: LuisRecognizerSettings) {
        this.settings = Object.assign({}, settings);
        if (!this.settings.serviceEndpoint) {
            this.settings.serviceEndpoint = 'https://westus.api.cognitive.microsoft.com/';
        } else if (!this.settings.serviceEndpoint.endsWith('/')) {
            this.settings.serviceEndpoint += '/';
        }
        this.cacheKey = 'LuisRecognizer:' + (LuisRecognizer.nextInstance++).toString();
    }

    public onProcessRequest(context: BotContext, next: () => Promise<void>): Promise<void> {
        if (context.request.type === ActivityTypes.Message) {
            // Recognize (and cache) then continue execution.
            return this.recognize(context, true)
                       .then(() => next());
        } else {
            return next();
        }
    }

    public recognize(context: BotContext, force = false): Promise<LuisResult> {
        if (force || this.get(context) === undefined) {
            if (context.request.text && context.request.text.length > 0) {
                // Recognize utterance
                return this.getIntentsAndEntities(context.request.text).then((result) => {
                    // Cache result
                    context.set(this.cacheKey, result);
                    return result;
                });
            } else {
                // Cache empty result
                context.set(this.cacheKey, { query: '', entities: [] });
            }
        }
        return Promise.resolve(this.get(context) as LuisResult);
    }

    public get(context: BotContext): LuisResult|undefined {
        return context.get(this.cacheKey);
    }

    public getIntentsAndEntities(query: string): Promise<LuisResult> {
        const { serviceEndpoint, appId, subscriptionKey, options } = this.settings;
        const client = this.createLuisClient(serviceEndpoint as string);
        return client.getIntentsAndEntitiesV2(appId, subscriptionKey, query, options).then((results) => {
            if (!results.topScoringIntent && results.intents) {
                // Find top scoring intent
                let top: Intent|undefined = undefined;
                results.intents.forEach((intent) => {
                    if (!top || (intent.score && intent.score > (top.score as number))) {
                        top = intent;
                    }
                });
                results.topScoringIntent = top;
            }
            return results;
        });
    }

    protected createLuisClient(serviceEndpoint: string): LuisClient {
        return new LuisClient(serviceEndpoint + 'luis/');
    }
}

