/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogState } from '../dialogContext';
 
export interface PlanState {
    title?: string;
    steps: PlanStepState[];
}

export interface PlanStepState {
    dialogId: string;
    dialogOptions?: object;
    dialogState?: DialogState;
}
