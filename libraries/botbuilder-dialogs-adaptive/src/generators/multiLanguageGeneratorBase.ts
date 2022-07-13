/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable, Converter, ConverterFactory, DialogContext } from 'botbuilder-dialogs';
import { LanguageGenerator } from '../languageGenerator';
import { LanguagePolicy, LanguagePolicyConverter } from '../languagePolicy';
import { languagePolicyKey } from '../languageGeneratorExtensions';

export interface MultiLanguageGeneratorBaseConfiguration {
    languagePolicy?: Record<string, string[]> | LanguagePolicy;
}

/**
 * Base class which applies language policy to tryGetGenerator.
 */
export abstract class MultiLanguageGeneratorBase<
        T = unknown,
        D extends Record<string, unknown> = Record<string, unknown>
    >
    extends Configurable
    implements LanguageGenerator<T, D>, MultiLanguageGeneratorBaseConfiguration {
    /**
     * Language policy required by language generator.
     */
    languagePolicy: LanguagePolicy;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof MultiLanguageGeneratorBaseConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'languagePolicy':
                return new LanguagePolicyConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Abstract method to get a language generator by locale.
     *
     * @param dialogContext DialogContext.
     * @param locale Locale to lookup.
     */
    abstract tryGetGenerator(
        dialogContext: DialogContext,
        locale: string
    ): { exist: boolean; result: LanguageGenerator<T, D> };

    /**
     * Find a language generator that matches the current context locale.
     *
     * @param dialogContext Context for the current turn of conversation.
     * @param template Template to use.
     * @param data Data to bind to.
     * @returns A promise representing the asynchronous operation.
     */
    async generate(dialogContext: DialogContext, template: string, data: D): Promise<T> {
        // priority
        // 1. local policy
        // 2. shared policy in turnContext
        // 3. default policy
        if (!this.languagePolicy) {
            this.languagePolicy = dialogContext.services.get(languagePolicyKey);
            if (!this.languagePolicy) {
                this.languagePolicy = new LanguagePolicy();
            }
        }

        // see if we have any locales that match
        const fallbackLocales = [];
        const targetLocale = dialogContext.getLocale().toLowerCase();
        if (this.languagePolicy.has(targetLocale)) {
            this.languagePolicy.get(targetLocale).forEach((u: string): number => fallbackLocales.push(u));
        }

        // append empty as fallback to end
        if (targetLocale !== '' && this.languagePolicy.has('')) {
            this.languagePolicy.get('').forEach((u: string): number => fallbackLocales.push(u));
        }

        if (fallbackLocales.length === 0) {
            throw Error(`No supported language found for ${targetLocale}`);
        }

        const generators: LanguageGenerator<T, D>[] = [];
        for (const locale of fallbackLocales) {
            const result = this.tryGetGenerator(dialogContext, locale);
            if (result.exist) {
                generators.push(result.result);
            }
        }

        if (generators.length === 0) {
            throw Error(`No generator found for language ${targetLocale}`);
        }

        const errors: string[] = [];
        for (const generator of generators) {
            try {
                return await generator.generate(dialogContext, template, data);
            } catch (e) {
                errors.push(e);
            }
        }

        throw Error(errors.join(',\n'));
    }
}
