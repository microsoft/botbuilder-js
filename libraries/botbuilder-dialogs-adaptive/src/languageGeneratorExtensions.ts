import { DialogManager } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { LanguageGeneratorManager, ResourceMultiLanguageGenerator, TemplateEngineLanguageGenerator } from './generators';
import { LanguageGenerator } from './languageGenerator';
import { resourceExplorerKey } from './resourceExtensions';

declare module 'botbuilder-dialogs/lib/dialogManager' {
    export interface DialogManager {
        useLanguageGeneration(lg?: string | LanguageGenerator): Promise<void>;
    }
}

export const languageGeneratorKey = Symbol('LanguageGenerator');
export const languageGeneratorManagerKey = Symbol('LanguageGeneratorManager');

DialogManager.prototype.useLanguageGeneration = async function(lg?: string | LanguageGenerator): Promise<void> {
    const _self = this as DialogManager;
    const resourceExplorer: ResourceExplorer = _self.initialTurnState.get(resourceExplorerKey) || new ResourceExplorer();
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
    await languageGeneratorManager.loadResources();

    _self.initialTurnState.set(languageGeneratorKey, languageGenerator);
    _self.initialTurnState.set(languageGeneratorManagerKey, languageGeneratorManager);
};
