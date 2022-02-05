/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';

/**
 * Defines interface for a Language Generator system to bind to text.
 */
export interface LanguageGenerator<T = unknown, D = Record<string, unknown>> {
    /**
     * Method to bind data to string.
     *
     * @param dialogContext DialogContext.
     * @param template Template.
     * @param data Data to bind to.
     * @returns Result of rendering template using data.
     */
    generate(dialogContext: DialogContext, template: string, data: D): Promise<T>;
}
