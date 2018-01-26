/**
 * @module botbuilder-ai
 */
/** second comment block */
import { EntityObject, EntityTypes, Intent, IntentRecognizer } from 'botbuilder';
import LuisClient = require('botframework-luis');

EntityTypes.luis = 'Luis';

export class LuisRecognizer extends IntentRecognizer {
    private luisClient: LuisClient;

    constructor(private appId: string, private subscriptionKey: string, baseUri?: string) {
        super();
        this.luisClient = new LuisClient(baseUri);
        this.onRecognize((context) => {
            const intents: Intent[] = [];
            const utterance = (context.request.text || '').trim();
            return LuisRecognizer.recognizeAndMap(this.luisClient, utterance, appId, subscriptionKey)
                .then(res => {
                    intents.push(res);
                    return intents;
                });
        });
    }

    public static recognize(utterance: string, appId: string, subscriptionKey: string, baseUri?: string): Promise<Intent> {
        const client = new LuisClient(baseUri);
        return LuisRecognizer.recognizeAndMap(client, utterance, appId, subscriptionKey);
    }

    protected static recognizeAndMap(client: LuisClient, utterance: string, appId: string, subscriptionKey: string): Promise<Intent> {
        return client.getIntentsAndEntitiesV2(appId, subscriptionKey, utterance)
            .then(result => {
                const topScoringIntent = result.topScoringIntent || {intent: '', score: 0.0};
                return {
                    name: topScoringIntent.intent,
                    score: topScoringIntent.score,
                    entities: result.entities.map(entity => {
                        return {...{value: entity.entity}, ...entity} as  EntityObject<string>;
                    })
                } as Intent;
            });
    }
}

