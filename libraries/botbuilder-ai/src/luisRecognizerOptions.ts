/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LuisApplication, LuisRecognizerOptions } from './luisRecognizer';
import { RecognizerResult, TurnContext } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';

/**
 * Abstract class for Luis Recognizer.
 */
export abstract class LuisRecognizerInternal {
    /**
     * Creates a new [LuisRecognizerInternal](xref:botbuilder-ai.LuisRecognizerInternal) instance.
     *
     * @param {LuisApplication} application An object conforming to the [LuisApplication](xref:botbuilder-ai.LuisApplication) definition.
     * @param {LuisRecognizerOptions} _options Optional. Options object used to control predictions. Should conform to the [LuisRecognizerOptions](xref:botbuilder-ai.LuisRecognizerOptions) definition.
     */
    constructor(public application: LuisApplication, _options?: LuisRecognizerOptions) {
        if (!application) {
            throw new Error('Null Application\n');
        }

        this.application.endpoint ??= 'https://westus.api.cognitive.microsoft.com';
    }

    abstract recognizeInternal(context: DialogContext | TurnContext): Promise<RecognizerResult>;
}
