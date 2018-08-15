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
const Recognizers = require("@microsoft/recognizers-text-choice");
/**
 * Prompts a user to confirm something with a yes/no response.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `boolean` representing the users
 * selection.
 */
class ConfirmPrompt extends prompt_1.Prompt {
    /**
     * Creates a new `ConfirmPrompt` instance.
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
            if (locale || !ConfirmPrompt.defaultChoiceOptions.hasOwnProperty(locale)) {
                locale = 'en-us';
            }
            // Format prompt to send
            let prompt;
            const channelId = context.activity.channelId;
            const choiceOptions = this.choiceOptions || ConfirmPrompt.defaultChoiceOptions[locale];
            const choices = this.confirmChoices || ConfirmPrompt.defaultConfirmChoices[locale];
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
            const locale = activity.locale || this.defaultLocale || 'en-us';
            const results = Recognizers.recognizeBoolean(utterance, locale);
            if (results.length > 0 && results[0].resolution) {
                result.succeeded = true;
                result.value = results[0].resolution.value;
            }
            return result;
        });
    }
}
ConfirmPrompt.defaultConfirmChoices = {
    'es-es': ['Sí', 'No'],
    'nl-nl': ['Ja', 'Niet'],
    'en-us': ['Yes', 'No'],
    'fr-fr': ['Oui', 'Non'],
    'de-de': ['Ja', 'Nein'],
    'ja-jp': ['はい', 'いいえ'],
    'pt-br': ['Sim', 'Não'],
    'zh-cn': ['是的', '不']
};
ConfirmPrompt.defaultChoiceOptions = {
    'es-es': { inlineSeparator: ", ", inlineOr: " o ", inlineOrMore: ", o ", includeNumbers: true },
    'nl-nl': { inlineSeparator: ", ", inlineOr: " of ", inlineOrMore: ", of ", includeNumbers: true },
    'en-us': { inlineSeparator: ", ", inlineOr: " or ", inlineOrMore: ", or ", includeNumbers: true },
    'fr-fr': { inlineSeparator: ", ", inlineOr: " ou ", inlineOrMore: ", ou ", includeNumbers: true },
    'de-de': { inlineSeparator: ", ", inlineOr: " oder ", inlineOrMore: ", oder ", includeNumbers: true },
    'ja-jp': { inlineSeparator: "、 ", inlineOr: " または ", inlineOrMore: "、 または ", includeNumbers: true },
    'pt-br': { inlineSeparator: ", ", inlineOr: " ou ", inlineOrMore: ", ou ", includeNumbers: true },
    'zh-cn': { inlineSeparator: "， ", inlineOr: " 要么 ", inlineOrMore: "， 要么 ", includeNumbers: true },
};
exports.ConfirmPrompt = ConfirmPrompt;
//# sourceMappingURL=confirmPrompt.js.map