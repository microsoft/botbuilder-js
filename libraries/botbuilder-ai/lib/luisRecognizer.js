"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const LuisClient = require("botframework-luis");
botbuilder_1.EntityTypes.luis = "Luis";
class LuisRecognizer extends botbuilder_1.IntentRecognizer {
    constructor(appId, subscriptionKey) {
        super();
        if (typeof appId === 'string') {
            this.options = { appId: appId, subscriptionKey: subscriptionKey };
        }
        else {
            this.options = Object.assign({}, appId);
        }
        // Create client and override callbacks
        const baseUri = (this.options.serviceEndpoint || 'https://westus.api.cognitive.microsoft.com');
        this.luisClient = new LuisClient(baseUri + '/luis/');
        this.onRecognize((context) => {
            const intents = [];
            const utterance = (context.request.text || '').trim();
            return LuisRecognizer.recognizeAndMap(this.luisClient, utterance, this.options)
                .then(res => {
                intents.push(res);
                return intents;
            });
        });
    }
    static recognize(utterance, options) {
        const baseUri = (options.serviceEndpoint || 'https://westus.api.cognitive.microsoft.com');
        var client = new LuisClient(baseUri + '/luis/');
        return LuisRecognizer.recognizeAndMap(client, utterance, options);
    }
    static recognizeAndMap(client, utterance, options) {
        return client.getIntentsAndEntitiesV2(options.appId, options.subscriptionKey, utterance, options.options)
            .then(result => {
            var topScoringIntent = result.topScoringIntent || { intent: '', score: 0.0 };
            return {
                name: topScoringIntent.intent,
                score: topScoringIntent.score,
                entities: result.entities.map(entity => {
                    return Object.assign({ value: entity.entity }, entity);
                })
            };
        });
    }
}
exports.LuisRecognizer = LuisRecognizer;
//# sourceMappingURL=luisRecognizer.js.map