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
    /**
     * Get declarative types for LUIS component registration.
     *
     * @param {any} _resourceExplorer resource explorer
     * @returns {ComponentRegistration[]} component registrations
     */
    public getDeclarativeTypes(_resourceExplorer: unknown): ComponentRegistration[] {
        return [
            {
                kind: LuisAdaptiveRecognizer.$kind,
                type: LuisAdaptiveRecognizer,
            },
        ];
    }
}
