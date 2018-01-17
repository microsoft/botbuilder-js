/**
 * @module botbuilder-prompts
 */
/** second comment block */

import { Prompt, PromptOptions, PromptState, CompletedHandler, Prompter, ValidatorResult } from './prompt';
import { Activity, ActivityTypes, Promiseable } from 'botbuilder-core';

/** Additional settings that can be passed in when creating a custom `TextPrompt`. */
export interface TextPromptOptions extends PromptOptions {
    /**
     * (Optional) if true the users reply will be trimmed before returning to the caller. The 
     * default value is true.
     */
    trimReply?: boolean;
}

/**
 * Prompts the user with a general question.
 *
 * **Usage Example:**
 *
 * ```js
 * // define prompt
 * const namePrompt = new TextPrompt('namePrompt', (context, state) => {
 *     const name = state.value;
 * 
 *      // ... do something with value ...
 * 
 * });
 *
 * // use prompt
 * function promptForName(context) {
 *     const prompt = namePrompt.reply(`Hi. What's your name?`);
 *     context.begin(prompt);
 * }
 * ```
 *
 * @param W (Optional) type of parameters that can be passed to [with()](#with). 
 * @param O (Optional) type of options supported by any derived classes. 
 */
export class TextPrompt<W extends Object = {}, O extends TextPromptOptions = TextPromptOptions> extends Prompt<string, W, O> {
    constructor(uid: string, completed: CompletedHandler<string,W,O>, prompter?: Prompter<string,W,O>) {
        super(uid, TextPrompt.validator, completed, prompter);
        this.options.trimReply = true;
    }

    static validator(context: BotContext, options?: TextPromptOptions): ValidatorResult<string> {
        options = options || {};
        if (context.request.type === ActivityTypes.message && context.request.text) {
            const text = context.request.text;
            const value = options.trimReply ? text.trim() : text;
            return { value: value };
        }
        return { error: 'invalid' };
    }
}
