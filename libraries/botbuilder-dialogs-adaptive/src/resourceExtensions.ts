/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

declare module 'botbuilder-dialogs/lib/dialogManager' {
    export interface DialogManager {
        useResourceExplorer(resourceExplorer: ResourceExplorer): DialogManager;
    }
}

export const resourceExplorerKey = Symbol('ResourceExplorer');

/**
 * Register ResourceExplorer into DialogManager.
 */
DialogManager.prototype.useResourceExplorer = function(resourceExplorer: ResourceExplorer): DialogManager {
    const _self = this as DialogManager;
    _self.initialTurnState.set(resourceExplorerKey, resourceExplorer);
    return _self;
};