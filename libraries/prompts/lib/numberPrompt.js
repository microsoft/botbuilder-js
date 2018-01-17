"use strict";
/**
 * @module botbuilder-prompts
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const botbuilder_core_1 = require("botbuilder-core");
const localizedPrompts = require("./localized-prompts");
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
class NumberPrompt extends prompt_1.Prompt {
    constructor(uid, completed, prompter) {
        super(uid, NumberPrompt.validator, completed, prompter || NumberPrompt.prompter);
    }
    static validator(context, options) {
        options = options || {};
        if (context.request.type === botbuilder_core_1.ActivityTypes.message) {
            const entity = botbuilder_core_1.EntityRecognizers.findTopEntity(botbuilder_core_1.EntityRecognizers.recognizeNumbers(context));
            if (entity) {
                return NumberPrompt.ensureValidNumber(options, entity.value);
            }
        }
        return { error: 'invalid' };
    }
    static prompter(context, state) {
        if (state.turns === 0) {
            const prompt = state.options.prompt;
            if (prompt) {
                context.reply(prompt);
            }
        }
        else {
            const responses = localizedPrompts.find(context.request.locale || 'en');
            switch (state.error) {
                case 'number_integer_error':
                    context.reply(responses.number_integer_error);
                    break;
                case 'number_range_error':
                    context.reply((responses.number_range_error.text || '')
                        .replace('${minValue}', (state.options.minValue || 0).toString())
                        .replace('${maxValue}', (state.options.maxValue || 0).toString()));
                    break;
                case 'number_minValue_error':
                    context.reply((responses.number_minValue_error.text || '').replace('${minValue}', (state.options.minValue || 0).toString()));
                    break;
                case 'number_maxValue_error':
                    context.reply((responses.number_maxValue_error.text || '').replace('${maxValue}', (state.options.maxValue || 0).toString()));
                    break;
                case 'invalid':
                default:
                    context.reply(state.options.rePrompt || responses.default_number);
                    break;
            }
        }
    }
    static ensureValidNumber(options, value) {
        if (options.integerOnly && Math.floor(value) !== value) {
            return { error: 'number_integer_error' };
        }
        else if (options.minValue !== undefined && options.maxValue !== undefined) {
            if (value < options.minValue || value > options.maxValue) {
                return { error: 'number_range_error' };
            }
        }
        else if (options.minValue !== undefined && value < options.minValue) {
            return { error: 'number_minValue_error' };
        }
        else if (options.maxValue !== undefined && value > options.maxValue) {
            return { error: 'number_maxValue_error' };
        }
        return { value: value };
    }
}
exports.NumberPrompt = NumberPrompt;
//# sourceMappingURL=numberPrompt.js.map