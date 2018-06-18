/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, TurnContext } from 'botbuilder';
import { ChoiceFactory, FoundChoice, Choice, ChoiceFactoryOptions, recognizeChoices, FindChoicesOptions } from 'botbuilder-choices';
import { PromptValidator } from './textPrompt';
import { sendPrompt } from './internal';

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

/** 
 * Prompts the user to select from a list of choices. 
 *
 * @remarks
 * This example shows how to create a new choice prompt:
 *
 * ```JavaScript
 * const { createChoicePrompt } = require('botbuilder-prompts');
 * 
 * const choicePrompt = createChoicePrompt();
 * ```
 * @param O (Optional) type of result returned by the [recognize()](#recognize) method. This defaults to an instance of `FoundChoice` but can be changed by the prompts custom validator.
 */
export interface ChoicePrompt<O = FoundChoice> {
    /** 
     * Style of choices sent to user when [prompt()](#prompt) is called.
     * 
     * @remarks
     * This starts with a value of `ListStyle.auto`.
     */
    style: ListStyle;

    /** Additional options used to configure the output of the choice factory. */
    choiceOptions: ChoiceFactoryOptions;

    /** Additional options used to configure the choice recognizer. */
    recognizerOptions: FindChoicesOptions;

    /**
     * Sends a formated prompt to the user. 
     * 
     * @remarks
     * By default, this will attempt to send the provided list of choices as buttons using 
     * `ChoiceFactory.forChannel()`. It may fallback to sending the choices as a text based list 
     * for any number of reasons. You can set the prompts [style](#style) property to force the use
     * of a particular rendering style. 
     * 
     * Further tweaks can be made to the rendering of choices using the 
     * [choiceOptions](#choiceoptions) property. 
     *
     * ```JavaScript
     * await colorPrompt.prompt(context, ['red', 'green', 'blue'], `Pick a color.`);
     * ```
     * @param context Context for the current turn of conversation.
     * @param choices Array of choices that should be prompted for. This may be different then the choices passed to [recognize()](#recognize).
     * @param prompt (Optional) Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: TurnContext, choices: (string|Choice)[], prompt?: string|Partial<Activity>, speak?: string): Promise<void>;

    /**
     * Recognizes and validates the users reply. 
     * 
     * @remarks
     * The result of the call will either be the recognized value or `undefined`. 
     * 
     * The recognize() method will not automatically re-prompt the user so either the caller or the
     * prompts custom validator will need to implement re-prompting logic.
     * 
     * The search options for the underlying choice recognizer can be tweaked using the prompts
     * [recognizerOptions](#recognizeroptions) property.
     *
     * ```JavaScript
     * const choice = await colorPrompt.recognize(context, ['red', 'green', 'blue']);
     * if (choice) {
     *    const color = choice.value;
     * }
     * ```
     * @param context Context for the current turn of conversation.
     * @param choices Array of choices that should be recognized against. This may be different then the choices passed to [prompt()](#prompt).
     */
    recognize(context: TurnContext, choices: (string|Choice)[]): Promise<O|undefined>;
}

/**
 * Creates a new prompt that asks the user to select from a list of choices.
 *
 * @remarks
 * This example shows creating a choice prompt with a custom validator that re-prompts using 
 * different prompt text if the users utterance doesn't match a choice:
 *
 * ```JavaScript
 * const { createChoicePrompt } = require('botbuilder-prompts');
 * 
 * const colorPrompt = createChoicePrompt(async (context, found) => {
 *    if (!found) {
 *       await colorPrompt.prompt(context, ['red', 'green', 'blue'], `Please choose a color from the list or say "cancel".`);
 *    }
 *    return found;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to an instance of `FoundChoice` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`.
 */
export function createChoicePrompt<O = FoundChoice>(validator?: PromptValidator<FoundChoice, O>, defaultLocale?: string): ChoicePrompt<O> {
    return {
        style: ListStyle.auto,
        choiceOptions: {},
        recognizerOptions: {},
        prompt: function prompt(context, choices, prompt, speak) {
            let msg: Partial<Activity>;
            if (typeof prompt !== 'object') {
                switch (this.style) {
                    case ListStyle.auto:
                    default:
                        msg = ChoiceFactory.forChannel(context, choices, prompt, speak, this.choiceOptions);
                        break;
                    case ListStyle.inline:
                        msg = ChoiceFactory.inline(choices, prompt, speak, this.choiceOptions);
                        break;
                    case ListStyle.list:
                        msg = ChoiceFactory.list(choices, prompt, speak, this.choiceOptions);
                        break;
                    case ListStyle.suggestedAction:
                        msg = ChoiceFactory.suggestedAction(choices, prompt, speak);
                        break;
                    case ListStyle.none:
                        msg = { type: 'message', text: prompt };
                        if (speak) { msg.speak = speak }
                        break;
                }
            } else {
                msg = Object.assign({}, prompt);
                if (speak) { msg.speak = speak }
            }
            return sendPrompt(context, msg);
        },
        recognize: function recognize(context, choices) {
            const request = context.activity || {};
            const utterance = request.text || '';
            const options = Object.assign({}, this.recognizerOptions);
            options.locale = request.locale || this.recognizerOptions.locale || defaultLocale || 'en-us';
            const results = recognizeChoices(utterance, choices, options);
            const value = results.length > 0 ? results[0].resolution : undefined;
            return Promise.resolve(validator ? validator(context, value) : value as any);
        }
    };
}
