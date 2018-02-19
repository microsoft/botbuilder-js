/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, Activity } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator } from './prompt';
import { Choice, ChoiceStylerOptions, FoundChoice } from 'botbuilder-choices';
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
/** Additional options that can be used to configure a `ChoicePrompt`. */
export interface ChoicePromptOptions extends PromptOptions {
    /** List of choices to recognize. */
    choices?: (string | Choice)[];
    /** Preferred style of the choices sent to the user. The default value is `ListStyle.auto`. */
    style?: ListStyle;
}
/**
 * Signature for handler passed to a `ChoicePrompt` that will dynamically calculate the prompts
 * choices.
 * @param DynamicChoicesProvider.context Context object for the current turn of conversation with the user.
 * @param DynamicChoicesProvider.recognizePhase If `true` the handler is being called to get a list of choices that will be recognized. If `false` then a prompt or retryPrompt is being rendered.
 * @param DynamicChoicesProvider.dialogs The parent dialog set.
 */
export declare type DynamicChoicesProvider = (context: BotContext, recognizePhase: boolean, dialogs: DialogSet) => Promiseable<(string | Choice)[]>;
/**
 * Prompts a user to make a selection from a list of choices. By default the prompt will return to
 * the calling dialog a `FoundChoice` for the choice the user selected. This can be overridden
 * using a custom `PromptValidator`.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { DialogSet, ChoicePrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('choicePrompt', new ChoicePrompt());
 *
 * dialogs.add('choiceDemo', [
 *      function (context) {
 *          return dialogs.prompt(context, 'choicePrompt', `choice: select a color`, ['red', 'green', 'blue']);
 *      },
 *      function (context, choice: FoundChoice) {
 *          context.reply(`Recognized choice: ${JSON.stringify(choice)}`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
export declare class ChoicePrompt implements Dialog {
    private validator;
    private choices;
    /** Can be used to tweak the style of choice prompt rendered to the user. */
    readonly stylerOptions: ChoiceStylerOptions;
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * const { ChoicePrompt, formatChoicePrompt } = require('botbuilder-dialogs');
     *
     * dialogs.add('choiceDemo', [
     *      function (context) {
     *          return dialogs.prompt(context, 'choicePrompt', `choice: select a color`, ['red', 'green', 'blue']);
     *      },
     *      function (context, choice) {
     *          context.reply(`Recognized choice: ${JSON.stringify(choice)}`);
     *          return dialogs.end(context);
     *      }
     * ]);
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     * @param choices (Optional) handler to dynamically provide the list of choices for the prompt/
     */
    constructor(validator?: PromptValidator<FoundChoice | undefined> | undefined, choices?: DynamicChoicesProvider | undefined);
    begin(context: BotContext, dialogs: DialogSet, options: ChoicePromptOptions): Promise<void>;
    continue(context: BotContext, dialogs: DialogSet): Promise<void>;
    private sendChoicePrompt(context, dialogs, prompt, speak?);
    private getChoices(context, recognizePhase, dialogs);
}
/**
 * Helper function to format a choice prompt for a given `ListStyle`. An activity will be returned
 * that can then be sent to the user.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { formatChoicePrompt } = require('botbuilder-dialogs');
 *
 * context.reply(formatChoicePrompt(context, ['red', 'green', 'blue'], `Select a color`));
 * ```
 * @param channelOrContext Context for the current turn of conversation with the user or the ID of a channel. This is used when `style == ListStyle.auto`.
 * @param choices Array of choices being prompted for.
 * @param text (Optional) prompt text to show the user along with the options.
 * @param speak (Optional) SSML to speak to the user on channels like Cortana. The messages `inputHint` will be automatically set to `InputHints.expectingInput`.
 * @param options (Optional) additional choice styler options used to customize the rendering of the prompts choice list.
 * @param style (Optional) list style to use when rendering prompt. Defaults to `ListStyle.auto`.
 */
export declare function formatChoicePrompt(channelOrContext: string | BotContext, choices: (string | Choice)[], text?: string, speak?: string, options?: ChoiceStylerOptions, style?: ListStyle): Partial<Activity>;
