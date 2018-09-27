/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputHints, TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptRecognizerResult, PromptValidator } from './prompt';

/**
 * Prompts a user to enter some text.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `string` representing the users reply.
 */
export class TextPrompt extends Prompt<string> {
    /**
     * The score that will be returned anytime `DialogContext.consultDialog()` is called for the
     * prompt.
     * 
     * @remarks
     * By default the text prompt returns a score of `0.5` but this can be raised to `1.0` for 
     * prompts that you don't want to be interruptable or lowered to `0.0` for prompts that you
     * always want to favor interruptions.
     */
    public consultScore: number = 0.5;

    /**
     * Creates a new TextPrompt instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet` or `ComponentDialog`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(dialogId: string, validator?: PromptValidator<string>) {
        super(dialogId, validator);
    }

    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await context.sendActivity(options.retryPrompt, undefined, InputHints.ExpectingInput);
        } else if (options.prompt) {
            await context.sendActivity(options.prompt, undefined, InputHints.ExpectingInput);
        }
    }

    protected async onConsult(context: TurnContext, state: any, options: PromptOptions): Promise<number> {
        return this.consultScore;
    }

    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<string>> {
        const value: string = context.activity.text;

        return typeof value === 'string' && value.length > 0 ? { succeeded: true, value: value } : { succeeded: false };
    }
}
