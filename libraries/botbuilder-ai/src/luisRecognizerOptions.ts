import {LuisApplication} from './luisRecognizer'
import { BotTelemetryClient, RecognizerResult, TurnContext } from 'botbuilder-core';

export interface LuisRecognizerOptions {

    telemetryClient?: BotTelemetryClient;

    logPersonalInformation?: boolean;

    includeAPIResults?: boolean;
}


export abstract class LuisRecognizerInternal {
 
    constructor(application: LuisApplication, options?: LuisRecognizerOptions)
    {
        if (!application) {
            throw new Error('Null Application\n');
        }
        this.application = application;
        this.application.endpoint = this.application.endpoint ? this.application.endpoint : 'https://westus.api.cognitive.microsoft.com';
    }

    application: LuisApplication;

    abstract recognizeInternalAsync(context: TurnContext): Promise<RecognizerResult>;

}