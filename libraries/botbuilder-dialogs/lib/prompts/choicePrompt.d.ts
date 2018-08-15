/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptValidator, PromptRecognizerResult, ListStyle } from './prompt';
import { FoundChoice, ChoiceFactoryOptions, FindChoicesOptions } from '../choices';
/**
 * Prompts a user to confirm something with a yes/no response.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `boolean` representing the users
 * selection.
 */
export declare class ChoicePrompt extends Prompt<FoundChoice> {
    static defaultChoiceOptions: {
        [locale: string]: ChoiceFactoryOptions;
    };
    /**
     * Creates a new `ChoicePrompt` instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId: string, validator?: PromptValidator<FoundChoice>, defaultLocale?: string);
    defaultLocale: string | undefined;
    /**
     * Gets or sets the style of the choice list rendered to the user when prompting.
     *
     * @remarks
     * Defaults to `ListStyle.auto`.
     */
    style: ListStyle;
    /**
     * Gets or sets additional options passed to the `ChoiceFactory` and used to tweak the style of
     * choices rendered to the user.
     */
    choiceOptions: ChoiceFactoryOptions | undefined;
    /**
     * Gets or sets additional options passed to the `recognizeChoices()` function.
     */
    recognizerOptions: FindChoicesOptions | undefined;
    protected onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<FoundChoice>>;
}
