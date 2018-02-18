/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Attachment } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator, formatPrompt } from './prompt';

export class AttachmentPrompt implements Dialog {
    constructor(private validator?: PromptValidator<Attachment[]>) {}

    public begin(context: BotContext, dialogs: DialogSet, options: PromptOptions): Promise<void> {
        // Persist options
        const instance = dialogs.getInstance<PromptOptions>(context);
        instance.state = options || {};

        // Send initial prompt
        if (instance.state.prompt) { context.reply(formatPrompt(instance.state.prompt, instance.state.speak)) }
        return Promise.resolve();
    }

    public continue(context: BotContext, dialogs: DialogSet): Promise<void> {
        // Recognize value
        const options = dialogs.getInstance<PromptOptions>(context).state;
        const values: Attachment[] = context.request && context.request.attachments ? context.request.attachments : [];
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, values, dialogs));
        } else if (values.length > 0) {
            // Return recognized values
            return dialogs.end(context, values);
        } else {
            if (options.retryPrompt) {
                // Send retry prompt to user
                context.reply(formatPrompt(options.retryPrompt, options.retrySpeak));
            } else if (options.prompt) {
                // Send original prompt to user
                context.reply(formatPrompt(options.prompt, options.speak));
            }
            return Promise.resolve();
        }
    }
}
