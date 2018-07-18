/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from '../../../botbuilder/lib';
import { Choice } from '../../../botbuilder-prompts/lib';
import { DialogTurnResult } from '../dialog';
import { DialogContext } from '../dialogContext';
import { SequenceStep, SequenceStepContext } from '../sequence';
import { PromptOptions } from '../prompts/prompt';
/**
 * Additional options which can be configured for a `PromptStep`.
 */
export interface PromptStepOptions extends PromptOptions {
    /**
     * (Optional) if `true` the value will always be prompted for regardless of the current value.
     *
     * @remarks
     * The default value is `false` meaning that the value will only be prompted for if its missing
     * from the current sequences `values` collection.
     */
    alwaysPrompt?: boolean;
}
/**
 * Calls a prompt with a set of options, stores the users input in the sequences `values`
 * collection, and then moves to the next step within the sequence.
 *
 * @remarks
 * By default the prompt is only called if the value doesn't already exist within the `values`
 * collection. The `PromptStepOptions.alwaysPrompt` option can be used to force the user to be
 * prompted regardless of whether a value exists in the `values` collection.
 */
export declare class PromptStep implements SequenceStep {
    private readonly valueName;
    private readonly promptDialogId;
    private readonly promptOptions;
    private readonly alwaysPrompt;
    constructor(valueName: string, promptDialogId: string, promptOrOptions: string | Partial<Activity>, choices?: (string | Choice)[]);
    constructor(valueName: string, promptDialogId: string, promptOrOptions: PromptStepOptions);
    getId(stepIndex: number): string;
    onStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult>;
}
