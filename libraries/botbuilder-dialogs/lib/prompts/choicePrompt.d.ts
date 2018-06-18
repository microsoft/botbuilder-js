/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { PromptValidator } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Prompt, PromptOptions } from './prompt';
import * as prompts from 'botbuilder-prompts';
/**
 * Additional options that can be used to configure a `ChoicePrompt`.
 */
export interface ChoicePromptOptions extends PromptOptions {
    /** List of choices to recognize. */
    choices?: (string | prompts.Choice)[];
}
/**
 * Prompts a user to confirm something with a yes/no response.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `boolean` representing the users
 * selection.
 *
 * #### Prompt Usage
 *
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to select a choice
 * from a list and their choice will be passed as an argument to the callers next waterfall step:
 *
 * ```JavaScript
 * const { DialogSet, ChoicePrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('choicePrompt', new ChoicePrompt());
 *
 * dialogs.add('colorPrompt', [
 *      async function (dc) {
 *          await dc.prompt('choicePrompt', `Select a color`, ['red', 'green', 'blue']);
 *      },
 *      async function (dc, choice) {
 *          const color = choice.value;
 *          await dc.context.sendActivity(`I like ${color} too!`);
 *          await dc.end();
 *      }
 * ]);
 * ```
 *
 * If the users response to the prompt fails to be recognized they will be automatically re-prompted
 * to try again. By default the original prompt is re-sent to the user but you can provide an
 * alternate prompt to send by passing in additional options:
 *
 * ```JavaScript
 * await dc.prompt('choicePrompt', `Select a color`, ['red', 'green', 'blue'], { retryPrompt: `I didn't catch that. Select a color from the list.` });
 * ```
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param O (Optional) output type returned by prompt. This defaults to an instance of `FoundChoice` but can be changed by a custom validator passed to the prompt.
 */
export declare class ChoicePrompt<C extends TurnContext, O = prompts.FoundChoice> extends Prompt<C> {
    private prompt;
    /**
     * Creates a new `ChoicePrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator?: PromptValidator<prompts.FoundChoice, O>, defaultLocale?: string);
    /**
     * Sets additional options passed to the `ChoiceFactory` and used to tweak the style of choices
     * rendered to the user.
     * @param options Additional options to set.
     */
    choiceOptions(options: prompts.ChoiceFactoryOptions): this;
    /**
     * Sets additional options passed to the `recognizeChoices()` function.
     * @param options Additional options to set.
     */
    recognizerOptions(options: prompts.FindChoicesOptions): this;
    /**
     * Sets the style of the choice list rendered to the user when prompting.
     * @param listStyle Type of list to render to to user. Defaults to `ListStyle.auto`.
     */
    style(listStyle: prompts.ListStyle): this;
    protected onPrompt(dc: DialogContext<C>, options: ChoicePromptOptions, isRetry: boolean): Promise<void>;
    protected onRecognize(dc: DialogContext<C>, options: ChoicePromptOptions): Promise<O | undefined>;
}
