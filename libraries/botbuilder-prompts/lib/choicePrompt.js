"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_choices_1 = require("botbuilder-choices");
const internal_1 = require("./internal");
/**
 * Controls the way that choices for a `ChoicePrompt` or yes/no options for a `ConfirmPrompt` are
 * presented to a user.
 */
var ListStyle;
(function (ListStyle) {
    /** Don't include any choices for prompt. */
    ListStyle[ListStyle["none"] = 0] = "none";
    /** Automatically select the appropriate style for the current channel. */
    ListStyle[ListStyle["auto"] = 1] = "auto";
    /** Add choices to prompt as an inline list. */
    ListStyle[ListStyle["inline"] = 2] = "inline";
    /** Add choices to prompt as a numbered list. */
    ListStyle[ListStyle["list"] = 3] = "list";
    /** Add choices to prompt as suggested actions. */
    ListStyle[ListStyle["suggestedAction"] = 4] = "suggestedAction";
})(ListStyle = exports.ListStyle || (exports.ListStyle = {}));
/**
 * Creates a new prompt that asks the user to select from a list of choices.
 *
 * @remarks
 * This example shows creating a choice prompt with a custom validator that re-prompts using
 * different prompt text if the users utterance doesn't match a choice:
 *
 * ```JavaScript
 * const { createChoicePrompt } = require('botbuilder-prompts');
 *
 * const colorPrompt = createChoicePrompt(async (context, found) => {
 *    if (!found) {
 *       await colorPrompt.prompt(context, ['red', 'green', 'blue'], `Please choose a color from the list or say "cancel".`);
 *    }
 *    return found;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to an instance of `FoundChoice` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`.
 */
function createChoicePrompt(validator, defaultLocale) {
    return {
        style: ListStyle.auto,
        choiceOptions: {},
        recognizerOptions: {},
        prompt: function prompt(context, choices, prompt, speak) {
            let msg;
            if (typeof prompt !== 'object') {
                switch (this.style) {
                    case ListStyle.auto:
                    default:
                        msg = botbuilder_choices_1.ChoiceFactory.forChannel(context, choices, prompt, speak, this.choiceOptions);
                        break;
                    case ListStyle.inline:
                        msg = botbuilder_choices_1.ChoiceFactory.inline(choices, prompt, speak, this.choiceOptions);
                        break;
                    case ListStyle.list:
                        msg = botbuilder_choices_1.ChoiceFactory.list(choices, prompt, speak, this.choiceOptions);
                        break;
                    case ListStyle.suggestedAction:
                        msg = botbuilder_choices_1.ChoiceFactory.suggestedAction(choices, prompt, speak);
                        break;
                    case ListStyle.none:
                        msg = { type: 'message', text: prompt };
                        if (speak) {
                            msg.speak = speak;
                        }
                        break;
                }
            }
            else {
                msg = Object.assign({}, prompt);
                if (speak) {
                    msg.speak = speak;
                }
            }
            return internal_1.sendPrompt(context, msg);
        },
        recognize: function recognize(context, choices) {
            const request = context.activity || {};
            const utterance = request.text || '';
            const options = Object.assign({}, this.recognizerOptions);
            options.locale = request.locale || this.recognizerOptions.locale || defaultLocale || 'en-us';
            const results = botbuilder_choices_1.recognizeChoices(utterance, choices, options);
            const value = results.length > 0 ? results[0].resolution : undefined;
            return Promise.resolve(validator ? validator(context, value) : value);
        }
    };
}
exports.createChoicePrompt = createChoicePrompt;
//# sourceMappingURL=choicePrompt.js.map