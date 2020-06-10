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
import { LanguagePolicy } from  './languagePolicy';

export class LanguageResourceLoader {
    public static async groupByLocale(resourceExplorer: ResourceExplorer): Promise<Map<string, Resource[]>> {
        const resourceMapping: Map<string, Resource[]> = new Map<string, Resource[]>();
        const allResouces: Resource[] =  await resourceExplorer.getResources('lg');
        const languagePolicy = LanguagePolicy.defaultPolicy;
        for (const locale in languagePolicy) {
            let suffixs = languagePolicy[locale];
            const existNames = new Set<string>();
            for (const index in suffixs) {
                const suffix = suffixs[index];
                if (!locale || suffix ) {
                    const resourcesWithSuffix = allResouces.filter((u): boolean => this.parseLGFileName(u.id).language.toLocaleLowerCase() === suffix.toLocaleLowerCase());
                    resourcesWithSuffix.forEach((u): void => {
                        const resourceName = u.id;
                        const length = (!suffix)? 3 : 4;
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
                } else {
                    if (resourceMapping.has(locale)) {
                        const resourcesWithEmptySuffix = allResouces.filter((u): boolean => this.parseLGFileName(u.id).language === '');
                        resourcesWithEmptySuffix.forEach((u): void => {
                            const resourceName = u.id;
                            const prefixName = resourceName.substring(0, resourceName.length - 3);
                            if (!existNames.has(prefixName)) {
                                existNames.add(prefixName);
                                resourceMapping.get(locale).push(u);
                            }
                        });
                    }
                }
            }
        }

        return this.fallbackMultiLangResource(resourceMapping);
    }

    public static parseLGFileName(lgFileName: string):  {prefix: string; language: string} {
        if (lgFileName === undefined || !lgFileName.endsWith('.lg')) {
            return {prefix: lgFileName, language: ''};
        }

        const fileName = lgFileName.substring(0, lgFileName.length - '.lg'.length);
        const lastDot = fileName.lastIndexOf('.');
        if (lastDot > 0) {
            return {prefix: fileName.substring(0, lastDot), language: fileName.substring(lastDot + 1)};
        } else {
            return {prefix: fileName, language: ''};
        }
    }

    public static fallbackLocale(locale: string, optionalLocales: string[]): string {
        if (optionalLocales === undefined) {
            throw new TypeError('Invalid Arguments');
        }

        if (optionalLocales.includes(locale.toLowerCase())) {
            return locale;
        }

        const languagePolicy = LanguagePolicy.defaultPolicy;
        if (languagePolicy[locale] !== undefined) {
            const fallbackLocales = languagePolicy[locale];
            for (const i in fallbackLocales) {
                const fallbackLocale = fallbackLocales[i];
                if (optionalLocales.includes(fallbackLocale)) {
                    return fallbackLocale;
                }
            }
        } else if (optionalLocales.includes('')) {
            return '';
        }

        throw new Error(`there is no locale fallback for ${ locale }`);
    }

    private static fallbackMultiLangResource(resourceMapping: Map<string, Resource[]>): Map<string, Resource[]> {
        const resourcePoolDict = new Map<string, Resource[]>();
        for (const currentLocale of resourceMapping.keys()) {
            const currentResourcePool: Resource[] = resourceMapping.get(currentLocale);
            const existLocale  = Array.from(resourcePoolDict.keys()).find(u => this.hasSameResourcePool(resourcePoolDict.get(u), currentResourcePool));
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


    private static findCommonAncestorLocale(locale1: string, locale2: string): string {
        const languagePolicy = LanguagePolicy.defaultPolicy;
        if (languagePolicy[locale1] === undefined || languagePolicy[locale2] === undefined) {
            return '';
        }

        const key1Policy = languagePolicy[locale1];
        const key2Policy = languagePolicy[locale2];
        for (const key1Language of key1Policy) {
            for (const key2Language of key2Policy) {
                if (key1Language === key2Language) {
                    return key1Language;
                }
            }
        }
        
        return '';
    }

    private static hasSameResourcePool(resourceMapping1: Resource[], resourceMapping2: Resource[]): boolean {
        if (resourceMapping1 === undefined && resourceMapping2 === undefined) {
            return true;
        }

        if ((resourceMapping1 === undefined && resourceMapping2 !== undefined)
        || (resourceMapping1 !== undefined && resourceMapping2 === undefined)
        || (resourceMapping1.length != resourceMapping2.length)) {
            return false;
        }

        const sortedResourceMapping1 = Array.from(resourceMapping1.sort());
        const sortedResourceMapping2 = Array.from(resourceMapping2.sort());
        for (const i in resourceMapping1){
            if (sortedResourceMapping1[i].id != sortedResourceMapping2[i].id)
            {
                return false;
            }
        }

        return true;
    }
}
