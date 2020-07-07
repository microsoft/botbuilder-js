/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { LanguageGeneratorManager, ResourceMultiLanguageGenerator, TemplateEngineLanguageGenerator } from './generators';
import { LanguageGenerator } from './languageGenerator';
import { resourceExplorerKey } from './resourceExtensions';
import { LanguagePolicy } from './languagePolicy';

export const languageGeneratorKey = Symbol('LanguageGenerator');
export const languageGeneratorManagerKey = Symbol('LanguageGeneratorManager');
export const languagePolicyKey = Symbol('LanguagePolicy');

export class LanguageGeneratorExtensions {
    /**
     * Register default LG file or a language generator as default language generator.
     */
    public static useLanguageGeneration(dialogManager: DialogManager, lg?: string | LanguageGenerator): DialogManager {
        const resourceExplorer: ResourceExplorer = dialogManager.initialTurnState.get(resourceExplorerKey) || new ResourceExplorer();
        let defaultLg = 'main.lg';
        if (lg) {
            if (typeof lg === 'string') {
                defaultLg = lg;
            }
        }
        const resource = resourceExplorer.getResource(defaultLg);
        let languageGenerator: LanguageGenerator;
        if (resource) {
            languageGenerator = new ResourceMultiLanguageGenerator(defaultLg);
        } else {
            languageGenerator = new TemplateEngineLanguageGenerator();
        }
        const languageGeneratorManager: LanguageGeneratorManager = new LanguageGeneratorManager(resourceExplorer);

        dialogManager.initialTurnState.set(languageGeneratorKey, languageGenerator);
        dialogManager.initialTurnState.set(languageGeneratorManagerKey, languageGeneratorManager);

        return dialogManager;
    };

    /**
     * Register language policy as default policy.
     */
    public static useLanguagePolicy(dialogManager: DialogManager, policy: LanguagePolicy): DialogManager {
        dialogManager.initialTurnState.set(languagePolicyKey, policy);
        return dialogManager;
    }
}