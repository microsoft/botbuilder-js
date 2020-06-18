import { DialogManager } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

declare module 'botbuilder-dialogs/lib/dialogManager' {
    export interface DialogManager {
        useResourceExplorer(resourceExplorer: ResourceExplorer): void;
    }
}

DialogManager.prototype.useResourceExplorer = function(resourceExplorer: ResourceExplorer): void {
    const _self = this as DialogManager;
    _self.initialTurnState.set('ResourceExplorer', resourceExplorer);
};