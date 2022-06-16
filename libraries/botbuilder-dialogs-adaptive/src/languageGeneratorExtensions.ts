/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import {
    LanguageGeneratorManager,
    ResourceMultiLanguageGenerator,
    TemplateEngineLanguageGenerator,
} from './generators';
import { LanguageGenerator } from './languageGenerator';
import { resourceExplorerKey } from './resourceExtensions';
import { LanguagePolicy } from './languagePolicy';

/**
 * The key to get or set language generator from turn state.
 */
export const languageGeneratorKey = Symbol('LanguageGenerator');

/**
 * The key to get or set language generator manager from turn state.
 */
export const languageGeneratorManagerKey = Symbol('LanguageGeneratorManager');

/**
 * The key to get or set language policy from turn state.
 */
export const languagePolicyKey = Symbol('LanguagePolicy');

/**
 * Extension methods for language generator.
 */
export class LanguageGeneratorExtensions {
    private static readonly _languageGeneratorManagers = new Map<ResourceExplorer, LanguageGeneratorManager>();

    /**
     * Register default LG file or a language generator as default language generator.
     *
     * @param dialogManager The dialog manager to add language generator to.
     * @param lg LG resource id (default: main.lg) or language generator to be added.
     * @returns dialog manager with language generator.
     */
    static useLanguageGeneration(dialogManager: DialogManager, lg?: string | LanguageGenerator): DialogManager {
        const resourceExplorer: ResourceExplorer =
            dialogManager.initialTurnState.get(resourceExplorerKey) || new ResourceExplorer();

        let languageGenerator = lg || 'main.lg';
        if (typeof languageGenerator === 'string') {
            const resource = resourceExplorer.getResource(languageGenerator);
            if (resource) {
                languageGenerator = new ResourceMultiLanguageGenerator(languageGenerator);
            } else {
                languageGenerator = new TemplateEngineLanguageGenerator();
            }
        }

        let languageGeneratorManager = this._languageGeneratorManagers.get(resourceExplorer);
        if (!languageGeneratorManager) {
            languageGeneratorManager = new LanguageGeneratorManager(resourceExplorer);
            this._languageGeneratorManagers.set(resourceExplorer, languageGeneratorManager);
        }

        dialogManager.initialTurnState.set(languageGeneratorKey, languageGenerator);
        dialogManager.initialTurnState.set(languageGeneratorManagerKey, languageGeneratorManager);

        return dialogManager;
    }

    /**
     * Register language policy as default policy.
     *
     * @param dialogManager The dialog manager to add language policy to.
     * @param policy Policy to use.
     * @returns dialog manager with language policy.
     */
    static useLanguagePolicy(dialogManager: DialogManager, policy: LanguagePolicy): DialogManager {
        dialogManager.initialTurnState.set(languagePolicyKey, policy);
        return dialogManager;
    }
}
