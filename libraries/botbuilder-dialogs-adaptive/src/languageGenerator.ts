/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { MemoryInterface, Options } from 'adaptive-expressions';

/**
 * Defines interface for a Language Generator system to bind to text.
 */
export interface LanguageGenerator<T = unknown, D = Record<string, unknown>> {
    /**
     * Method to bind data to string.
     * @param dialogContext DialogContext.
     * @param template Template.
     * @param data Data to bind to.
     * @returns Result of rendering template using data.
     */
    generate(dialogContext: DialogContext, template: string, data: D): Promise<T>;

    /**
     * Method to get missing properties.
     *
     * @param dialogContext DialogContext.
     * @param template Template.
     * @param state Memory state.
     * @param options Options.
     * @returns Property list.
     */
    missingProperties(dialogContext: DialogContext, template: string, state?: MemoryInterface, options?: Options): string[];
}
