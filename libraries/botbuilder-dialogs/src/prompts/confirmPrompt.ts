/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator } from './prompt';
import { ListStyle, formatChoicePrompt } from './choicePrompt';
import { ChoiceStylerOptions, Choice } from 'botbuilder-choices';
import * as Recognizers from '@microsoft/recognizers-text-options';

const booleanModel = Recognizers.OptionsRecognizer.instance.getBooleanModel('en-us');

export interface ConfirmChoices {
    [locale:string]: (string|Choice)[];
}


export interface ConfirmPromptOptions extends PromptOptions {
    /** Preferred style of the choices sent to the user. The default value is `ChoicePromptStyle.auto`. */
    style?: ListStyle;
}

export class ConfirmPrompt implements Dialog {
    public readonly stylerOptions: ChoiceStylerOptions;
    public readonly choices: ConfirmChoices;

    constructor(private validator?: PromptValidator<boolean|undefined>) {
        this.stylerOptions = { includeNumbers: false };
        this.choices = { '*': ['yes', 'no'] }; 
    }

    public begin(context: BotContext, dialogs: DialogSet, options: ConfirmPromptOptions): Promise<void> {
        // Persist options
        const instance = dialogs.getInstance<ConfirmPromptOptions>(context);
        instance.state = options || {};

        // Send initial prompt
        if (instance.state.prompt) {
            return this.sendChoicePrompt(context, dialogs, instance.state.prompt, instance.state.speak);
        } else {
            return Promise.resolve();
        }
    }

    public continue(context: BotContext, dialogs: DialogSet): Promise<void> {
        // Recognize value
        const options = dialogs.getInstance<ConfirmPromptOptions>(context).state;
        const utterance = context.request && context.request.text ? context.request.text : '';
        const results = booleanModel.parse(utterance);
        const value = results.length > 0 && results[0].resolution ? results[0].resolution.value  : undefined;
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        } else if (typeof value === 'boolean') {
            // Return recognized value
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
    }

    protected sendChoicePrompt(context: BotContext, dialogs: DialogSet, prompt: string|Partial<Activity>, speak?: string): Promise<void> {
        if (typeof prompt === 'string') {
            // Get locale specific choices
            let locale = context.request && context.request.locale ? context.request.locale.toLowerCase() : '*';
            if (!this.choices.hasOwnProperty(locale)) { locale = '*' }
            const choices = this.choices[locale];

            // Reply with formatted prompt
            const style = dialogs.getInstance<ConfirmPromptOptions>(context).state.style; 
            context.reply(formatChoicePrompt(context, choices, prompt, speak, this.stylerOptions, style))
        } else { 
            context.reply(prompt);
        }
        return Promise.resolve(); 
    }
}
