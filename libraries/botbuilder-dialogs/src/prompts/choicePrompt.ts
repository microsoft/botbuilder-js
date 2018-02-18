/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, InputHints } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator } from './prompt';
import { Choice, ChoiceStyler, ChoiceStylerOptions, recognizeChoices, FoundChoice } from 'botbuilder-choices';

export enum ListStyle {
    /** Don't include any choices for prompt. */
    none,

    /** Automatically select the appropriate style for the current channel. */
    auto,

    /** Add choices to prompt as an inline list. */
    inline,

    /** Add choices to prompt as a numbered list. */
    list,

    /** Add choices to prompt as suggested actions. */
    suggestedAction
}

export interface ChoicePromptOptions extends PromptOptions {
    /** List of choices to recognize. */
    choices?: (string|Choice)[];

    /** Preferred style of the choices sent to the user. The default value is `ChoicePromptStyle.auto`. */
    style?: ListStyle;

}

export type DynamicChoicesProvider = (context: BotContext, recognizePhase: boolean, dialogs: DialogSet) => Promiseable<(string|Choice)[]>;

export class ChoicePrompt implements Dialog {
    public readonly stylerOptions: ChoiceStylerOptions = {};

    constructor(private validator?: PromptValidator<FoundChoice|undefined>, private choices?: DynamicChoicesProvider) {}

    public begin(context: BotContext, dialogs: DialogSet, options: ChoicePromptOptions): Promise<void> {
        // Persist options
        const instance = dialogs.getInstance<ChoicePromptOptions>(context);
        instance.state = options || {};

        // Send initial prompt
        if (instance.state.prompt) {
            return this.sendChoicePrompt(context, dialogs, instance.state.prompt, instance.state.speak);
        } else {
            return Promise.resolve();
        }
    }

    public continue(context: BotContext, dialogs: DialogSet): Promise<void> {
        // Get choices to recognize against
        return this.getChoices(context, true, dialogs)
            .then((choices) => {
                // Recognize value
                const options = dialogs.getInstance<ChoicePromptOptions>(context).state;
                const utterance = context.request && context.request.text ? context.request.text : '';
                const results = recognizeChoices(utterance, choices);
                const value = results.length > 0 ? results[0].resolution : undefined;
                if (this.validator) {
                    // Call validator for further processing
                    return Promise.resolve(this.validator(context, value, dialogs));
                } else if (value) {
                    // Return recognized choice
                    return dialogs.end(context, value);
                } else if (options.retryPrompt) {
                    // Send retry prompt to user
                    return this.sendChoicePrompt(context, dialogs, options.retryPrompt, options.retrySpeak);
                } else if (options.prompt) {
                    // Send original prompt to user
                    return this.sendChoicePrompt(context, dialogs, options.prompt, options.speak);
                } else {
                    return Promise.resolve();
                }
            });
    }

    protected sendChoicePrompt(context: BotContext, dialogs: DialogSet, prompt: string|Partial<Activity>, speak?: string): Promise<void> {
        if (typeof prompt === 'string') {
            const style = dialogs.getInstance<ChoicePromptOptions>(context).state.style; 
            return this.getChoices(context, false, dialogs)
                .then((choices) => formatChoicePrompt(context, choices, prompt, speak, this.stylerOptions, style))
                .then((activity) => { context.reply(activity) });
        } else { 
            context.reply(prompt);
            return Promise.resolve(); 
        }
    }

    private getChoices(context: BotContext, recognizePhase: boolean, dialogs: DialogSet): Promise<(string|Choice)[]> {
        if (this.choices) {
            return Promise.resolve(this.choices(context, recognizePhase, dialogs));
        } else {
            const options = dialogs.getInstance<ChoicePromptOptions>(context).state;
            return Promise.resolve(options.choices || []);
        }
    }
}

export function formatChoicePrompt(channelOrContext: string|BotContext, choices: (string|Choice)[], text?: string, speak?: string, options?: ChoiceStylerOptions, style?: ListStyle): Partial<Activity> {
    switch (style) {
        case ListStyle.auto:
        default:
            return ChoiceStyler.forChannel(channelOrContext, choices, text, speak, options);
        case ListStyle.inline:
            return ChoiceStyler.inline(choices, text, speak, options);
        case ListStyle.list:
            return ChoiceStyler.list(choices, text, speak, options);
        case ListStyle.suggestedAction:
            return ChoiceStyler.suggestedAction(choices, text, speak, options);
        case ListStyle.none:
            const p = { type: 'message', text: text || '' } as Partial<Activity>;
            if (speak) { p.speak = speak }
            if (!p.inputHint) { p.inputHint = InputHints.ExpectingInput }
            return p;
    }
}
