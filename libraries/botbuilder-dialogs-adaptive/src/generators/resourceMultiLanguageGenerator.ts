/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { MultiLanguageGeneratorBase, MultiLanguageGeneratorBaseConfiguration } from './multiLanguageGeneratorBase';
import { LanguageGenerator } from '../languageGenerator';
import { LanguageGeneratorManager } from './languageGeneratorManager';
import { languageGeneratorManagerKey } from '../languageGeneratorExtensions';

/**
 * Multi language resource generator that extends [MultiLanguageGeneratorBase](xref:botbuilder-dialogs-adaptive.MultiLanguageGeneratorBase) class.
 */
export interface ResourceMultiLanguageGeneratorConfiguration extends MultiLanguageGeneratorBaseConfiguration {
    resourceId?: string;
}

export class ResourceMultiLanguageGenerator<T = unknown, D extends Record<string, unknown> = Record<string, unknown>>
    extends MultiLanguageGeneratorBase<T, D>
    implements ResourceMultiLanguageGeneratorConfiguration {
    public static $kind = 'Microsoft.ResourceMultiLanguageGenerator';

    /**
     * Initializes a new instance of the ResourceMultiLanguageGenerator class.
     * @param resourceId Resource id of LG file.
     */
    public constructor(resourceId?: string) {
        super();
        this.resourceId = resourceId;
    }

    /**
     * Resource id of LG file.
     */
    public resourceId: string;

    /**
     * Implementation of lookup by locale.
     * @param dialogContext Context for the current turn of conversation.
     * @param locale Locale to lookup.
     */
    public tryGetGenerator(
        dialogContext: DialogContext,
        locale: string
    ): { exist: boolean; result: LanguageGenerator<T, D> } {
        const manager = dialogContext.services.get(languageGeneratorManagerKey) as LanguageGeneratorManager<T, D>;

        const resourceId =
            locale === undefined || locale === '' ? this.resourceId : this.resourceId.replace('.lg', `.${locale}.lg`);

        if (manager.languageGenerators.has(resourceId)) {
            return { exist: true, result: manager.languageGenerators.get(resourceId) as LanguageGenerator<T, D> };
        } else {
            return { exist: false, result: undefined };
        }
    }
}
