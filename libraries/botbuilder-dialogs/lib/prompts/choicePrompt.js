"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const botbuilder_choices_1 = require("botbuilder-choices");
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
class ChoicePrompt {
    constructor(validator, choices) {
        this.validator = validator;
        this.choices = choices;
        this.stylerOptions = {};
    }
    begin(context, dialogs, options) {
        // Persist options
        const instance = dialogs.getInstance(context);
        instance.state = options || {};
        // Send initial prompt
        if (instance.state.prompt) {
            return this.sendChoicePrompt(context, dialogs, instance.state.prompt, instance.state.speak);
        }
        else {
            return Promise.resolve();
        }
    }
    continue(context, dialogs) {
        // Get choices to recognize against
        return this.getChoices(context, true, dialogs)
            .then((choices) => {
            // Recognize value
            const options = dialogs.getInstance(context).state;
            const utterance = context.request && context.request.text ? context.request.text : '';
            const results = botbuilder_choices_1.recognizeChoices(utterance, choices);
            const value = results.length > 0 ? results[0].resolution : undefined;
            if (this.validator) {
                // Call validator for further processing
                return Promise.resolve(this.validator(context, value, dialogs));
            }
            else if (value) {
                // Return recognized choice
                return dialogs.end(context, value);
            }
            else if (options.retryPrompt) {
                // Send retry prompt to user
                return this.sendChoicePrompt(context, dialogs, options.retryPrompt, options.retrySpeak);
            }
            else if (options.prompt) {
                // Send original prompt to user
                return this.sendChoicePrompt(context, dialogs, options.prompt, options.speak);
            }
            else {
                return Promise.resolve();
            }
        });
    }
    sendChoicePrompt(context, dialogs, prompt, speak) {
        if (typeof prompt === 'string') {
            const style = dialogs.getInstance(context).state.style;
            return this.getChoices(context, false, dialogs)
                .then((choices) => formatChoicePrompt(context, choices, prompt, speak, this.stylerOptions, style))
                .then((activity) => { context.reply(activity); });
        }
        else {
            context.reply(prompt);
            return Promise.resolve();
        }
    }
    getChoices(context, recognizePhase, dialogs) {
        if (this.choices) {
            return Promise.resolve(this.choices(context, recognizePhase, dialogs));
        }
        else {
            const options = dialogs.getInstance(context).state;
            return Promise.resolve(options.choices || []);
        }
    }
}
exports.ChoicePrompt = ChoicePrompt;
function formatChoicePrompt(channelOrContext, choices, text, speak, options, style) {
    switch (style) {
        case ListStyle.auto:
        default:
            return botbuilder_choices_1.ChoiceStyler.forChannel(channelOrContext, choices, text, speak, options);
        case ListStyle.inline:
            return botbuilder_choices_1.ChoiceStyler.inline(choices, text, speak, options);
        case ListStyle.list:
            return botbuilder_choices_1.ChoiceStyler.list(choices, text, speak, options);
        case ListStyle.suggestedAction:
            return botbuilder_choices_1.ChoiceStyler.suggestedAction(choices, text, speak, options);
        case ListStyle.none:
            const p = { type: 'message', text: text || '' };
            if (speak) {
                p.speak = speak;
            }
            if (!p.inputHint) {
                p.inputHint = botbuilder_1.InputHints.ExpectingInput;
            }
            return p;
    }
}
exports.formatChoicePrompt = formatChoicePrompt;
//# sourceMappingURL=choicePrompt.js.map