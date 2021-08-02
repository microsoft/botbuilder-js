/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable, Converter, ConverterFactory, DialogContext, TurnPath } from 'botbuilder-dialogs';
import { LanguageGenerator } from '../languageGenerator';
import { LanguagePolicy, LanguagePolicyConverter } from '../languagePolicy';
import { languagePolicyKey } from '../languageGeneratorExtensions';
import { MemoryInterface, Options } from 'adaptive-expressions';
import { TemplateEngineLanguageGenerator } from './templateEngineLanguageGenerator';

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
    public languagePolicy: LanguagePolicy;

    public getConverter(property: keyof MultiLanguageGeneratorBaseConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'languagePolicy':
                return new LanguagePolicyConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Abstract method to get a language generator by locale.
     * @param dialogContext DialogContext.
     * @param locale Locale to lookup.
     */
    public abstract tryGetGenerator(
        dialogContext: DialogContext,
        locale: string
    ): { exist: boolean; result: LanguageGenerator<T, D> };

    /**
     * Find a language generator that matches the current context locale.
     * @param dialogContext Context for the current turn of conversation.
     * @param template Template to use.
     * @param data Data to bind to.
     */
    public async generate(dialogContext: DialogContext, template: string, data: D): Promise<T> {
        const languagePolicy = this.getLanguagePolicy(dialogContext);
        const targetLocale = this.getCurrentLocale(dialogContext);
        const fallbackLocales = this.getFallbackLocales(languagePolicy, targetLocale);
        const generators = this.getGenerators(dialogContext, fallbackLocales);

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

    public missingProperties(
        dialogContext: DialogContext,
        template: string,
        state?: MemoryInterface,
        options?: Options
    ): string[] {
        const currentLocale = this.getCurrentLocale(dialogContext, state, options);
        const languagePolicy = this.getLanguagePolicy(dialogContext, state);
        const fallbackLocales = this.getFallbackLocales(languagePolicy, currentLocale);
        const generators = this.getGenerators(dialogContext, fallbackLocales);

        if (generators.length === 0) {
            generators.push(new TemplateEngineLanguageGenerator());
        }

        for (const generator of generators) {
            try {
                return generator.missingProperties(dialogContext, template, state, options);
            } catch {
                // retry the next generator
            }
        }

        return [];
    }

    private getLanguagePolicy(dialogContext: DialogContext, memory?: MemoryInterface): LanguagePolicy {
        // priority
        // 1. local policy
        // 2. turn.languagePolicy
        // 2. shared policy in turnContext
        // 3. default policy
        if (this.languagePolicy) {
            return this.languagePolicy;
        }

        if (memory) {
            const lpInTurn = memory.getValue(TurnPath.languagePolicy);
            if (lpInTurn != null) {
                return lpInTurn;
            }
        }

        const lpInDc = dialogContext.services.get(languagePolicyKey);
        if (lpInDc) {
            return lpInDc;
        }

        return new LanguagePolicy();
    }

    private getCurrentLocale(dialogContext: DialogContext, memory?: MemoryInterface, options?: Options): string {
        // order
        // 1. turn.locale
        // 2. options.locale
        // 3. Context.Activity.Locale
        // 4. Thread.CurrentThread.CurrentCulture.Name
        if (memory) {
            const localeInTurn = memory.getValue(TurnPath.locale);
            if (localeInTurn) {
                return localeInTurn.toString();
            }
        }

        return options?.locale ?? dialogContext.getLocale();
    }

    private getFallbackLocales(languagePolicy: LanguagePolicy, targetLocale: string): string[] {
        const fallbackLocales = [];
        targetLocale = targetLocale.toLowerCase();
        if (languagePolicy.has(targetLocale)) {
            fallbackLocales.push(...languagePolicy.get(targetLocale));
        }

        // append empty as fallback to end
        if (targetLocale !== '' && languagePolicy.has('')) {
            fallbackLocales.push(...languagePolicy.get(''));
        }
        return fallbackLocales;
    }

    private getGenerators(dialogContext: DialogContext, fallbackLocales: string[]): LanguageGenerator<T, D>[] {
        const generators: LanguageGenerator<T, D>[] = [];
        for (const locale of fallbackLocales) {
            const result = this.tryGetGenerator(dialogContext, locale);
            if (result.exist) {
                generators.push(result.result);
            }
        }
        return generators;
    }
}
