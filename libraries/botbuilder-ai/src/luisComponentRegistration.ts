/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration } from 'botbuilder-core';
import { LuisAdaptiveRecognizer } from './luisAdaptiveRecognizer';

/**
 * Define component assets for Luis.
 */
export class LuisComponentRegistration extends ComponentRegistration {
    public getDeclarativeTypes(_resourceExplorer: unknown) {
        return [
            {
                kind: LuisAdaptiveRecognizer.$kind,
                type: LuisAdaptiveRecognizer,
            },
        ];
    }
}
