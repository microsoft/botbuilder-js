/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult } from '../dialog';
import { DialogContext } from '../dialogContext';
import { SequenceStep, SequenceStepContext } from '../sequenceDialog';
export declare type CodeStepHandler = (dc: DialogContext, step: SequenceStepContext) => Promise<DialogTurnResult>;
/**
 * Allows for the execution of a custom block of code within a `Sequence`.
 *
 * @remarks
 * Code steps can be used for a variety of purposes:
 *
 * - A code step can be used at the end of a sequence to assemble all of the `values` populated by
 *   other steps (like `PromptStep`) and then perform some action.
 * - A code step can be used at the beginning of a sequence to perform some pre-processing of the
 *   sequences `values` before executing the rest of the sequence.
 * - Code steps can be used in place of a `PromptStep` within the middle of a sequence to perform
 *   some custom logic before calling `dc.prompt()`.
 *
 * Code steps behave very similarly to waterfall steps. An individual code step is only ever
 * executed once per dialog invocation. If a code step executes and fails to call `step.next()`
 * before it ends then the users next utterance will cause the sequence to automatically move
 * the next step.
 *
 * If a step specifies a `valueName` and then starts another dialog, using either `dc.begin()` or
 * `dc.prompt()`, any result returned from that dialog will be saved to the sequences `values`
 * collection and then the sequence will move to the next step. *
 */
export declare class CodeStep implements SequenceStep {
    private readonly valueName;
    private readonly handler;
    constructor(valueNameOrHandler: string | CodeStepHandler, handler?: CodeStepHandler);
    getId(stepIndex: number): string;
    onStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult>;
}
