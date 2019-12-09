/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {LuisApplication, LuisRecognizerOptions}  from './luisRecognizer'
import { RecognizerResult, TurnContext } from 'botbuilder-core';

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