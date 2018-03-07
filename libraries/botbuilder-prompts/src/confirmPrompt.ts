/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, BotContext, BatchOutput, ActivityTypes, InputHints } from 'botbuilder';
import { ChoiceStyler, ChoiceStylerOptions, Choice } from 'botbuilder-choices';
import { PromptValidator } from './textPrompt';
import { ListStyle } from './choicePrompt';
import * as Recognizers from '@microsoft/recognizers-text-options';

const booleanModel = Recognizers.OptionsRecognizer.instance.getBooleanModel('en-us');

/** Map of `ConfirmPrompt` choices for each locale the bot supports. */
export interface ConfirmChoices {
    [locale:string]: (string|Choice)[];
}

/** Prompts the user to answer a yes/no question. */
export interface ConfirmPrompt<O = boolean> {
    /** 
     * Allows for the localization of the confirm prompts yes/no choices to other locales besides 
     * english. The key of each entry is the languages locale code and should be lower cased. A
     * default fallback set of choices can be specified using a key of '*'. 
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * // Configure yes/no choices for english and spanish (default)
     * ConfirmPrompt.choices['*'] = ['sí', 'no'];
     * ConfirmPrompt.choices['es'] = ['sí', 'no'];
     * ConfirmPrompt.choices['en-us'] = ['yes', 'no'];
     * ```
     */
    choices: ConfirmChoices;

    /** 
     * Style of choices sent to user when [prompt()](#prompt) is called. Defaults
     * to `ListStyle.auto`.
     */
    style: ListStyle;

    /** Additional options used to configure the output of the choice styler. */
    stylerOptions: ChoiceStylerOptions;

    /**
     * Sends a formated prompt to the user. 
     * @param context Context for the current turn of conversation.
     * @param prompt Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: BotContext, prompt: string|Partial<Activity>, speak?: string): Promise<void>;

    /**
     * Recognizes and validates the users reply.
     * @param context Context for the current turn of conversation.
     */
    recognize(context: BotContext): Promise<O|undefined>;
}

/**
 * Creates a new prompt that asks the user to answer a yes/no question.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 */
export function createConfirmPrompt<O = boolean>(validator?: PromptValidator<O>): ConfirmPrompt<O> {
    return {
        choices: { '*': ['yes', 'no'] },        
        style: ListStyle.auto,
        stylerOptions: {},
        prompt: function prompt(context, prompt, speak) {
            // Get locale specific choices
            let locale = context.request && context.request.locale ? context.request.locale.toLowerCase() : '*';
            if (!this.choices.hasOwnProperty(locale)) { locale = '*' }
            const choices = this.choices[locale];

            let msg: Partial<Activity>;
            if (typeof prompt !== 'object') {
                switch (this.style) {
                    case ListStyle.auto:
                    default:
                        msg = ChoiceStyler.forChannel(context, choices, prompt, speak, this.stylerOptions);
                        break;
                    case ListStyle.inline:
                        msg = ChoiceStyler.inline(choices, prompt, speak, this.stylerOptions);
                        break;
                    case ListStyle.list:
                        msg = ChoiceStyler.list(choices, prompt, speak, this.stylerOptions);
                        break;
                    case ListStyle.suggestedAction:
                        msg = ChoiceStyler.suggestedAction(choices, prompt, speak, this.stylerOptions);
                        break;
                    case ListStyle.none:
                        msg = { type: 'message', text: prompt || '' };
                        if (speak) { msg.speak = speak }
                        break;
                }
            } else {
                msg = Object.assign({}, prompt);
                if (speak) { msg.speak = speak }
            }
            if (!msg.inputHint) { msg.inputHint = 'expectingInput' }
            context.responses.push(msg);
            return Promise.resolve(); 
        },
        recognize: function recognize(context) {
            const utterance = context.request && context.request.text ? context.request.text : '';
            const results = booleanModel.parse(utterance);
            const value = results.length > 0 && results[0].resolution ? results[0].resolution.value : undefined;
            return Promise.resolve(validator ? validator(context, value) : value as any);
        }
    };
}
