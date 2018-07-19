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
import { SequenceStep, SequenceStepContext } from '../sequenceDialog';
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
export class PromptStep implements SequenceStep {
    private readonly valueName: string;
    private readonly promptDialogId: string;
    private readonly promptOptions: PromptOptions;
    private readonly alwaysPrompt: boolean;

    constructor(valueName: string, promptDialogId: string, promptOrOptions: string|Partial<Activity>, choices?: (string|Choice)[]);
    constructor(valueName: string, promptDialogId: string, promptOrOptions: PromptStepOptions);
    constructor(valueName: string, promptDialogId: string, promptOrOptions: string|Partial<Activity>|PromptStepOptions, choices?: (string|Choice)[]) {
        this.valueName = valueName;
        this.promptDialogId = promptDialogId;
        if (typeof promptOrOptions === 'object' && (promptOrOptions as PromptStepOptions).prompt !== undefined) {
            this.promptOptions = Object.assign({}, promptOrOptions as PromptStepOptions);
            this.alwaysPrompt = !!(promptOrOptions as PromptStepOptions).alwaysPrompt;
        } else {
            this.promptOptions = { prompt: promptOrOptions, choices: choices };
            this.alwaysPrompt = false;
        }
    }

    public getId(stepIndex: number): string {
        // Return a unique ID.
        return 'PromptStep:' + this.valueName;
    }
    
    public async onStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult> {
        // Have we prompted the user already?
        const state = step.state as StepState;
        if (state.prompted) {
            // Save result to 'values' collection.
            step.values[this.valueName] = step.result;
            return await step.next();
        } else {
            // Should we prompt for value?
            const value = step.values[this.valueName];
            if (value === undefined || this.alwaysPrompt) {
                // Call prompt.
                state.prompted = true;
                return await dc.prompt(this.promptDialogId, this.promptOptions);
            } else {
                // Skip to next step.
                return await step.next();
            }
        }
    }
}

interface StepState {
    prompted: boolean;
}
