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
/**
 * Map of `ConfirmPrompt` choices for each locale the bot supports.
 */
export interface ConfirmChoices {
    [locale: string]: (string | Choice)[];
}
/**
 * Prompts the user to answer a yes/no question.
 *
 * @remarks
 * The [prompt()](#prompt) method will attempt to send a set of buttons yes/no buttons for the
 * user to click. By default, the text of the titles for these buttons will always be in English
 * but you can easily add support for other languages using the prompts [choices](#choices)
 * property.
 *
 * ```JavaScript
 * const { createConfirmPrompt } = require('botbuilder-prompts');
 *
 * const confirmPrompt = createConfirmPrompt();
 * ```
 * @param O (Optional) type of result returned by the [recognize()](#recognize) method. This defaults to a boolean `true` or `false` but can be changed by the prompts custom validator.
 */
export interface ConfirmPrompt<O = boolean> {
    /**
     * Allows for the localization of the confirm prompts yes/no choices to other locales besides
     * english.
     *
     * @remarks
     * This starts with a value of `{ '*': ['yes', 'no'] }` but can be customized to support
     * additional languages. The key of each entry is the languages locale code and should be
     * lower cased. A default fallback set of choices can be specified using a key of '*'.
     *
     * ```JavaScript
     * const confirmPrompt = createConfirmPrompt();
     *
     * // Configure yes/no choices for english and spanish (default)
     * confirmPrompt.choices['*'] = ['sí', 'no'];
     * confirmPrompt.choices['es'] = ['sí', 'no'];
     * confirmPrompt.choices['en-us'] = ['yes', 'no'];
     * ```
     */
    choices: ConfirmChoices;
    /**
     * Style of choices sent to user when [prompt()](#prompt) is called.
     *
     * @remarks
     * This starts with a value of `ListStyle.auto`.
     */
    style: ListStyle;
    /**
     * Additional options used to configure the output of the `ChoiceFactory`.
     *
     * @remarks
     * This starts with a value of `{ includeNumbers: false }`.
     */
    choiceOptions: ChoiceFactoryOptions;
    /**
     * Sends a formated prompt to the user.
     *
     * @remarks
     * By default, this will attempt to send the user yes & no choices as buttons using
     * `ChoiceFactory.forChannel()`. If the channel doesn't support buttons it will fallback to
     * appending ` (yes or no)` to the prompt. You can override this behavior using the prompts
     * [style](#style) property.
     *
     * Further tweaks can be made to the rendering of the yes/no choices using the
     * [choiceOptions](#choiceoptions) property.
     *
     * ```JavaScript
     * await confirmPrompt.prompt(context, `This will cancel your order. Are you sure?`);
     * ```
     * @param context Context for the current turn of conversation.
     * @param prompt Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: TurnContext, prompt: string | Partial<Activity>, speak?: string): Promise<void>;
    /**
     * Recognizes and validates the users reply.
     *
     * @remarks
     * The result of the call will either be the recognized value or `undefined`.
     *
     * The recognize() method will not automatically re-prompt the user so either the caller or the
     * prompts custom validator will need to implement re-prompting logic.
     *
     * ```JavaScript
     * const confirmed = await confirmPrompt.recognize(context);
     * if (typeof confirmed == 'boolean') {
     *    if (confirmed) {
     *       // User said yes
     *    } else {
     *       // User said no
     *    }
     * }
     * ```
     * @param context Context for the current turn of conversation.
     */
    recognize(context: TurnContext): Promise<O | undefined>;
}
/**
 * Creates a new prompt that asks the user to answer a yes/no question.
 *
 * @remarks
 * This example shows creating a confirm prompt with a custom validator that will re-prompt with
 * alternate prompt text should the utterance not be recognized:
 *
 * ```JavaScript
 * const { createConfirmPrompt } = require('botbuilder-prompts');
 *
 * const confirmPrompt = createConfirmPrompt(async (context, confirmed) => {
 *    if (typeof confirmed != 'boolean') {
 *       await confirmPrompt.prompt(context, `Please answer "yes" or "no".`);
 *    }
 *    return confirmed;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to a boolean `true` or `false` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` is not specified. Defaults to a value of `en-us`.
 */
export declare function createConfirmPrompt<O = boolean>(validator?: PromptValidator<O>, defaultLocale?: string): ConfirmPrompt<O>;
