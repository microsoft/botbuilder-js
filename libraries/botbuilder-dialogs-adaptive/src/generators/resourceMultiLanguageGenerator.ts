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
import { LanguageGeneratorManager } from './languageGeneratorManager';
import { languageGeneratorManagerKey } from '../languageGeneratorExtensions';

/**
 * Initializes a new instance of the ResourceMultiLanguageGenerator class.
 */
export class ResourceMultiLanguageGenerator extends MultiLanguageGeneratorBase {
    public resourceId: string;

    public constructor(resourceId: string = undefined, languagePolicy: any = undefined) {
        super(languagePolicy);
        this.resourceId = resourceId;
    }

    public tryGetGenerator(dialogContext: DialogContext, locale: string): {exist: boolean; result: LanguageGenerator} {
        const lgm: LanguageGeneratorManager = dialogContext.services.get(languageGeneratorManagerKey);
        const resourceId = (locale === undefined || locale === '')? this.resourceId : this.resourceId.replace('.lg', `.${ locale }.lg`);
        if (lgm.languageGenerators.has(resourceId)) {
            return {exist: true, result: lgm.languageGenerators.get(resourceId)};
        } else {
            return {exist: false, result: undefined};
        }
    }
}