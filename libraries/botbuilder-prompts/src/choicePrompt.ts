/**
 * @module botbuilder-prompts
 */
/** second comment block */

import { Prompt, PromptOptions, PromptState, CompletedHandler, Prompter, ValidatorResult } from './prompt';
import { Activity, ActivityTypes, Promiseable, EntityRecognizers, EntityObject, RecognizeChoicesOptions, Choice, CardAction, CardStyler } from 'botbuilder-core';
import * as localizedPrompts from './localized-prompts';
import * as channel from './channel';

/**
 * List style types used to control the inclusion of choices for an outgoing prompt.
 */
export enum ListStyle {
    /** Use the style most appropriate for the current channel. */
    auto = 0,

    /** No changes should be made to the outgoing prompt. */
    none,

    /** Append choices to the outgoing prompt as an inline list. */
    inline, 

    /** Append choices to the outgoing prompt as a numbered list. */
    list, 

    /** Append choices to teh outgoing list as a set of suggested actions. */
    suggestedActions 
}

/**
 * Additional options that can be passed to a `ChoicePrompt`.
 */
export interface ChoicePromptOptions extends PromptOptions, RecognizeChoicesOptions {
    /**
     * Choices to recognize against.
     */
    choices?: Choice[];

    /**
     * (Optional) Style of choice list displayed to user.
     */
    listStyle?: ListStyle;
}

/**
 * Prompts the user choose from a set of choices.
 *
 * **Usage Example**
 *
 * ```js
 * // create new choice prompt
 * const colorPrompt = new ChoicePrompt('colorPrompt', (context, state) => {
 *      const color = state.value;
 * 
 *      // ... do something with choice ...
 * 
 * });
 *
 * // configure the available choices
 * colorPrompt.choices(['red', 'blue', 'green]);
 *
 * // use prompt
 * function promptForColor(context) {
 *      const prompt = colorPrompt.reply('Pick a color');
 *      context.begin(prompt);
 * }
 * ```
 *
 * @param W (Optional) type of parameters that can be passed to [with()](#with). 
 * @param O (Optional) type of options supported by any derived classes. 
 */
export class ChoicePrompt<W extends Object = any, O extends ChoicePromptOptions = ChoicePromptOptions> extends Prompt<string, W, O> {
    constructor(uid: string, completed: CompletedHandler<string,W,O>, prompter?: Prompter<string,W,O>) {
        super(uid, ChoicePrompt.validator, completed, prompter || ChoicePrompt.prompter);
    }

    /**
     * Set the choices that should be recognized by the prompt.
     *
     * @param choices Array of choices. If a `string` is provided for an item it will be converted
     * to a `Choice` object with the `Choice.value` assigned to the item.
     */
    public choices(choices: (string|Choice)[]): this {
        const list: Choice[] = [];
        (choices || []).forEach((item) => {
            if (typeof item === 'string') {
                list.push({ value: item });
            } else {
                list.push(item);
            }
        });
        return this.set({ choices: list } as O);
    }
    
    static validator(context: BotContext, options?: ChoicePromptOptions): ValidatorResult<string> {
        options = options || {};
        if (context.request.type === ActivityTypes.message) {
            const utterance = (context.request.text || '').trim();
            const choices = options.choices;
            let entity: EntityObject<string>|undefined;
            if (choices && choices.length > 0) {
                let topScore = 0.0;

                // Try finding by text search over choices first
                const byText = EntityRecognizers.findTopEntity(EntityRecognizers.recognizeChoices(utterance, choices, options));
                if (byText) {
                    topScore = byText.score as number;
                    entity = byText;
                }

                // Next try recognizing a numerical index
                let byIndex = EntityRecognizers.findTopEntity(EntityRecognizers.recognizeNumbers(context, {
                    minValue: 1,
                    maxValue: choices.length,
                    integerOnly: true
                }));
                if (byIndex && (byIndex.score as number) > topScore) {
                    topScore = byIndex.score as number;
                    entity = { value: choices[byIndex.value - 1].value, type: 'string', score: byIndex.score };
                }

                // Finally try recognizing as an ordinal
                let byOrdinal = EntityRecognizers.findTopEntity(EntityRecognizers.recognizeOrdinals(context));
                if (byOrdinal && (byOrdinal.score as number) > topScore) {
                    const index = byOrdinal.value > 0 ? byOrdinal.value - 1 : choices.length + byOrdinal.value;
                    if (index >= 0 && index < choices.length) {
                        topScore = byOrdinal.score as number;
                        entity = { value: choices[index].value, type: 'string', score: byOrdinal.score };
                    }
                }
            } else {
                context.logger.log(`ChoicePrompt: started without being provided a choices array.`, TraceLevel.error);
            }

            if (entity) {
                return { value: entity.value };
            }
        }
        return { error: 'invalid' };
    }

    static prompter(context: BotContext, state: PromptState<string,any,ChoicePromptOptions>): void {
        // Find list style
        const options = state.options;
        const choices = options.choices || [];
        let style = options.listStyle !== undefined ? options.listStyle : ListStyle.auto;
        if (style === ListStyle.auto) {
            style = ChoicePrompt.autoListStyle(context, choices, state.turns);
        }

        // Find prompt
        let prompt: Partial<Activity>|undefined;
        if (state.turns === 0) {
            prompt = options.prompt;
        } else {
            const defaultPrompt = localizedPrompts.find(context.request.locale || 'en').default_choice;
            prompt = state.options.rePrompt || defaultPrompt;
        }

        // Render composed prompt
        if (prompt) {
            context.reply(ChoicePrompt.composeChoicePrompt(context, prompt, choices, style));
        }
    }

    static autoListStyle(context: BotContext, choices: Choice[], turns: number): ListStyle {
        // Find maximum title length
        let maxTitleLength = 0;
        choices.forEach((choice) => {
            let l = choice.action && choice.action.title ? choice.action.title.length : choice.value.length;
            if (l > maxTitleLength) {
                maxTitleLength = l;
            }
        });

        // Determine list style
        let listStyle: ListStyle;
        const supportsSuggestedActions = channel.supportsSuggestedActions(context, choices.length);
        const supportsCardActions = channel.supportsCardActions(context, choices.length);
        const maxActionTitleLength = channel.maxActionTitleLength(context);
        const hasMessageFeed = channel.hasMessageFeed(context);
        const longTitles = maxTitleLength > maxActionTitleLength;
        if (!longTitles && (supportsSuggestedActions || (!hasMessageFeed && supportsCardActions))) {
            // We always prefer showing choices using suggested actions. If the titles are too long, however,
            // we'll have to show them as a text list.
            listStyle = ListStyle.suggestedActions;
        } else if (!longTitles && choices.length <= 3) {
            // If the titles are short and there are 3 or less choices we'll use an inline list.
            listStyle = ListStyle.inline;
        } else {
            // For the initial turn we'll show a numbered list, otherwise we won't add anything.
            listStyle = turns === 0 ? ListStyle.list : ListStyle.none;
        }
        return listStyle;
    }

    static composeChoicePrompt(context: BotContext, textOrActivity: string|Partial<Activity>, choices: Choice[], style: ListStyle): Partial<Activity> {
        // Initialize output prompt
        let prompt: Partial<Activity>;
        if (typeof textOrActivity === 'string') {
            // New message activity
            prompt = { type: ActivityTypes.message, text: textOrActivity };
        } else {
            // Shallow copy of source activity
            prompt = Object.assign({}, textOrActivity);
            if (!prompt.type) { prompt.type = ActivityTypes.message }
        }

        // Append choices to output prompt 
        let connector = '';
        switch (style) {
            case ListStyle.suggestedActions:
                // Add suggested actions to prompt
                const actions = choices.map<CardAction>((choice) => {
                    if (choice.action) {
                        return choice.action;
                    } else {
                        return { type: 'imBack', value: choice.value, title: choice.value }
                    }
                });
                prompt.suggestedActions = { actions: actions }
                break;
            case ListStyle.list:
                // Add numbered list to prompt text
                if (!prompt.text || prompt.text.length == 0) { prompt.text = '' }
                prompt.text += '\n\n   ';
                choices.forEach((choice: any, index: number) => {
                    prompt.text += connector + (index+1).toString() + '. ' + choice.value;
                    connector =  '\n   ';
                });
                break;
            case ListStyle.inline:
                if (!prompt.text || prompt.text.length == 0) { prompt.text = '' }
                prompt.text += ' (';
                choices.forEach((choice: any, index: number) => {
                    prompt.text += connector + (index+1).toString() + '. ' + choice.value;
                    if (index == (choices.length - 2)) {
                        // Get localized version of " or "
                        const cid =  index == 0 ? 'list_or' : 'list_or_more';
                        connector = localizedPrompts.find(context.request.locale || 'en')[cid];
                    } else {
                        connector = ', ';
                    }
                });
                prompt.text += ')';
                break;
        }
        return prompt;
    }
}

// END OF LINE
