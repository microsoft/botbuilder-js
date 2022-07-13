/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogManager } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

/**
 * The key to set or get resource explorer from turn state.
 */
export const resourceExplorerKey = Symbol('ResourceExplorer');

/**
 * Extension methods for resource explorer.
 */
export class ResourceExtensions {
    /**
     * Register ResourceExplorer into DialogManager.
     *
     * @param dialogManager The dialog manager to add resource explorer to.
     * @param resourceExplorer The resource explorer to be added.
     * @returns dialog manager with resource explorer.
     */
    static useResourceExplorer(dialogManager: DialogManager, resourceExplorer: ResourceExplorer): DialogManager {
        dialogManager.initialTurnState.set(resourceExplorerKey, resourceExplorer);
        return dialogManager;
    }
}
