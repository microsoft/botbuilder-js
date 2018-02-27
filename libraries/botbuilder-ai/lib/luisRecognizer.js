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
class LuisRecognizer {
    constructor(settings) {
        this.settings = Object.assign({}, settings);
        if (!this.settings.serviceEndpoint) {
            this.settings.serviceEndpoint = 'https://westus.api.cognitive.microsoft.com/';
        }
        else if (!this.settings.serviceEndpoint.endsWith('/')) {
            this.settings.serviceEndpoint += '/';
        }
        this.cacheKey = 'LuisRecognizer:' + (LuisRecognizer.nextInstance++).toString();
    }
    onProcessRequest(context, next) {
        if (context.request.type === botbuilder_1.ActivityTypes.Message) {
            // Recognize (and cache) then continue execution.
            return this.recognize(context, true)
                .then(() => next());
        }
        else {
            return next();
        }
    }
    recognize(context, force = false) {
        if (force || this.get(context) === undefined) {
            if (context.request.text && context.request.text.length > 0) {
                // Recognize utterance
                return this.getIntentsAndEntities(context.request.text).then((result) => {
                    // Cache result
                    context.set(this.cacheKey, result);
                    return result;
                });
            }
            else {
                // Cache empty result
                context.set(this.cacheKey, { query: '', entities: [] });
            }
        }
        return Promise.resolve(this.get(context));
    }
    get(context) {
        return context.get(this.cacheKey);
    }
    getIntentsAndEntities(query) {
        const { serviceEndpoint, appId, subscriptionKey, options } = this.settings;
        const client = this.createLuisClient(serviceEndpoint);
        return client.getIntentsAndEntitiesV2(appId, subscriptionKey, query, options).then((results) => {
            if (!results.topScoringIntent && results.intents) {
                // Find top scoring intent
                let top = undefined;
                results.intents.forEach((intent) => {
                    if (!top || (intent.score && intent.score > top.score)) {
                        top = intent;
                    }
                });
                results.topScoringIntent = top;
            }
            return results;
        });
    }
    createLuisClient(serviceEndpoint) {
        return new LuisClient(serviceEndpoint + 'luis/');
    }
}
LuisRecognizer.nextInstance = 0;
exports.LuisRecognizer = LuisRecognizer;
//# sourceMappingURL=luisRecognizer.js.map