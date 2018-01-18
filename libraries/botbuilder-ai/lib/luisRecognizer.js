"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-ai
 */
/** second comment block */
const botbuilder_1 = require("botbuilder");
const LuisClient = require("botframework-luis");
botbuilder_1.EntityTypes.luis = "Luis";
class LuisRecognizer extends botbuilder_1.IntentRecognizer {
    constructor(appId, subscriptionKey, baseUri) {
        super();
        this.appId = appId;
        this.subscriptionKey = subscriptionKey;
        this.luisClient = new LuisClient(baseUri);
        this.onRecognize((context) => {
            const intents = [];
            const utterance = (context.request.text || '').trim();
            return LuisRecognizer.recognizeAndMap(this.luisClient, utterance, appId, subscriptionKey)
                .then(res => {
                intents.push(res);
                return intents;
            });
        });
    }
    static recognize(utterance, appId, subscriptionKey, baseUri) {
        var client = new LuisClient(baseUri);
        return LuisRecognizer.recognizeAndMap(client, utterance, appId, subscriptionKey);
    }
    static recognizeAndMap(client, utterance, appId, subscriptionKey) {
        return client.getIntentsAndEntitiesV2(appId, subscriptionKey, utterance)
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