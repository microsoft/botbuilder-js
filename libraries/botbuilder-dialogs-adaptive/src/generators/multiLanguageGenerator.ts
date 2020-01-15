/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MultiLanguageGeneratorBase } from './multiLanguageGeneratorBase';
import { LanguageGenerator } from '../languageGenerator';
import { TurnContext } from 'botbuilder-core';
/**
 * ILanguageGenerator which uses implements a map of locale->ILanguageGenerator for the locale 
 * and has a policy which controls fallback (try en-us -> en -> default).
 */
export class MultiLanguageGenerator extends MultiLanguageGeneratorBase{
    public static declarativeType: string = 'Microsoft.MultiLanguageGenerator';

    public languageGenerators: Map<string, LanguageGenerator> = new Map<string, LanguageGenerator>();

    public constructor() {
        super();
    }

    public tryGetGenerator(context: TurnContext, locale: string):  {exist: boolean; result: LanguageGenerator} {
        if (this.languageGenerators.has(locale)) {
            return {exist: true, result: this.languageGenerators.get(locale)};
        } else {
            return {exist: false, result: undefined}; 
        }
    }

}