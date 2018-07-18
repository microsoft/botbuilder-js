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
export declare class SendActivityStep implements SequenceStep {
    private readonly activityOrText;
    constructor(activityOrText: string | Partial<Activity>);
    getId(stepIndex: number): string;
    onStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult>;
}
