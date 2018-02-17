"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_choices_1 = require("botbuilder-choices");
var ChoicePromptStyle;
(function (ChoicePromptStyle) {
    /** Don't include any choices for prompt. */
    ChoicePromptStyle[ChoicePromptStyle["none"] = 0] = "none";
    /** Automatically select the appropriate style for the current channel. */
    ChoicePromptStyle[ChoicePromptStyle["auto"] = 1] = "auto";
    /** Add choices to prompt as an inline list. */
    ChoicePromptStyle[ChoicePromptStyle["inline"] = 2] = "inline";
    /** Add choices to prompt as a numbered list. */
    ChoicePromptStyle[ChoicePromptStyle["list"] = 3] = "list";
    /** Add choices to prompt as suggested actions. */
    ChoicePromptStyle[ChoicePromptStyle["suggestedAction"] = 4] = "suggestedAction";
})(ChoicePromptStyle = exports.ChoicePromptStyle || (exports.ChoicePromptStyle = {}));
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
        case ChoicePromptStyle.auto:
        default:
            return botbuilder_choices_1.ChoiceStyler.forChannel(channelOrContext, choices, text, speak, options);
        case ChoicePromptStyle.inline:
            return botbuilder_choices_1.ChoiceStyler.inline(choices, text, speak, options);
        case ChoicePromptStyle.list:
            return botbuilder_choices_1.ChoiceStyler.list(choices, text, speak, options);
        case ChoicePromptStyle.suggestedAction:
            return botbuilder_choices_1.ChoiceStyler.suggestedAction(choices, text, speak, options);
        case ChoicePromptStyle.none:
            const p = { type: 'message', text: text || '' };
            if (speak) {
                p.speak = speak;
            }
            return p;
    }
}
exports.formatChoicePrompt = formatChoicePrompt;
//# sourceMappingURL=choicePrompt.js.map