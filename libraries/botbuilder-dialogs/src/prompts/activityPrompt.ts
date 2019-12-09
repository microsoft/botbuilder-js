/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, InputHints, TurnContext, ActivityTypes } from 'botbuilder-core';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult } from '../dialog';
import { DialogContext } from '../dialogContext';
import { PromptOptions, PromptRecognizerResult, PromptValidator } from './prompt';

/**
 * Waits for an activity to be received.
 *
 * @remarks
 * This prompt requires a validator be passed in and is useful when waiting for non-message
 * activities like an event to be received. The validator can ignore received events until the
 * expected activity is received.
 */
export class ActivityPrompt extends Dialog {

    /**
     * Creates a new ActivityPrompt instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet` or `ComponentDialog`.
     * @param validator Validator that will be called each time a new activity is received.
     */
    constructor(dialogId: string, private validator: PromptValidator<Activity>) {
        super(dialogId);
    }

    public async beginDialog(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult> {
        // Ensure prompts have input hint set
        const opt: Partial<PromptOptions> = {...options};
        if (opt.prompt && typeof opt.prompt === 'object' && typeof opt.prompt.inputHint !== 'string') {
            opt.prompt.inputHint = InputHints.ExpectingInput;
        }
        if (opt.retryPrompt && typeof opt.retryPrompt === 'object' && typeof opt.retryPrompt.inputHint !== 'string') {
            opt.retryPrompt.inputHint = InputHints.ExpectingInput;
        }

        // Initialize prompt state
        const state: any = dc.activeDialog.state as ActivityPromptState;
        state.options = opt;
        state.state = {};

        // Send initial prompt
        await this.onPrompt(dc.context, state.state, state.options, false);

        return Dialog.EndOfTurn;
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Perform base recognition
        const state: any = dc.activeDialog.state as ActivityPromptState;
        const recognized: PromptRecognizerResult<Activity> = await this.onRecognize(dc.context, state.state, state.options);

        if (state.state['attemptCount'] === undefined) {
            state.state['attemptCount'] = 0;
        }

        // Validate the return value
        // - Unlike the other prompts a validator is required for an ActivityPrompt so we don't
        //   need to check for its existence before calling it.
        const isValid: boolean = await this.validator({
            context: dc.context,
            recognized: recognized,
            state: state.state,
            options: state.options,
            attemptCount: ++state.state['attemptCount']
        });

        // Return recognized value or re-prompt
        if (isValid) {
            return await dc.endDialog(recognized.value);
        } else {
            if (dc.context.activity.type === ActivityTypes.Message && !dc.context.responded) {
                await this.onPrompt(dc.context, state.state, state.options, true);
            }

            return Dialog.EndOfTurn;
        }
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Prompts are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the prompt receiving an unexpected call to
        // resumeDialog() when the pushed on dialog ends.
        // To avoid the prompt prematurely ending we need to implement this method and
        // simply re-prompt the user.
        await this.repromptDialog(dc.context, dc.activeDialog);

        return Dialog.EndOfTurn;
    }

    public async repromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        const state: ActivityPromptState = instance.state as ActivityPromptState;
        await this.onPrompt(context, state.state, state.options, true);
    }

    protected async onPrompt(context: TurnContext, state: object, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await context.sendActivity(options.retryPrompt, undefined, InputHints.ExpectingInput);
        } else if (options.prompt) {
            await context.sendActivity(options.prompt, undefined, InputHints.ExpectingInput);
        }
    }

    protected async onRecognize(context: TurnContext, state: object, options: PromptOptions): Promise<PromptRecognizerResult<Activity>> {
        return { succeeded: true, value: context.activity };
    }
}

/**
 * @private
 */
interface ActivityPromptState {
    state: object;
    options: PromptOptions;
}
