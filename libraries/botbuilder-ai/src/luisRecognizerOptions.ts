/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {LuisApplication, LuisRecognizerOptions}  from './luisRecognizer'
import { RecognizerResult, TurnContext } from 'botbuilder-core';

/**
 * Abstract class for Luis Recognizer.
 */
export abstract class LuisRecognizerInternal {
    /**
     * Creates a new LuisRecognizerInternal instance.
     * @param application An object conforming to the [LuisApplication](#luisapplication) definition.
     * @param options (Optional) Options object used to control predictions. Should conform to the [LuisRecognizerOptions](#luisrecognizeroptions) definition.
     */
    constructor(application: LuisApplication, options?: LuisRecognizerOptions)
    {
        if (!application) {
            throw new Error('Null Application\n');
        }
        this.application = application;
        this.application.endpoint = this.application.endpoint ? this.application.endpoint : 'https://westus.api.cognitive.microsoft.com';
    }

    application: LuisApplication;

    abstract recognizeInternal(context: TurnContext): Promise<RecognizerResult>;

}
