/**
 * @module botbuilder-prompts
 */
/** second comment block */
import { Prompt, PromptOptions, PromptState, CompletedHandler, Prompter, ValidatorResult } from './prompt';
import { Activity, ActivityTypes, Promiseable, Attachment } from 'botbuilder-core';
import * as localizedPrompts from './localized-prompts';

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
export class AttachmentPrompt<W extends Object = any, O extends PromptOptions = PromptOptions> extends Prompt<Attachment[], W, O> {
    constructor(uid: string, completed: CompletedHandler<Attachment[],W,O>, prompter?: Prompter<Attachment[],W,O>) {
        super(uid, AttachmentPrompt.validator, completed, prompter || AttachmentPrompt.prompter);
    }

    static validator(context: BotContext, options?: PromptOptions): ValidatorResult<Attachment[]> {
        const request = context.request;
        if (request.type === ActivityTypes.message && request.attachments && request.attachments.length > 0) {
            const value = request.attachments.slice(0);
            return { value: value };
        }
        return { error: 'invalid' };
    }

    static prompter(context: BotContext, state: PromptState<Attachment[],any,PromptOptions>): void {
        if (state.turns === 0) {
            const prompt = state.options.prompt;
            if (prompt) { context.reply(prompt) }
        } else {
            const defaultPrompt = localizedPrompts.find(context.request.locale || 'en').default_attachment;
            context.reply(state.options.rePrompt || defaultPrompt);
        }
    }
}

