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
import { languagePolicyKey } from '../languageGeneratorExtensions';
/**
 * Class which manages cache of all LG resources from a ResourceExplorer. 
 * This class automatically updates the cache when resource change events occure.
 */
export abstract class MultiLanguageGeneratorBase implements LanguageGenerator{
    public languagePolicy: any;

    public abstract tryGetGenerator(dialogContext: DialogContext, locale: string): { exist: boolean; result: LanguageGenerator };

    public constructor(languagePolicy: any = undefined) {
        this.languagePolicy = languagePolicy;
    };
    
    public async generate(dialogContext: DialogContext, template: string, data: object): Promise<string> {
        const targetLocale = dialogContext.context.activity.locale? dialogContext.context.activity.locale.toLocaleLowerCase() : '';

        // priority
        // 1. local policy
        // 2. shared policy in turnContext
        // 3. default policy
        if (!this.languagePolicy) {
            this.languagePolicy = dialogContext.services.get(languagePolicyKey);
            if (!this.languagePolicy) {
                this.languagePolicy = LanguagePolicy.defaultPolicy;
            }
        }

        // see if we have any locales that match
        let fallbackLocales = [];
        if (targetLocale in this.languagePolicy) {
            this.languagePolicy[targetLocale].forEach((u: string): number => fallbackLocales.push(u));
        }

        // append empty as fallback to end
        if (targetLocale !== '' && '' in this.languagePolicy) {
            this.languagePolicy[''].forEach((u: string): number => fallbackLocales.push(u));
        }

        if (fallbackLocales.length === 0) {
            throw Error(`No supported language found for ${ targetLocale }`);
        }

        const generators: LanguageGenerator[] = [];
        for (const locale of fallbackLocales) {
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