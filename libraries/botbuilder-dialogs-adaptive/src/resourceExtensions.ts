/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

export const resourceExplorerKey = Symbol('ResourceExplorer');

export class ResourceExtensions {
    /**
     * Register ResourceExplorer into DialogManager.
     */
    public static useResourceExplorer(dialogManager: DialogManager, resourceExplorer: ResourceExplorer): DialogManager {
        dialogManager.initialTurnState.set(resourceExplorerKey, resourceExplorer);
        return dialogManager;
    }
}