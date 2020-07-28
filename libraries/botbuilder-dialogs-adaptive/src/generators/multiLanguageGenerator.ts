/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { MultiLanguageGeneratorBase } from './multiLanguageGeneratorBase';
import { LanguageGenerator } from '../languageGenerator';

/**
 * LanguageGenerator which uses implements a map of locale->LanguageGenerator for the locale 
 * and has a policy which controls fallback (try en-us -> en -> default).
 */
export class MultiLanguageGenerator extends MultiLanguageGeneratorBase {
    /**
     * Gets or sets the language generators for multiple languages.
     */
    public languageGenerators: Map<string, LanguageGenerator> = new Map<string, LanguageGenerator>();

    /**
     * Implementation of lookup by locale.
     * @param dialogContext Context for the current turn of conversation with the user.
     * @param locale Locale to lookup.
     */
    public tryGetGenerator(dialogContext: DialogContext, locale: string): { exist: boolean; result: LanguageGenerator } {
        if (this.languageGenerators.has(locale)) {
            return { exist: true, result: this.languageGenerators.get(locale) };
        } else {
            return { exist: false, result: undefined };
        }
    }

}