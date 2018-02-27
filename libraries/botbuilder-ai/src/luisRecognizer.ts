/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { EntityObject, EntityTypes, Intent, IntentRecognizer } from 'botbuilder';
import LuisClient = require('botframework-luis');

EntityTypes.luis = "Luis";

export interface LuisRecognizerOptions {
    /** Your models AppId */
    appId: string;

    /** Your subscription key. */
    subscriptionKey: string;

    /** (Optional) service endpoint to call. Defaults to "https://westus.api.cognitive.microsoft.com". */
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

export class LuisRecognizer extends IntentRecognizer {
    private options: LuisRecognizerOptions
    private luisClient: LuisClient;

    constructor(options: LuisRecognizerOptions)
    constructor(appId: string, subscriptionKey: string)
    constructor(appId: string|LuisRecognizerOptions, subscriptionKey?: string) {
        super();
        if (typeof appId === 'string') {
            this.options = { appId: appId, subscriptionKey: subscriptionKey as string };
        } else {
            this.options = Object.assign({}, appId);
        }

        // Create client and override callbacks
        const baseUri = (this.options.serviceEndpoint || 'https://westus.api.cognitive.microsoft.com');
        this.luisClient = new LuisClient(baseUri + '/luis/');
        this.onRecognize((context) => {
            const intents: Intent[] = [];
            const utterance = (context.request.text || '').trim();
            return LuisRecognizer.recognizeAndMap(this.luisClient, utterance, this.options)
                .then(res => {
                    intents.push(res);
                    return intents;
                });
        });
    }

    public static recognize(utterance: string, options: LuisRecognizerOptions): Promise<Intent> {
        const baseUri = (options.serviceEndpoint || 'https://westus.api.cognitive.microsoft.com');
        var client = new LuisClient(baseUri + '/luis/');
        return LuisRecognizer.recognizeAndMap(client, utterance, options);
    }

    protected static recognizeAndMap(client: LuisClient, utterance: string, options: LuisRecognizerOptions): Promise<Intent> {
        return client.getIntentsAndEntitiesV2(options.appId, options.subscriptionKey, utterance, options.options)
            .then(result => {
                var topScoringIntent = result.topScoringIntent || {intent: '', score: 0.0};
                return {
                    name: topScoringIntent.intent,
                    score: topScoringIntent.score,
                    entities: result.entities.map(entity => {
                        return {...{value: entity.entity}, ...entity} as  EntityObject<string>;
                    })
                } as Intent
            });
    }
}

