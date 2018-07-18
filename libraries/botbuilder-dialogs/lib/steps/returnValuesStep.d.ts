/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult } from '../dialog';
import { DialogContext } from '../dialogContext';
import { SequenceStep, SequenceStepContext } from '../sequence';
/**
 * Ends the current `Sequence` and returns any accumulated values to the dialog that started the
 * sequence.
 */
export declare class ReturnValuesStep implements SequenceStep {
    getId(stepIndex: number): string;
    onStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult>;
}
