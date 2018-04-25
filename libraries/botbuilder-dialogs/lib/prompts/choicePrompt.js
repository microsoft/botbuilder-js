"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const prompts = require("botbuilder-prompts");
/**
 * :package: **botbuilder-dialogs**
 *
 * Prompts a user to confirm something with a yes/no response. By default the prompt will return
 * to the calling dialog a `boolean` representing the users selection.
 *
 * The prompt can be used either as a dialog added to your bots `DialogSet` or on its own as a
 * control if your bot is using some other conversation management system.
 *
 * ### Dialog Usage
 *
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to select a choice
 * from a list and their choice will be passed as an argument to the callers next waterfall step:
 *
 * ```JavaScript
 * const { DialogSet, ChoicePrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('choicePrompt', new ChoicePrompt());
 *
 * dialogs.add('colorPrompt', [
 *      async function (dc) {
 *          await dc.prompt('choicePrompt', `Select a color`, ['red', 'green', 'blue']);
 *      },
 *      async function (dc, choice) {
 *          const color = choice.value;
 *          await dc.context.sendActivity(`I like ${color} too!`);
 *          await dc.end();
 *      }
 * ]);
 * ```
 *
 * If the users response to the prompt fails to be recognized they will be automatically re-prompted
 * to try again. By default the original prompt is re-sent to the user but you can provide an
 * alternate prompt to send by passing in additional options:
 *
 * ```JavaScript
 * await dc.prompt('choicePrompt', `Select a color`, ['red', 'green', 'blue'], { retryPrompt: `I didn't catch that. Select a color from the list.` });
 * ```
 *
 * ### Control Usage
 *
 * If your bot isn't dialog based you can still use the prompt on its own as a control. You will
 * just need start the prompt from somewhere within your bots logic by calling the prompts
 * `begin()` method:
 *
 * ```JavaScript
 * const state = {};
 * const prompt = new ChoicePrompt();
 * await prompt.begin(context, state, {
 *     choices: ['red', 'green', 'blue'],
 *     prompt: `Select a color`,
 *     retryPrompt: `I didn't catch that. Select a color from the list.`
 * });
 * ```
 *
 * The prompt will populate the `state` object you passed in with information it needs to process
 * the users response. You should save this off to your bots conversation state as you'll need to
 * pass it to the prompts `continue()` method on the next turn of conversation with the user:
 *
 * ```JavaScript
 * const prompt = new ChoicePrompt();
 * const result = await prompt.continue(context, state);
 * if (!result.active) {
 *     const color = result.result;
 * }
 * ```
 *
 * The `continue()` method returns a `DialogResult` object which can be used to determine when
 * the prompt is finished and then to access the results of the prompt.  To interrupt or cancel
 * the prompt simply delete the `state` object your bot is persisting.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param O (Optional) output type returned by prompt. This defaults to an instance of `FoundChoice` but can be changed by a custom validator passed to the prompt.
 */
class ChoicePrompt extends prompt_1.Prompt {
    /**
     * Creates a new `ChoicePrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator, defaultLocale) {
        super(validator);
        this.prompt = prompts.createChoicePrompt(undefined, defaultLocale);
    }
    /**
     * Sets additional options passed to the `ChoiceFactory` and used to tweak the style of choices
     * rendered to the user.
     * @param options Additional options to set.
     */
    choiceOptions(options) {
        Object.assign(this.prompt.choiceOptions, options);
        return this;
    }
    /**
     * Sets additional options passed to the `recognizeChoices()` function.
     * @param options Additional options to set.
     */
    recognizerOptions(options) {
        Object.assign(this.prompt.recognizerOptions, options);
        return this;
    }
    /**
     * Sets the style of the choice list rendered to the user when prompting.
     * @param listStyle Type of list to render to to user. Defaults to `ListStyle.auto`.
     */
    style(listStyle) {
        this.prompt.style = listStyle;
        return this;
    }
    onPrompt(dc, options, isRetry) {
        const choices = options.choices;
        if (isRetry && options.retryPrompt) {
            return this.prompt.prompt(dc.context, choices, options.retryPrompt, options.retrySpeak);
        }
        return this.prompt.prompt(dc.context, choices, options.prompt, options.speak);
    }
    onRecognize(dc, options) {
        return this.prompt.recognize(dc.context, options.choices);
    }
}
exports.ChoicePrompt = ChoicePrompt;
//# sourceMappingURL=choicePrompt.js.map