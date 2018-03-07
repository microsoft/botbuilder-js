/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, BotContext, BatchOutput, ActivityTypes, InputHints } from 'botbuilder';
import { ChoiceStyler, FoundChoice, Choice, ChoiceStylerOptions, recognizeChoices, FindChoicesOptions } from 'botbuilder-choices';

/**
 * Controls the way that choices for a `ChoicePrompt` or yes/no options for a `ConfirmPrompt` are
 * presented to a user.
 */
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

/** Prompts the user to select from a list of choices. */
export interface ChoicePrompt<O = FoundChoice> {
    /** 
     * Style of choices sent to user when [prompt()](#prompt) is called. Defaults
     * to `ListStyle.auto`.
     */
    style: ListStyle;

    /** Additional options used to configure the output of the choice styler. */
    stylerOptions: ChoiceStylerOptions;

    /** Additional options used to configure the choice recognizer. */
    recognizerOptions: FindChoicesOptions;

    /**
     * Sends a formated prompt to the user. 
     * @param context Context for the current turn of conversation.
     * @param choices Array of choices that should be prompted for.
     * @param prompt (Optional) Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: BotContext, choices: (string|Choice)[], prompt?: string|Partial<Activity>, speak?: string): Promise<void>;

    /**
     * Recognizes and validates the users reply.
     * @param context Context for the current turn of conversation.
     * @param choices Array of choices that should be recognized against.
     */
    recognize(context: BotContext, choices: (string|Choice)[]): Promise<O|undefined>;
}

/**
 * Signature of a handler that can be passed to a prompt to provide additional validation logic
 * or to customize the reply sent to the user when their response is invalid.
 * @param O Type of output that will be returned by the validator. This can be changed from the input type by the validator.
 * @param ChoicePromptValidator.context Context for the current turn of conversation.
 * @param ChoicePromptValidator.value The value that was recognized or `undefined` if not recognized.
 * @param ChoicePromptValidator.choices Array of choices that should be prompted for.
 */
export type ChoicePromptValidator<O = FoundChoice> = (context: BotContext, value: FoundChoice|undefined, choices: (string|Choice)[]) => Promiseable<O|undefined>;

/**
 * Creates a new prompt that asks the user to select from a list of choices.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 */
export function createChoicePrompt<O = FoundChoice>(validator?: ChoicePromptValidator<O>): ChoicePrompt<O> {
    return {
        style: ListStyle.auto,
        stylerOptions: {},
        recognizerOptions: {},
        prompt: function prompt(context, choices, prompt, speak) {
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
        recognize: function recognize(context, choices) {
            const utterance = context.request && context.request.text ? context.request.text : '';
            const results = recognizeChoices(utterance, choices, this.recognizerOptions);
            const value = results.length > 0 ? results[0].resolution : undefined;
            return Promise.resolve(validator ? validator(context, value, choices) : value as any);
        }
    };
}
