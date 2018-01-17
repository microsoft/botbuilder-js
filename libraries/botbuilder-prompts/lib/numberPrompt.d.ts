/**
 * @module botbuilder-prompts
 */
/** second comment block */
import { Prompt, PromptOptions, PromptState, CompletedHandler, Prompter, ValidatorResult } from './prompt';
import { RecognizeNumbersOptions } from 'botbuilder-core';
/** Additional options that can be passed to a `NumberPrompt`. */
export interface NumberPromptOptions extends PromptOptions, RecognizeNumbersOptions {
}
/**
 * Prompts the user to enter a number.
 *
 * **Usage Example**
 *
 * ```js
 * // define prompt
 * const agePrompt = new NumberPrompt('agePrompt', (context, state) => {
 *     const age = state.value;
 *
 *      // ... do something with value ...
 *
 * });
 *
 * // use prompt
 * function askAge(context) {
 *     const prompt = agePrompt
 *          .set({ minValue: 1, maxValue: 99, integerOnly: true })
 *          .reply(`How old are you?`);
 *     context.begin(prompt);
 * }
 * ```
 *
 * @param W (Optional) type of parameters that can be passed to [with()](#with).
 * @param O (Optional) type of options supported by any derived classes.
 */
export declare class NumberPrompt<W extends Object = any, O extends NumberPromptOptions = NumberPromptOptions> extends Prompt<number, W, O> {
    constructor(uid: string, completed: CompletedHandler<number, W, O>, prompter?: Prompter<number, W, O>);
    static validator(context: BotContext, options?: NumberPromptOptions): ValidatorResult<number>;
    static prompter(context: BotContext, state: PromptState<number, any, NumberPromptOptions>): void;
    static ensureValidNumber(options: NumberPromptOptions, value: number): ValidatorResult<number>;
}
