/**
 * @module botbuilder-prompts
 */
/** second comment block */
import { Prompt, PromptOptions, PromptState, CompletedHandler, Prompter, ValidatorResult } from './prompt';
import { Activity, RecognizeChoicesOptions, Choice } from 'botbuilder-core';
/**
 * List style types used to control the inclusion of choices for an outgoing prompt.
 */
export declare enum ListStyle {
    /** Use the style most appropriate for the current channel. */
    auto = 0,
    /** No changes should be made to the outgoing prompt. */
    none = 1,
    /** Append choices to the outgoing prompt as an inline list. */
    inline = 2,
    /** Append choices to the outgoing prompt as a numbered list. */
    list = 3,
    /** Append choices to teh outgoing list as a set of suggested actions. */
    suggestedActions = 4,
}
/**
 * Additional options that can be passed to a `ChoicePrompt`.
 */
export interface ChoicePromptOptions extends PromptOptions, RecognizeChoicesOptions {
    /**
     * Choices to recognize against.
     */
    choices?: Choice[];
    /**
     * (Optional) Style of choice list displayed to user.
     */
    listStyle?: ListStyle;
}
/**
 * Prompts the user choose from a set of choices.
 *
 * **Usage Example**
 *
 * ```js
 * // create new choice prompt
 * const colorPrompt = new ChoicePrompt('colorPrompt', (context, state) => {
 *      const color = state.value;
 *
 *      // ... do something with choice ...
 *
 * });
 *
 * // configure the available choices
 * colorPrompt.choices(['red', 'blue', 'green]);
 *
 * // use prompt
 * function promptForColor(context) {
 *      const prompt = colorPrompt.reply('Pick a color');
 *      context.begin(prompt);
 * }
 * ```
 *
 * @param W (Optional) type of parameters that can be passed to [with()](#with).
 * @param O (Optional) type of options supported by any derived classes.
 */
export declare class ChoicePrompt<W extends Object = any, O extends ChoicePromptOptions = ChoicePromptOptions> extends Prompt<string, W, O> {
    constructor(uid: string, completed: CompletedHandler<string, W, O>, prompter?: Prompter<string, W, O>);
    /**
     * Set the choices that should be recognized by the prompt.
     *
     * @param choices Array of choices. If a `string` is provided for an item it will be converted
     * to a `Choice` object with the `Choice.value` assigned to the item.
     */
    choices(choices: (string | Choice)[]): this;
    static validator(context: BotContext, options?: ChoicePromptOptions): ValidatorResult<string>;
    static prompter(context: BotContext, state: PromptState<string, any, ChoicePromptOptions>): void;
    static autoListStyle(context: BotContext, choices: Choice[], turns: number): ListStyle;
    static composeChoicePrompt(context: BotContext, textOrActivity: string | Partial<Activity>, choices: Choice[], style: ListStyle): Partial<Activity>;
}
