/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext } from 'botbuilder-core';

/**
 * Defines interface for a Language Generator system to bind to text.
 */
export interface LanguageGenerator {
    /**
     * Method to bind data to string.
     * @param turnContext turnContext.
     * @param template template.
     * @param data data to bind to.
     * @returns text.
     */
    generate(turnContext: TurnContext, template: string, data: object): Promise<string>;
}