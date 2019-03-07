/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityTypes } from 'botbuilder-core';
import { TurnContext } from 'botbuilder-core';
import { DialogInstance } from './dialog';
import { Dialog, DialogReason, DialogTurnResult } from './dialog';
import { DialogContext } from './dialogContext';
import { WaterfallStepContext } from './waterfallStepContext';

/**
 * Function signature of an individual waterfall step.
 *
 * ```TypeScript
 * type WaterfallStep<O extends object = {}> = (step: WaterfallStepContext<O>) => Promise<DialogTurnResult>;
 * ```
 * @param O (Optional) type of dialog options passed into the step.
 * @param WaterfallStep.step Contextual information for the current step being executed.
 */
export type WaterfallStep<O extends object = {}> = (step: WaterfallStepContext<O>) => Promise<DialogTurnResult>;

/**
 * A waterfall is a dialog that's optimized for prompting a user with a series of questions.
 *
 * @remarks
 * Waterfalls accept a stack of functions which will be executed in sequence. Each waterfall step
 * can ask a question of the user and the user's response will be passed to the next step in the
 * waterfall via `step.result`. A special `step.value` object can be used to persist values between
 * steps:
 *
 * ```JavaScript
 * const { ComponentDialog, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs);
 *
 * class FillProfileDialog extends ComponentDialog {
 *     constructor(dialogId) {
 *         super(dialogId);
 *
 *         // Add control flow dialogs
 *         this.addDialog(new WaterfallDialog('start', [
 *             async (step) => {
 *                 // Ask user their name
 *                 return await step.prompt('namePrompt', `What's your name?`);
 *             },
 *             async (step) => {
 *                 // Remember the users answer
 *                 step.values['name'] = step.result;
 *
 *                 // Ask user their age.
 *                 return await step.prompt('agePrompt', `Hi ${step.values['name']}. How old are you?`);
 *             },
 *             async (step) => {
 *                 // Remember the users answer
 *                 step.values['age'] = step.result;
 *
 *                 // End the component and return the completed profile.
 *                 return await step.endDialog(step.values);
 *             }
 *         ]));
 *
 *         // Add prompts
 *         this.addDialog(new TextPrompt('namePrompt'));
 *         this.addDialog(new NumberPrompt('agePrompt'))
 *     }
 * }
 * module.exports.FillProfileDialog = FillProfileDialog;
 * ```
 */
export class WaterfallDialog<O extends object = {}> extends Dialog<O> {
    private readonly steps: WaterfallStep<O>[];

    /**
     * Creates a new waterfall dialog containing the given array of steps.
     *
     * @remarks
     * See the [addStep()](#addstep) function for details on creating a valid step function.
     * @param dialogId Unique ID of the dialog within the component or set its being added to.
     * @param steps (Optional) array of asynchronous waterfall step functions.
     */
    constructor(dialogId: string, steps?: WaterfallStep<O>[]) {
        super(dialogId);
        this.steps = [];
        if (steps) {
            this.steps = steps.slice(0);
        }
    }

    /**
     * Adds a new step to the waterfall.
     *
     * @remarks
     * All step functions should be asynchronous and return a `DialogTurnResult`. The
     * `WaterfallStepContext` passed into your function derives from `DialogContext` and contains
     * numerous stack manipulation methods which return a `DialogTurnResult` so you can typically
     * just return the result from the DialogContext method you call.
     *
     * The step function itself can be either an asynchronous closure:
     *
     * ```JavaScript
     * const helloDialog = new WaterfallDialog('hello');
     *
     * helloDialog.addStep(async (step) => {
     *     await step.context.sendActivity(`Hello World!`);
     *     return await step.endDialog();
     * });
     * ```
     *
     * A named async function:
     *
     * ```JavaScript
     * async function helloWorldStep(step) {
     *     await step.context.sendActivity(`Hello World!`);
     *     return await step.endDialog();
     * }
     *
     * helloDialog.addStep(helloWorldStep);
     * ```
     *
     * Or a class method that's been bound to its `this` pointer:
     *
     * ```JavaScript
     * helloDialog.addStep(this.helloWorldStep.bind(this));
     * ```
     * @param step Asynchronous step function to call.
     */
    public addStep(step: WaterfallStep<O>): this {
        this.steps.push(step);

        return this;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Initialize waterfall state
        const state: WaterfallDialogState = dc.activeDialog.state as WaterfallDialogState;
        state.options = options || {};
        state.values = {
            instanceId: generate_guid()
        };

        this.telemetryClient.trackEvent({name: 'WaterfallStart', properties: {
            'DialogId': this.id,
            'InstanceId': state.values['instanceId']
        }});

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

    /**
     * Called when an individual waterfall step is being executed.
     *
     * @remarks
     * SHOULD be overridden by derived class that want to add custom logging semantics.
     *
     * ```JavaScript
     * class LoggedWaterfallDialog extends WaterfallDialog {
     *     async onStep(step) {
     *          console.log(`Executing step ${step.index} of the "${this.id}" waterfall.`);
     *          return await super.onStep(step);
     *     }
     * }
     * ```
     * @param step Context object for the waterfall step to execute.
     */
    protected async onStep(step: WaterfallStepContext<O>): Promise<DialogTurnResult> {
        // Log Waterfall Step event. 
        var stepName = this.waterfallStepName(step.index);

        const state: WaterfallDialogState = step.activeDialog.state as WaterfallDialogState;

        var properties = 
        { 
            'DialogId': this.id,
            'InstanceId': state.values['instanceId'],
            'StepName': stepName,
        };
        this.telemetryClient.trackEvent({name: 'WaterfallStep', properties: properties});
        return await this.steps[step.index](step);
    }

    private async runStep(dc: DialogContext, index: number, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        if (index < this.steps.length) {
            // Update persisted step index
            const state: WaterfallDialogState = dc.activeDialog.state as WaterfallDialogState;
            state.stepIndex = index;

            // Create step context
            let nextCalled = false;
            const step: WaterfallStepContext<O> = new WaterfallStepContext<O>(dc, {
                index: index,
                options: <O>state.options,
                reason: reason,
                result: result,
                values: state.values,
                onNext: async (stepResult?: any): Promise<DialogTurnResult<any>> => {
                    if (nextCalled) {
                        throw new Error(`WaterfallStepContext.next(): method already called for dialog and step '${ this.id }[${ index }]'.`);
                    }
                    nextCalled = true;
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

    /**
     * Called when the dialog is ending.
     *
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     * @param reason The reason the dialog is ending.
     */
    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason) {

        const state: WaterfallDialogState = instance.state as WaterfallDialogState;
        const instanceId = state.values['instanceId'];
        if (reason === DialogReason.endCalled) {
            this.telemetryClient.trackEvent({name: 'WaterfallComplete', properties: {
                'DialogId': this.id,
                'InstanceId': instanceId,
            }});
        } else if (reason === DialogReason.cancelCalled) {
            var index = instance.state[state.stepIndex];
            var stepName = this.waterfallStepName(index);
            this.telemetryClient.trackEvent({name: 'WaterfallCancel', properties: {
                'DialogId': this.id,
                'StepName': stepName,
                'InstanceId': instanceId,
            }});
        }
    }

    private waterfallStepName(index) {
        // Log Waterfall Step event. Each event has a distinct name to hook up
        // to the Application Insights funnel.
        var stepName = '';
        if (this.steps[index]) {
            try {
                stepName = this.steps[index].name;
            } finally {
                if (stepName === undefined || stepName === '') {
                    stepName = 'Step' + (index + 1) + 'of' + (this.steps.length);
                }
            }
        }
        return stepName;        
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

/* 
 * This function generates a GUID-like random number that should be sufficient for our purposes of tracking 
 * instances of a given waterfall dialog.
 * Source: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */  
function generate_guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}