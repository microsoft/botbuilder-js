/**
 * @module botbuilder-prompts
 */
/** second comment block */

import { Prompt, PromptOptions, PromptState, CompletedHandler, Prompter, ValidatorResult } from './prompt';
import { Activity, ActivityTypes, Promiseable, EntityRecognizers, EntityObject, RecognizeNumbersOptions } from 'botbuilder-core';
import * as localizedPrompts from './localized-prompts';

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
export class NumberPrompt<W extends Object = any, O extends NumberPromptOptions = NumberPromptOptions> extends Prompt<number, W, O> {
    constructor(uid: string, completed: CompletedHandler<number,W,O>, prompter?: Prompter<number,W,O>) {
        super(uid, NumberPrompt.validator, completed, prompter || NumberPrompt.prompter);
    }

    static validator(context: BotContext, options?: NumberPromptOptions): ValidatorResult<number> {
        options = options || {};
        if (context.request.type === ActivityTypes.message) {
            const entity = EntityRecognizers.findTopEntity(EntityRecognizers.recognizeNumbers(context));
            if (entity) {
                return NumberPrompt.ensureValidNumber(options, entity.value);
            }
        }
        return { error: 'invalid' };
    }

    static prompter(context: BotContext, state: PromptState<number,any,NumberPromptOptions>): void {
        if (state.turns === 0) {
            const prompt = state.options.prompt;
            if (prompt) { context.reply(prompt) }
        } else {
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
    
    static ensureValidNumber(options: NumberPromptOptions, value: number): ValidatorResult<number> {
        if (options.integerOnly && Math.floor(value) !== value) {
            return { error: 'number_integer_error' };
        } else if (options.minValue !== undefined && options.maxValue !== undefined){
            if (value < options.minValue || value > options.maxValue) {
                return { error: 'number_range_error' };
            }
        } else if (options.minValue !== undefined && value < options.minValue) {
            return { error: 'number_minValue_error' };
        } else if (options.maxValue !== undefined && value > options.maxValue) {
            return { error: 'number_maxValue_error' };
        }
        return { value: value };
    }
}
