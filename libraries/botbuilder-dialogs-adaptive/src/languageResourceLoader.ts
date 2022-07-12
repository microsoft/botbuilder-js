/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * load all lg resource and split them into different language group.
 */

import { Resource, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { LanguagePolicy } from './languagePolicy';

/**
 * Load all LG resource and split them into different language groups.
 */
export class LanguageResourceLoader {
    private static readonly lgSuffix: string = 'lg';

    /**
     * Group LG resource by locale.
     *
     * @param resourceExplorer The resource explorer to use.
     * @returns The dictionary of grouped locale.
     */
    static groupByLocale(resourceExplorer: ResourceExplorer): Map<string, Resource[]> {
        const resourceMapping: Map<string, Resource[]> = new Map<string, Resource[]>();
        const allResouces: Resource[] = resourceExplorer.getResources(this.lgSuffix);
        const languagePolicy = new LanguagePolicy();
        for (const locale of languagePolicy.keys()) {
            const suffixs = languagePolicy.get(locale);
            const existNames = new Set<string>();
            for (const index in suffixs) {
                const suffix = suffixs[index];
                const resourcesWithSuffix = allResouces.filter(
                    (u): boolean =>
                        this.parseLGFileName(u.id).language.toLocaleLowerCase() === suffix.toLocaleLowerCase()
                );
                resourcesWithSuffix.forEach((u): void => {
                    const resourceName = u.id;
                    // a.en-us.lg -> a
                    // a.lg -> a
                    const length = !suffix ? this.lgSuffix.length + 1 : this.lgSuffix.length + 2;
                    const prefixName = resourceName.substring(0, resourceName.length - suffix.length - length);
                    if (!existNames.has(prefixName)) {
                        existNames.add(prefixName);
                        if (!resourceMapping.has(locale)) {
                            resourceMapping.set(locale, [u]);
                        } else {
                            resourceMapping.get(locale).push(u);
                        }
                    }
                });
            }

            if (resourceMapping.has(locale)) {
                const resourcesWithEmptySuffix = allResouces.filter(
                    (u): boolean => this.parseLGFileName(u.id).language === ''
                );
                resourcesWithEmptySuffix.forEach((u): void => {
                    const resourceName = u.id;
                    const prefixName = resourceName.substring(0, resourceName.length - this.lgSuffix.length - 1);
                    if (!existNames.has(prefixName)) {
                        existNames.add(prefixName);
                        resourceMapping.get(locale).push(u);
                    }
                });
            }
        }

        return this.fallbackMultiLangResource(resourceMapping);
    }

    /**
     * Parse LG file name into prefix and language.
     *
     * @param lgFileName LG input file name.
     * @returns The name and language.
     */
    static parseLGFileName(lgFileName: string): { prefix: string; language: string } {
        if (lgFileName === undefined || !lgFileName.endsWith('.' + this.lgSuffix)) {
            return { prefix: lgFileName, language: '' };
        }

        const fileName = lgFileName.substring(0, lgFileName.length - this.lgSuffix.length - 1);
        const lastDot = fileName.lastIndexOf('.');
        if (lastDot > 0) {
            return { prefix: fileName.substring(0, lastDot), language: fileName.substring(lastDot + 1) };
        } else {
            return { prefix: fileName, language: '' };
        }
    }

    /**
     * Get the fallback locale from optional locales.
     *
     * @param locale Current locale
     * @param optionalLocales Optional locales.
     * @returns The final locale.
     */
    static fallbackLocale(locale: string, optionalLocales: string[]): string {
        if (optionalLocales === undefined) {
            throw new TypeError('Invalid Arguments');
        }

        if (optionalLocales.includes(locale.toLowerCase())) {
            return locale;
        }

        const languagePolicy = new LanguagePolicy();
        if (languagePolicy.has(locale)) {
            const fallbackLocales = languagePolicy.get(locale);
            for (const i in fallbackLocales) {
                const fallbackLocale = fallbackLocales[i];
                if (optionalLocales.includes(fallbackLocale)) {
                    return fallbackLocale;
                }
            }
        } else if (optionalLocales.includes('')) {
            return '';
        }

        throw new Error(`there is no locale fallback for ${locale}`);
    }

    /**
     * @private
     */
    private static fallbackMultiLangResource(resourceMapping: Map<string, Resource[]>): Map<string, Resource[]> {
        const resourcePoolDict = new Map<string, Resource[]>();
        for (const currentLocale of resourceMapping.keys()) {
            const currentResourcePool: Resource[] = resourceMapping.get(currentLocale);
            const existLocale = Array.from(resourcePoolDict.keys()).find((u) =>
                this.hasSameResourcePool(resourcePoolDict.get(u), currentResourcePool)
            );
            if (existLocale === undefined) {
                resourcePoolDict.set(currentLocale, currentResourcePool);
            } else {
                const newLocale: string = this.findCommonAncestorLocale(existLocale, currentLocale);
                if (!(newLocale === undefined || newLocale.trim() === '')) {
                    resourcePoolDict.delete(existLocale);
                    resourcePoolDict.set(newLocale, currentResourcePool);
                }
            }
        }

        return resourcePoolDict;
    }

    /**
     * @private
     */
    private static findCommonAncestorLocale(locale1: string, locale2: string): string {
        const languagePolicy = new LanguagePolicy();
        if (!languagePolicy.has(locale1) || !languagePolicy.has(locale2)) {
            return '';
        }

        const key1Policy = languagePolicy.get(locale1);
        const key2Policy = languagePolicy.get(locale2);
        for (const key1Language of key1Policy) {
            for (const key2Language of key2Policy) {
                if (key1Language === key2Language) {
                    return key1Language;
                }
            }
        }

        return '';
    }

    /**
     * @private
     */
    private static hasSameResourcePool(resourceMapping1: Resource[], resourceMapping2: Resource[]): boolean {
        if (resourceMapping1 === undefined && resourceMapping2 === undefined) {
            return true;
        }

        if (
            (resourceMapping1 === undefined && resourceMapping2 !== undefined) ||
            (resourceMapping1 !== undefined && resourceMapping2 === undefined) ||
            resourceMapping1.length != resourceMapping2.length
        ) {
            return false;
        }

        const sortedResourceMapping1 = Array.from(resourceMapping1.sort());
        const sortedResourceMapping2 = Array.from(resourceMapping2.sort());
        for (const i in resourceMapping1) {
            if (sortedResourceMapping1[i].id != sortedResourceMapping2[i].id) {
                return false;
            }
        }

        return true;
    }
}
