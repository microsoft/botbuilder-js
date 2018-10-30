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

    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<string>> {
        const value: string = context.activity.text;

        return typeof value === 'string' && value.length > 0 ? { succeeded: true, value: value } : { succeeded: false };
    }
}
