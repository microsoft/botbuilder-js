/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator, formatPrompt } from './prompt';

export class TextPrompt implements Dialog {
    constructor(private validator?: PromptValidator<string>) {}

    public begin(context: BotContext, dialogs: DialogSet, options: PromptOptions): Promise<void> {
        // Persist options
        const instance = dialogs.getInstance<PromptOptions>(context);
        instance.state = options || {};

        // Send initial prompt
        if (instance.state.prompt) { context.reply(formatPrompt(instance.state.prompt, instance.state.speak)) }
        return Promise.resolve();
    }

    public continue(context: BotContext, dialogs: DialogSet): Promise<void> {
        // Recognize value and call validator
        const utterance = context.request && context.request.text ? context.request.text : '';
        if (this.validator) {
            return Promise.resolve(this.validator(context, utterance, dialogs));
        } else {
            // Default behavior is to just return recognized value
            return dialogs.end(context, utterance);
        }
    }
}
