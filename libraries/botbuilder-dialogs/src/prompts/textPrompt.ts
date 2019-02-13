/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputHints, TurnContext, Activity } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptRecognizerResult, PromptValidator, PromptValidatorContext, PromptConfiguration } from './prompt';

/**
 * Prompts a user to enter some text.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `string` representing the users reply.
 */
export class TextPrompt extends Prompt<string> {

    /**
     * Creates a new TextPrompt instance.
     * @param dialogId (Optional) unique ID of the dialog within its parent `DialogSet` or `ComponentDialog`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(dialogId?: string, validator?: PromptValidator<string>) {
        super(dialogId, validator||defaultValidator);
    }

    protected onComputeID(): string {
        return `textPrompt[${this.bindingPath() || this.prompt.displayLabel}]`;
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

    public static create(propertyOrConfig: PromptConfiguration): TextPrompt;
    public static create(propertyOrConfig: string, prompt: string|Partial<Activity>, config?: PromptConfiguration): TextPrompt;
    public static create(propertyOrConfig: string|PromptConfiguration, prompt?: Partial<Activity>|string, config?: PromptConfiguration): TextPrompt {
        const dialog = new TextPrompt();
        if (typeof propertyOrConfig === 'string') {
            dialog.property = propertyOrConfig;
            dialog.prompt.value = prompt;
            if (config) { Prompt.configure(dialog, config) }
        } else {
            Prompt.configure(dialog, config);
        }
        return dialog;
    }
}

async function defaultValidator(prompt: PromptValidatorContext<string>): Promise<boolean> {
    return prompt.preValidation ? typeof prompt.recognized.value === 'string' : prompt.recognized.succeeded;
}