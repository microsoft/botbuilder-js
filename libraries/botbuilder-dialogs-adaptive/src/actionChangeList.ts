/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ActionState } from './actionState';
import { ActionChangeType } from './actionChangeType';

export interface ActionChangeList {
    /**
     * Type of change being made.
     */
    changeType: ActionChangeType;

    /**
     * Ordered list of actions for change.
     */
    actions?: ActionState[];

    /**
     * Turn state associated with the change.
     *
     * @remarks
     * The current turn state will be update when the plan change is applied.
     */
    turn?: { [key: string]: string };
}
