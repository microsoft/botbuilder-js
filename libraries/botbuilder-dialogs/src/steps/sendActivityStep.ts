/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from '../../../botbuilder/lib';
import { DialogTurnResult } from '../dialog';
import { DialogContext } from '../dialogContext';
import { SequenceStep, SequenceStepContext } from '../sequence';

/**
 * Sends an activity or message to a user and then moves immediately to the next step within a
 * sequence.
 */
export class SendActivityStep implements SequenceStep {
    constructor (private readonly activityOrText: string|Partial<Activity>) { }

    public getId(stepIndex: number): string {
        // Return a unique ID.
        return 'SendActivityStep:' + stepIndex.toString();
    }
    
    public async onStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult> {
        // Send activity and move to next step
        await dc.context.sendActivity(this.activityOrText);
        return step.next();
    }
}
