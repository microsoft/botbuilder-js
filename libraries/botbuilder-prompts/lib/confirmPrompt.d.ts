/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext } from 'botbuilder';
import { ChoiceFactoryOptions, Choice } from 'botbuilder-choices';
import { PromptValidator } from './textPrompt';
import { ListStyle } from './choicePrompt';
/** Map of `ConfirmPrompt` choices for each locale the bot supports. */
export interface ConfirmChoices {
    [locale: string]: (string | Choice)[];
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
    /** Additional options used to configure the output of the choice factory. */
    choiceOptions: ChoiceFactoryOptions;
    /**
     * Sends a formated prompt to the user.
     * @param context Context for the current turn of conversation.
     * @param prompt Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: TurnContext, prompt: string | Partial<Activity>, speak?: string): Promise<void>;
    /**
     * Recognizes and validates the users reply.
     * @param context Context for the current turn of conversation.
     */
    recognize(context: TurnContext): Promise<O | undefined>;
}
/**
 * Creates a new prompt that asks the user to answer a yes/no question.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`.
 */
export declare function createConfirmPrompt<O = boolean>(validator?: PromptValidator<O>, defaultLocale?: string): ConfirmPrompt<O>;
