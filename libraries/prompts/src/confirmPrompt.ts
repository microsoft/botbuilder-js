/**
 * @module botbuilder-prompts
 */
/** second comment block */

import { Prompt, PromptOptions, PromptState, CompletedHandler, Prompter, ValidatorResult } from './prompt';
import { Activity, ActivityTypes, Promiseable, EntityRecognizers, EntityObject } from 'botbuilder-core';
import { ChoicePrompt, ListStyle } from './choicePrompt';
import * as localizedPrompts from './localized-prompts';


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
export class ConfirmPrompt<W extends Object = any, O extends ConfirmPromptOptions = ConfirmPromptOptions> extends Prompt<boolean, W, O> {
    constructor(uid: string, completed: CompletedHandler<boolean,W,O>, prompter?: Prompter<boolean,W,O>) {
        super(uid, ConfirmPrompt.validator, completed, prompter || ConfirmPrompt.prompter);
    }

    static validator(context: BotContext, options?: PromptOptions): ValidatorResult<boolean> {
        options = options || {};
        if (context.request.type === ActivityTypes.message) {
            const entity = EntityRecognizers.findTopEntity(EntityRecognizers.recognizeBooleans(context));
            if (entity) {
                return { value: entity.value };
            }
        }
        return { error: 'invalid' };
    }

    static prompter(context: BotContext, state: PromptState<boolean,any,ConfirmPromptOptions>): void {
        const localizedText = localizedPrompts.find(context.request.locale || 'en');

        // Find list style
        const options = state.options;
        const choices = [
            { value: localizedText.confirm_yes },
            { value: localizedText.confirm_no }
        ];
        let style = options.listStyle !== undefined ? options.listStyle : ListStyle.auto;
        if (style === ListStyle.auto) {
            // Calculate the current auto style but only allow the use of suggested actions by default.
            style = ChoicePrompt.autoListStyle(context, choices, state.turns);
            if (style !== ListStyle.suggestedActions) { style = ListStyle.none }
        }

        // Find prompt
        let prompt: Partial<Activity>|undefined;
        if (state.turns === 0) {
            prompt = options.prompt;
        } else {
            const defaultPrompt = localizedText.default_confirm;
            prompt = state.options.rePrompt || defaultPrompt;
        }

        // Render composed prompt
        if (prompt) {
            context.reply(ChoicePrompt.composeChoicePrompt(context, prompt, choices, style));
        }
    }
}
