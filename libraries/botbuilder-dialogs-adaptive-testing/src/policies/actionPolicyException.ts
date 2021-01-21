/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ActionPolicy } from './actionPolicy';
import { Dialog } from 'botbuilder-dialogs';

export class ActionPolicyException extends Error {
    constructor(public readonly policy: ActionPolicy, public readonly dialog: Dialog) {
        super();

        this.name = 'ActionPolicyException';
    }
}
