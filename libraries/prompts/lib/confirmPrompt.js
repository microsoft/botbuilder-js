"use strict";
/**
 * @module botbuilder-prompts
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const botbuilder_core_1 = require("botbuilder-core");
const choicePrompt_1 = require("./choicePrompt");
const localizedPrompts = require("./localized-prompts");
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
class ConfirmPrompt extends prompt_1.Prompt {
    constructor(uid, completed, prompter) {
        super(uid, ConfirmPrompt.validator, completed, prompter || ConfirmPrompt.prompter);
    }
    static validator(context, options) {
        options = options || {};
        if (context.request.type === botbuilder_core_1.ActivityTypes.message) {
            const entity = botbuilder_core_1.EntityRecognizers.findTopEntity(botbuilder_core_1.EntityRecognizers.recognizeBooleans(context));
            if (entity) {
                return { value: entity.value };
            }
        }
        return { error: 'invalid' };
    }
    static prompter(context, state) {
        const localizedText = localizedPrompts.find(context.request.locale || 'en');
        // Find list style
        const options = state.options;
        const choices = [
            { value: localizedText.confirm_yes },
            { value: localizedText.confirm_no }
        ];
        let style = options.listStyle !== undefined ? options.listStyle : choicePrompt_1.ListStyle.auto;
        if (style === choicePrompt_1.ListStyle.auto) {
            // Calculate the current auto style but only allow the use of suggested actions by default.
            style = choicePrompt_1.ChoicePrompt.autoListStyle(context, choices, state.turns);
            if (style !== choicePrompt_1.ListStyle.suggestedActions) {
                style = choicePrompt_1.ListStyle.none;
            }
        }
        // Find prompt
        let prompt;
        if (state.turns === 0) {
            prompt = options.prompt;
        }
        else {
            const defaultPrompt = localizedText.default_confirm;
            prompt = state.options.rePrompt || defaultPrompt;
        }
        // Render composed prompt
        if (prompt) {
            context.reply(choicePrompt_1.ChoicePrompt.composeChoicePrompt(context, prompt, choices, style));
        }
    }
}
exports.ConfirmPrompt = ConfirmPrompt;
//# sourceMappingURL=confirmPrompt.js.map