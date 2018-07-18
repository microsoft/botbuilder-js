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
export class ReturnValuesStep implements SequenceStep {

    public getId(stepIndex: number): string {
        // Return a unique ID.
        return 'ReturnValuesStep:' + stepIndex.toString();
    }
    
    public async onStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult> {
        return await dc.end(step.values);
    }
}
