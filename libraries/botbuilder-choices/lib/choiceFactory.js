"use strict";
/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const channel = require("./channel");
/**
 * A set of utility functions to assist with the formatting a 'message' activity containing a list
 * of choices.
 *
 * @remarks
 * This example shows creating a message containing a list of choices that has been conditionally
 * formatted based on the capabilities of the underlying channel:
 *
 * ```JavaScript
 * const { ChoiceFactory } = require('botbuilder-choices');
 *
 * const message = ChoiceFactory.forChannel(context, ['red', 'green', 'blue'], `Pick a color.`);
 * await context.sendActivity(message);
 * ```
 */
class ChoiceFactory {
    /**
     * Returns a 'message' activity containing a list of choices that has been automatically
     * formatted based on the capabilities of a given channel.
     *
     * @remarks
     * The algorithm prefers to format the supplied list of choices as suggested actions but can
     * decide to use a text based list if suggested actions aren't natively supported by the
     * channel, there are too many choices for the channel to display, or the title of any choice
     * is too long.
     *
     * If the algorithm decides to use a list it will use an inline list if there are 3 or less
     * choices and all have short titles. Otherwise, a numbered list is used.
     *
     * ```JavaScript
     * const message = ChoiceFactory.forChannel(context, [
     *    { value: 'red', action: { type: 'imBack', title: 'The Red Pill', value: 'red pill' } },
     *    { value: 'blue', action: { type: 'imBack', title: 'The Blue Pill', value: 'blue pill' } },
     * ], `Which do you choose?`);
     * await context.sendActivity(message);
     * ```
     * @param channelOrContext Channel ID or context object for the current turn of conversation.
     * @param choices List of choices to render.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to speak for the message.
     * @param options (Optional) formatting options to use when rendering as a list.
     */
    static forChannel(channelOrContext, choices, text, speak, options) {
        const channelId = typeof channelOrContext === 'string' ? channelOrContext : channel.getChannelId(channelOrContext);
        // Normalize choices
        const list = ChoiceFactory.toChoices(choices);
        // Find maximum title length
        let maxTitleLength = 0;
        list.forEach((choice) => {
            let l = choice.action && choice.action.title ? choice.action.title.length : choice.value.length;
            if (l > maxTitleLength) {
                maxTitleLength = l;
            }
        });
        // Determine list style
        const supportsSuggestedActions = channel.supportsSuggestedActions(channelId, choices.length);
        const supportsCardActions = channel.supportsCardActions(channelId, choices.length);
        const maxActionTitleLength = channel.maxActionTitleLength(channelId);
        const hasMessageFeed = channel.hasMessageFeed(channelId);
        const longTitles = maxTitleLength > maxActionTitleLength;
        if (!longTitles && (supportsSuggestedActions || (!hasMessageFeed && supportsCardActions))) {
            // We always prefer showing choices using suggested actions. If the titles are too long, however,
            // we'll have to show them as a text list.
            return ChoiceFactory.suggestedAction(list, text, speak);
        }
        else if (!longTitles && choices.length <= 3) {
            // If the titles are short and there are 3 or less choices we'll use an inline list.
            return ChoiceFactory.inline(list, text, speak, options);
        }
        else {
            // Show a numbered list.
            return ChoiceFactory.list(list, text, speak, options);
        }
    }
    /**
     * Returns a 'message' activity containing a list of choices that has been formatted as an
     * inline list.
     *
     * @remarks
     * This example generates a message text of "Pick a color: (1. red, 2. green, or 3. blue)":
     *
     * ```JavaScript
     * const message = ChoiceFactory.inline(['red', 'green', 'blue'], `Pick a color:`);
     * await context.sendActivity(message);
     * ```
     * @param choices List of choices to render.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to speak for the message.
     * @param options (Optional) formatting options to tweak rendering of list.
     */
    static inline(choices, text, speak, options) {
        const opt = Object.assign({
            inlineSeparator: ', ',
            inlineOr: ' or ',
            inlineOrMore: ', or ',
            includeNumbers: true
        }, options);
        // Format list of choices
        let connector = '';
        let txt = (text || '');
        txt += ' ';
        ChoiceFactory.toChoices(choices).forEach((choice, index) => {
            const title = choice.action && choice.action.title ? choice.action.title : choice.value;
            txt += `${connector}${opt.includeNumbers ? '(' + (index + 1).toString() + ') ' : ''}${title}`;
            if (index == (choices.length - 2)) {
                connector = (index == 0 ? opt.inlineOr : opt.inlineOrMore) || '';
            }
            else {
                connector = opt.inlineSeparator || '';
            }
        });
        txt += '';
        // Return activity with choices as an inline list.
        return botbuilder_1.MessageFactory.text(txt, speak, botbuilder_1.InputHints.ExpectingInput);
    }
    /**
     * Returns a 'message' activity containing a list of choices that has been formatted as an
     * numbered or bulleted list.
     *
     * @remarks
     * This example generates a message with the choices presented as a numbered list:
     *
     * ```JavaScript
     * const message = ChoiceFactory.list(['red', 'green', 'blue'], `Pick a color:`);
     * await context.sendActivity(message);
     * ```
     * @param choices List of choices to render.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to speak for the message.
     * @param options (Optional) formatting options to tweak rendering of list.
     */
    static list(choices, text, speak, options) {
        const opt = Object.assign({
            includeNumbers: true
        }, options);
        // Format list of choices
        let connector = '';
        let txt = (text || '');
        txt += '\n\n   ';
        ChoiceFactory.toChoices(choices).forEach((choice, index) => {
            const title = choice.action && choice.action.title ? choice.action.title : choice.value;
            txt += `${connector}${opt.includeNumbers ? (index + 1).toString() + '. ' : '- '}${title}`;
            connector = '\n   ';
        });
        // Return activity with choices as a numbered list.
        return botbuilder_1.MessageFactory.text(txt, speak, botbuilder_1.InputHints.ExpectingInput);
    }
    /**
     * Returns a 'message' activity containing a list of choices that have been added as suggested
     * actions.
     *
     * @remarks
     * This example generates a message with the choices presented as suggested action buttons:
     *
     * ```JavaScript
     * const message = ChoiceFactory.suggestedAction(['red', 'green', 'blue'], `Pick a color:`);
     * await context.sendActivity(message);
     * ```
     * @param choices List of choices to add.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to speak for the message.
     */
    static suggestedAction(choices, text, speak) {
        // Map choices to actions
        const actions = ChoiceFactory.toChoices(choices).map((choice) => {
            if (choice.action) {
                return choice.action;
            }
            else {
                return { type: botbuilder_1.ActionTypes.ImBack, value: choice.value, title: choice.value };
            }
        });
        // Return activity with choices as suggested actions
        return botbuilder_1.MessageFactory.suggestedActions(actions, text, speak, botbuilder_1.InputHints.ExpectingInput);
    }
    /**
     * Takes a mixed list of `string` and `Choice` based choices and returns them as a `Choice[]`.
     *
     * @remarks
     * This example converts a simple array of string based choices to a properly formated `Choice[]`.
     *
     * ```JavaScript
     * const choices = ChoiceFactory.toChoices(['red', 'green', 'blue']);
     * ```
     * @param choices List of choices to add.
     */
    static toChoices(choices) {
        return (choices || []).map((choice) => typeof choice === 'string' ? { value: choice } : choice).filter((choice) => choice);
    }
}
exports.ChoiceFactory = ChoiceFactory;
//# sourceMappingURL=choiceFactory.js.map