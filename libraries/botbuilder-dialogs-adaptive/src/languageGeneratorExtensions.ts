import { DialogManager } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { LanguageGeneratorManager, ResourceMultiLanguageGenerator, TemplateEngineLanguageGenerator } from './generators';
import { LanguageGenerator } from './languageGenerator';

declare module 'botbuilder-dialogs/lib/dialogManager' {
    export interface DialogManager {
        useLanguageGeneration(lg?: string | LanguageGenerator): Promise<void>;
    }
}

DialogManager.prototype.useLanguageGeneration = async function(lg?: string | LanguageGenerator): Promise<void> {
    const _self = this as DialogManager;
    const resourceExplorer: ResourceExplorer = _self.initialTurnState.get('ResourceExplorer') || new ResourceExplorer();
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

    _self.initialTurnState.set('LanguageGenerator', languageGenerator);
    _self.initialTurnState.set('LanguageGeneratorManager', languageGeneratorManager);
};
