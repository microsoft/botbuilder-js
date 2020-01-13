/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext } from 'botbuilder-core';

/**
 * Defines Template interface for binding data to T.
 */
export interface TemplateInterface<T> {

    /**
     * Given the turn context bind to the data to create the object
     * @param turnContext TurnContext.
     * @param data data to bind to.
     * @returns instance.
     */
    bindToData(turnContext: TurnContext, data: any): Promise<T>;
}