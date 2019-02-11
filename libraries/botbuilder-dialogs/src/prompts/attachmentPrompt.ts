/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Attachment, InputHints, TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptRecognizerResult, PromptValidator, PromptValidatorContext, PromptConfiguration } from './prompt';

/**
 * Prompts a user to upload attachments like images.
 *
 * @remarks
 * By default the prompt will return to the calling dialog an `Attachment[]`.
 */
export class AttachmentPrompt extends Prompt<Attachment[]> {

    /**
     * Creates a new `AttachmentPrompt` instance.
     * @param dialogId (Optional) unique ID of the dialog within its parent `DialogSet` or `ComponentDialog`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(dialogId?: string, validator?: PromptValidator<Attachment[]>) {
        super(dialogId, validator || defaultValidator);
    }

    protected onComputeID(): string {
        return `attachmentPrompt[${this.bindingPath()}]`;
    }

    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await context.sendActivity(options.retryPrompt, undefined, InputHints.ExpectingInput);
        } else if (options.prompt) {
            await context.sendActivity(options.prompt, undefined, InputHints.ExpectingInput);
        }
    }

    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<Attachment[]>> {
        const value: Attachment[] = context.activity.attachments;

        return Array.isArray(value) && value.length > 0 ? { succeeded: true, value: value } : { succeeded: false };
    }


    public static create(config?: PromptConfiguration): AttachmentPrompt {
        const dialog = new AttachmentPrompt();
        if (config) {
            Prompt.configure(dialog, config);
        }
        return dialog;
    }
}


async function defaultValidator(prompt: PromptValidatorContext<Attachment[]>): Promise<boolean> {
    if (prompt.preValidation) {
        const attachments = prompt.recognized.value;
        if (Array.isArray(attachments) && attachments.length > 0) {
            if (typeof attachments[0] === 'object' && (attachments[0].content || attachments[0].contentUrl)) {
                return true;
            }
        }

        return false;
    } else {
        return prompt.recognized.succeeded;
    }
}