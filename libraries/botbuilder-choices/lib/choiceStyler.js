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
class ChoiceStyler {
    static forChannel(channelOrContext, choices, text, speak, options) {
        const channelId = typeof channelOrContext === 'string' ? channelOrContext : channel.getChannelId(channelOrContext);
        // Normalize choices
        const list = ChoiceStyler.toChoices(choices);
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
            return ChoiceStyler.suggestedAction(list, text, speak, options);
        }
        else if (!longTitles && choices.length <= 3) {
            // If the titles are short and there are 3 or less choices we'll use an inline list.
            return ChoiceStyler.inline(list, text, speak, options);
        }
        else {
            // Show a numbered list.
            return ChoiceStyler.list(list, text, speak, options);
        }
    }
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
        ChoiceStyler.toChoices(choices).forEach((choice, index) => {
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
        return botbuilder_1.MessageStyler.text(txt, speak, botbuilder_1.InputHints.ExpectingInput);
    }
    static list(choices, text, speak, options) {
        const opt = Object.assign({
            includeNumbers: true
        }, options);
        // Format list of choices
        let connector = '';
        let txt = (text || '');
        txt += '\n\n   ';
        ChoiceStyler.toChoices(choices).forEach((choice, index) => {
            const title = choice.action && choice.action.title ? choice.action.title : choice.value;
            txt += `${connector}${opt.includeNumbers ? (index + 1).toString() + '. ' : '- '}${title}`;
            connector = '\n   ';
        });
        // Return activity with choices as a numbered list.
        return botbuilder_1.MessageStyler.text(txt, speak, botbuilder_1.InputHints.ExpectingInput);
    }
    static suggestedAction(choices, text, speak, options) {
        // Map choices to actions
        const actions = ChoiceStyler.toChoices(choices).map((choice) => {
            if (choice.action) {
                return choice.action;
            }
            else {
                return { type: botbuilder_1.ActionTypes.ImBack, value: choice.value, title: choice.value };
            }
        });
        // Return activity with choices as suggested actions
        return botbuilder_1.MessageStyler.suggestedActions(actions, text, speak, botbuilder_1.InputHints.ExpectingInput);
    }
    static toChoices(choices) {
        return (choices || []).map((choice) => typeof choice === 'string' ? { value: choice } : choice);
    }
}
exports.ChoiceStyler = ChoiceStyler;
//# sourceMappingURL=choiceStyler.js.map