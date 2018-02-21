/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, InputHints } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator } from './prompt';
import { Choice, ChoiceStyler, ChoiceStylerOptions, recognizeChoices, FindChoicesOptions, FoundChoice } from 'botbuilder-choices';

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

/** Additional options that can be used to configure a `ChoicePrompt`. */
export interface ChoicePromptOptions extends PromptOptions {
    /** List of choices to recognize. */
    choices?: (string|Choice)[];

    /** Preferred style of the choices sent to the user. The default value is `ListStyle.auto`. */
    style?: ListStyle;

}

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
export class ChoicePrompt implements Dialog {
    /** Additional options passed to the `ChoiceStyler` and used to tweak the style of choices rendered to the user. */
    public readonly stylerOptions: ChoiceStylerOptions = {};

    /** Additional options passed to the `recognizeChoices()` function. */
    public readonly recognizerOptions: FindChoicesOptions = {};

    /**
     * Creates a new instance of the prompt.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('choicePrompt', new ChoicePrompt());
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(private validator?: PromptValidator<FoundChoice|undefined>) {}

    public begin(context: BotContext, dialogs: DialogSet, options: ChoicePromptOptions): Promise<void> {
        // Persist options
        const instance = dialogs.getInstance<ChoicePromptOptions>(context);
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
        const options = dialogs.getInstance<ChoicePromptOptions>(context).state;
        const utterance = context.request && context.request.text ? context.request.text : '';
        const results = recognizeChoices(utterance, options.choices || [], this.recognizerOptions);
        const value = results.length > 0 ? results[0].resolution : undefined;
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        } else if (value) {
            // Return recognized choice
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

    private sendChoicePrompt(context: BotContext, dialogs: DialogSet, prompt: string|Partial<Activity>, speak?: string): Promise<void> {
        if (typeof prompt === 'string') {
            const options = dialogs.getInstance<ChoicePromptOptions>(context).state; 
            context.reply(formatChoicePrompt(context, options.choices || [], prompt, speak, this.stylerOptions, options.style));
        } else { 
            context.reply(prompt);
        }
        return Promise.resolve(); 
    }
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
export function formatChoicePrompt(channelOrContext: string|BotContext, choices: (string|Choice)[], text?: string, speak?: string, options?: ChoiceStylerOptions, style?: ListStyle): Partial<Activity> {
    switch (style) {
        case ListStyle.auto:
        default:
            return ChoiceStyler.forChannel(channelOrContext, choices, text, speak, options);
        case ListStyle.inline:
            return ChoiceStyler.inline(choices, text, speak, options);
        case ListStyle.list:
            return ChoiceStyler.list(choices, text, speak, options);
        case ListStyle.suggestedAction:
            return ChoiceStyler.suggestedAction(choices, text, speak, options);
        case ListStyle.none:
            const p = { type: 'message', text: text || '' } as Partial<Activity>;
            if (speak) { p.speak = speak }
            if (!p.inputHint) { p.inputHint = InputHints.ExpectingInput }
            return p;
    }
}
