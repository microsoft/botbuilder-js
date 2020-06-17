/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { LanguageGenerator } from '../languageGenerator';
import { LanguagePolicy } from '../languagePolicy';
/**
 * Class which manages cache of all LG resources from a ResourceExplorer. 
 * This class automatically updates the cache when resource change events occure.
 */
export abstract class MultiLanguageGeneratorBase implements LanguageGenerator {
    public languagePolicy = LanguagePolicy.defaultPolicy;

    public abstract tryGetGenerator(dialogContext: DialogContext, locale: string): { exist: boolean; result: LanguageGenerator };

    public constructor() { };

    public async generate(dialogContext: DialogContext, template: string, data: object): Promise<string> {
        const targetLocale = dialogContext.context.activity.locale ? dialogContext.context.activity.locale.toLocaleLowerCase() : '';
        let locales: string[] = [''];
        if (this.languagePolicy[targetLocale] === undefined) {
            if (this.languagePolicy[''] === undefined) {
                throw Error(`No supported language found for ${ targetLocale }`);
            }
        } else {
            locales = this.languagePolicy[targetLocale];
        }

        const generators: LanguageGenerator[] = [];
        for (const locale of locales) {
            if (this.tryGetGenerator(dialogContext, locale).exist) {
                generators.push(this.tryGetGenerator(dialogContext, locale).result);
            }
        }

        if (generators.length === 0) {
            throw Error(`No generator found for language ${ targetLocale }`);
        }

        const errors: string[] = [];
        for (const generator of generators) {
            try {
                return generator.generate(dialogContext, template, data);
            } catch (e) {
                errors.push(e);
            }
        }

        throw Error(errors.join(',\n'));
    }
}