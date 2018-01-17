/**
 * @module botbuilder-prompts
 */
/** second comment block */
import { Prompt, PromptOptions, PromptState, CompletedHandler, Prompter, ValidatorResult } from './prompt';
import { Attachment } from 'botbuilder-core';
/**
 * Prompts the user to upload an attachment.
 *
 * **Usage Example**
 *
 * ```js
 * // define prompt
 * const photoPrompt = new AttachmentPrompt('photoPrompt', (context, state) => {
 *      const photo = state.value[0];
 *
 *      // ... do something with photo ...
 *
 * });
 *
 * // use prompt
 * function promptForPhoto(context) {
 *      const prompt = photoPrompt.reply(`Send me the photo you'd like me to edit.`);
 *      context.begin(prompt);
 * }
 * ```
 *
 * @param W (Optional) type of parameters that can be passed to [with()](#with).
 * @param O (Optional) type of options supported by any derived classes.
 */
export declare class AttachmentPrompt<W extends Object = any, O extends PromptOptions = PromptOptions> extends Prompt<Attachment[], W, O> {
    constructor(uid: string, completed: CompletedHandler<Attachment[], W, O>, prompter?: Prompter<Attachment[], W, O>);
    static validator(context: BotContext, options?: PromptOptions): ValidatorResult<Attachment[]>;
    static prompter(context: BotContext, state: PromptState<Attachment[], any, PromptOptions>): void;
}
