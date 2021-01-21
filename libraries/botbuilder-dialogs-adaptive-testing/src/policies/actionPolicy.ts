/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ActionPolicyType } from './actionPolicyTypes';

export class ActionPolicy {
    public constructor(public kind: string, public actionPolicyType: ActionPolicyType, public actions: string[] = []) {}
}
