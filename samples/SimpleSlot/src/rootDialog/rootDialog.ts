// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, SendActivity, IntentRule, EventRule, UnknownIntentRule, IfCondition, SetProperty  } from "botbuilder-dialogs-adaptive";
import { LuisRecognizer, LuisApplication } from 'botbuilder-ai';
import { ResetPassword } from "../resetPassword/resetPassword"; 


export class RootDialog extends AdaptiveDialog {
    
    //
    private luisRecognizer: LuisRecognizer;

    constructor() {
        super('main');

        // define LUIS recognizer 
        this.luisRecognizer = new LuisRecognizer({
            applicationId: "855a414e-60f6-4cb0-b0da-312e3af303df",
            endpoint:"https://westus.api.cognitive.microsoft.com",

            // CAUTION: Authoring key is used in this example as it is appropriate for prototyping.
            // When implimenting for deployment/production, assign and use a subscription key instead of an authoring key.
            endpointKey: "d016585ce5c9446bbdbac5ea95660e6b"
        });

        // Add recognizer
        this.recognizer = this.luisRecognizer;

        // Handle recognized intents
        this.addRule(new IntentRule('#RestPassword', [
            new SendActivity(`reset password intent recognized`),
            new ResetPassword()
        ]));

        this.addRule(new UnknownIntentRule([
            new SendActivity(`Hi! I'm a simple slot filling bot. Say "start" to get started.`),
        ]));


        // Define rules for handling errors
        this.addRule(new EventRule('error', [
            new SendActivity(`Oops. An error occurred: {message}`)
        ]));
    }
}
