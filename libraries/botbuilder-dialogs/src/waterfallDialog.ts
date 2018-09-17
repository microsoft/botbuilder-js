/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityTypes } from 'botbuilder-core';
import { Dialog, DialogReason, DialogTurnResult } from './dialog';
import { DialogContext } from './dialogContext';
import { WaterfallStepContext } from './waterfallStepContext';

/**
 * Function signature of a waterfall step.
 *
 * @remarks
 *
 * ```TypeScript
 * type WaterfallStep = (step: WaterfallStepContext<O>) => Promise<DialogTurnResult>;
 * ```
 * @param WaterfallStepContext Contextual information for the current step being executed.
 */
export type WaterfallStep<O extends object = {}> = (step: WaterfallStepContext<O>) => Promise<DialogTurnResult>;

/**
 * When called within a waterfall step the dialog will skip to the next waterfall step.
 *
 * ```TypeScript
 * type SkipStepFunction = (args?: any) => Promise<DialogTurnResult>;
 * ```
 * @param SkipStepFunction.args (Optional) additional argument(s) to pass into the next step.
 */
export type SkipStepFunction = (args?: any) => Promise<DialogTurnResult>;

/**
 * Dialog optimized for prompting a user with a series of questions.
 *
 * @remarks
 * Waterfalls accept a stack of functions which will be executed in sequence. Each waterfall step
 * can ask a question of the user and the users response will be passed as an argument to the next
 * waterfall step.
 */
export class WaterfallDialog<O extends object = {}> extends Dialog<O> {
    private readonly steps: WaterfallStep<O>[];

    /**
     * Creates a new waterfall dialog containing the given array of steps.
     * @param steps Array of waterfall steps.
     */
    constructor(dialogId: string, steps?: WaterfallStep<O>[]) {
        super(dialogId);
        this.steps = [];
        if (steps) {
            this.steps = steps.slice(0);
        }
    }

    /**
     * add a new step to the waterfall
     * @param step method to call
     * @returns WaterfallDialog
     */
    public addStep(step: WaterfallStep<O>): WaterfallDialog<O> {
        this.steps.push(step);
        return this;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Initialize waterfall state
        const state: WaterfallDialogState = dc.activeDialog.state as WaterfallDialogState;
        state.options = options || {};
        state.values = {};

        // Run the first step
        return await this.runStep(dc, 0, DialogReason.beginCalled);
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Don't do anything for non-message activities
        if (dc.context.activity.type !== ActivityTypes.Message) {
            return Dialog.EndOfTurn;
        }

        // Run next step with the message text as the result.
        return await this.resumeDialog(dc, DialogReason.continueCalled, dc.context.activity.text);
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Increment step index and run step
        const state: WaterfallDialogState = dc.activeDialog.state as WaterfallDialogState;

        return await this.runStep(dc, state.stepIndex + 1, reason, result);
    }

    protected async onStep(step: WaterfallStepContext<O>): Promise<DialogTurnResult> {
        return await this.steps[step.index](step);
    }

    private async runStep(dc: DialogContext, index: number, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        if (index < this.steps.length) {
            // Update persisted step index
            const state: WaterfallDialogState = dc.activeDialog.state as WaterfallDialogState;
            state.stepIndex = index;

            // Create step context
            const nextCalled: boolean = false;
            const step = new WaterfallStepContext<O>(dc, {
                index: index,
                options: <O>state.options,
                reason: reason,
                result: result,
                values: state.values,
                onNext: async (stepResult?: any): Promise<DialogTurnResult<any>> => {
                    if (nextCalled) {
                        throw new Error(`WaterfallStepContext.next(): method already called for dialog and step '${this.id}[${index}]'.`);
                    }

                    return await this.resumeDialog(dc, DialogReason.nextCalled, stepResult);
                }
            });

            // Execute step
            return await this.onStep(step);
        } else {
            // End of waterfall so just return to parent
            return await dc.endDialog(result);
        }
    }
}

/**
 * @private
 */
interface WaterfallDialogState {
    options: object;
    stepIndex: number;
    values: object;
}
