/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, TurnContext } from 'botbuilder';
import { FoundChoice, Choice, ChoiceFactoryOptions, FindChoicesOptions } from 'botbuilder-choices';
/**
 * Controls the way that choices for a `ChoicePrompt` or yes/no options for a `ConfirmPrompt` are
 * presented to a user.
 */
export declare enum ListStyle {
    /** Don't include any choices for prompt. */
    none = 0,
    /** Automatically select the appropriate style for the current channel. */
    auto = 1,
    /** Add choices to prompt as an inline list. */
    inline = 2,
    /** Add choices to prompt as a numbered list. */
    list = 3,
    /** Add choices to prompt as suggested actions. */
    suggestedAction = 4,
}
/** Prompts the user to select from a list of choices. */
export interface ChoicePrompt<O = FoundChoice> {
    /**
     * Style of choices sent to user when [prompt()](#prompt) is called. Defaults
     * to `ListStyle.auto`.
     */
    style: ListStyle;
    /** Additional options used to configure the output of the choice factory. */
    choiceOptions: ChoiceFactoryOptions;
    /** Additional options used to configure the choice recognizer. */
    recognizerOptions: FindChoicesOptions;
    /**
     * Sends a formated prompt to the user.
     * @param context Context for the current turn of conversation.
     * @param choices Array of choices that should be prompted for.
     * @param prompt (Optional) Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: TurnContext, choices: (string | Choice)[], prompt?: string | Partial<Activity>, speak?: string): Promise<void>;
    /**
     * Recognizes and validates the users reply.
     * @param context Context for the current turn of conversation.
     * @param choices Array of choices that should be recognized against.
     */
    recognize(context: TurnContext, choices: (string | Choice)[]): Promise<O | undefined>;
}
/**
 * Signature of a handler that can be passed to a prompt to provide additional validation logic
 * or to customize the reply sent to the user when their response is invalid.
 * @param O Type of output that will be returned by the validator. This can be changed from the input type by the validator.
 * @param ChoicePromptValidator.context Context for the current turn of conversation.
 * @param ChoicePromptValidator.value The value that was recognized or `undefined` if not recognized.
 * @param ChoicePromptValidator.choices Array of choices that should be prompted for.
 */
export declare type ChoicePromptValidator<O = FoundChoice> = (context: TurnContext, value: FoundChoice | undefined, choices: (string | Choice)[]) => Promiseable<O | undefined>;
/**
 * Creates a new prompt that asks the user to select from a list of choices.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`.
 */
export declare function createChoicePrompt<O = FoundChoice>(validator?: ChoicePromptValidator<O>, defaultLocale?: string): ChoicePrompt<O>;
