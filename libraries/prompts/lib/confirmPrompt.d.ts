/**
 * @module botbuilder-prompts
 */
/** second comment block */
import { Prompt, PromptOptions, PromptState, CompletedHandler, Prompter, ValidatorResult } from './prompt';
import { ListStyle } from './choicePrompt';
/**
 * Additional options that can be passed to a `ConfirmPrompt`.
 */
export interface ConfirmPromptOptions extends PromptOptions {
    /**
     * (Optional) Style of confirm options displayed to user.
     */
    listStyle?: ListStyle;
}
/**
 * Prompts the user to confirm an action with a "yes" or "no" response.
 *
 * **Usage Example**
 *
 * ```js
 * // define prompt
 * const deletePrompt = new ConfirmPrompt('confirmDeletePrompt', (context, state) => {
 *      const item = context.prompt.with.item;
 *      if (state.value) {
 *          // delete item
 *      } else {
 *          context.reply(`Ok.`);
 *      }
 * });
 *
 * // use prompt
 * function confirmDelete(context, item) {
 *      const prompt = deletePrompt
 *          .with({ item: item })
 *          .reply(`Are you sure you want to delete ${item.title}?`);
 *      context.begin(prompt);
 * }
 * ```
 *
 * @param W (Optional) type of parameters that can be passed to [with()](#with).
 * @param O (Optional) type of options supported by any derived classes.
 */
export declare class ConfirmPrompt<W extends Object = any, O extends ConfirmPromptOptions = ConfirmPromptOptions> extends Prompt<boolean, W, O> {
    constructor(uid: string, completed: CompletedHandler<boolean, W, O>, prompter?: Prompter<boolean, W, O>);
    static validator(context: BotContext, options?: PromptOptions): ValidatorResult<boolean>;
    static prompter(context: BotContext, state: PromptState<boolean, any, ConfirmPromptOptions>): void;
}
