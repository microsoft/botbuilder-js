/**
 * @module botbuilder-ai
 */
/** second comment block */
import { Intent, IntentRecognizer } from 'botbuilder';
import LuisClient = require('botframework-luis');
export declare class LuisRecognizer extends IntentRecognizer {
    private appId;
    private subscriptionKey;
    private luisClient;
    constructor(appId: string, subscriptionKey: string, baseUri?: string);
    static recognize(utterance: string, appId: string, subscriptionKey: string, baseUri?: string): Promise<Intent>;
    protected static recognizeAndMap(client: LuisClient, utterance: string, appId: string, subscriptionKey: string): Promise<Intent>;
}
