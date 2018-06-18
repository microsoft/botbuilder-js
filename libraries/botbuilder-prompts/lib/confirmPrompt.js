"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_choices_1 = require("botbuilder-choices");
const internal_1 = require("./internal");
const choicePrompt_1 = require("./choicePrompt");
const Recognizers = require("@microsoft/recognizers-text-choice");
/**
 * Creates a new prompt that asks the user to answer a yes/no question.
 *
 * @remarks
 * This example shows creating a confirm prompt with a custom validator that will re-prompt with
 * alternate prompt text should the utterance not be recognized:
 *
 * ```JavaScript
 * const { createConfirmPrompt } = require('botbuilder-prompts');
 *
 * const confirmPrompt = createConfirmPrompt(async (context, confirmed) => {
 *    if (typeof confirmed != 'boolean') {
 *       await confirmPrompt.prompt(context, `Please answer "yes" or "no".`);
 *    }
 *    return confirmed;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to a boolean `true` or `false` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` is not specified. Defaults to a value of `en-us`.
 */
function createConfirmPrompt(validator, defaultLocale) {
    return {
        choices: { '*': ['yes', 'no'] },
        style: choicePrompt_1.ListStyle.auto,
        choiceOptions: { includeNumbers: false },
        prompt: function prompt(context, prompt, speak) {
            // Get locale specific choices
            let locale = context.activity && context.activity.locale ? context.activity.locale.toLowerCase() : '*';
            if (!this.choices.hasOwnProperty(locale)) {
                locale = '*';
            }
            const choices = this.choices[locale];
            let msg;
            if (typeof prompt !== 'object') {
                switch (this.style) {
                    case choicePrompt_1.ListStyle.auto:
                    default:
                        msg = botbuilder_choices_1.ChoiceFactory.forChannel(context, choices, prompt, speak, this.choiceOptions);
                        break;
                    case choicePrompt_1.ListStyle.inline:
                        msg = botbuilder_choices_1.ChoiceFactory.inline(choices, prompt, speak, this.choiceOptions);
                        break;
                    case choicePrompt_1.ListStyle.list:
                        msg = botbuilder_choices_1.ChoiceFactory.list(choices, prompt, speak, this.choiceOptions);
                        break;
                    case choicePrompt_1.ListStyle.suggestedAction:
                        msg = botbuilder_choices_1.ChoiceFactory.suggestedAction(choices, prompt, speak);
                        break;
                    case choicePrompt_1.ListStyle.none:
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
        recognize: function recognize(context) {
            const request = context.activity || {};
            const utterance = request.text || '';
            const locale = request.locale || defaultLocale || 'en-us';
            const results = Recognizers.recognizeBoolean(utterance, locale);
            const value = results.length > 0 && results[0].resolution ? results[0].resolution.value : undefined;
            return Promise.resolve(validator ? validator(context, value) : value);
        }
    };
}
exports.createConfirmPrompt = createConfirmPrompt;
//# sourceMappingURL=confirmPrompt.js.map