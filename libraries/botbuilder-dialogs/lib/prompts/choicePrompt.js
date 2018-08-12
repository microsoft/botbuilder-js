"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const choices_1 = require("../choices");
/**
 * Prompts a user to confirm something with a yes/no response.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `boolean` representing the users
 * selection.
 */
class ChoicePrompt extends prompt_1.Prompt {
    /**
     * Creates a new `ChoicePrompt` instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId, validator, defaultLocale) {
        super(dialogId, validator);
        this.style = prompt_1.ListStyle.auto;
        this.defaultLocale = defaultLocale;
    }
    onPrompt(context, state, options, isRetry) {
        return __awaiter(this, void 0, void 0, function* () {
            // Determine locale
            let locale = context.activity.locale || this.defaultLocale;
            if (locale || !ChoicePrompt.defaultChoiceOptions.hasOwnProperty(locale)) {
                locale = 'en-us';
            }
            // Format prompt to send
            let prompt;
            const choices = options.choices || [];
            const channelId = context.activity.channelId;
            const choiceOptions = this.choiceOptions || ChoicePrompt.defaultChoiceOptions[locale];
            if (isRetry && options.retryPrompt) {
                prompt = this.appendChoices(options.retryPrompt, channelId, choices, this.style, choiceOptions);
            }
            else {
                prompt = this.appendChoices(options.prompt, channelId, choices, this.style, choiceOptions);
            }
            // Send prompt
            yield context.sendActivity(prompt);
        });
    }
    onRecognize(context, state, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = { succeeded: false };
            const activity = context.activity;
            const utterance = activity.text;
            const choices = options.choices || [];
            const opt = this.recognizerOptions || {};
            opt.locale = activity.locale || opt.locale || this.defaultLocale || 'en-us';
            const results = choices_1.recognizeChoices(utterance, choices, opt);
            if (Array.isArray(results) && results.length > 0) {
                result.succeeded = true;
                result.value = results[0].resolution;
            }
            return result;
        });
    }
}
ChoicePrompt.defaultChoiceOptions = {
    'es-es': { inlineSeparator: ", ", inlineOr: " o ", inlineOrMore: ", o ", includeNumbers: true },
    'nl-nl': { inlineSeparator: ", ", inlineOr: " of ", inlineOrMore: ", of ", includeNumbers: true },
    'en-us': { inlineSeparator: ", ", inlineOr: " or ", inlineOrMore: ", or ", includeNumbers: true },
    'fr-fr': { inlineSeparator: ", ", inlineOr: " ou ", inlineOrMore: ", ou ", includeNumbers: true },
    'de-de': { inlineSeparator: ", ", inlineOr: " oder ", inlineOrMore: ", oder ", includeNumbers: true },
    'ja-jp': { inlineSeparator: "、 ", inlineOr: " または ", inlineOrMore: "、 または ", includeNumbers: true },
    'pt-br': { inlineSeparator: ", ", inlineOr: " ou ", inlineOrMore: ", ou ", includeNumbers: true },
    'zh-cn': { inlineSeparator: "， ", inlineOr: " 要么 ", inlineOrMore: "， 要么 ", includeNumbers: true },
};
exports.ChoicePrompt = ChoicePrompt;
//# sourceMappingURL=choicePrompt.js.map