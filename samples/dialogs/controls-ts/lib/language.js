"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
class LanguagePicker extends botbuilder_dialogs_1.Control {
    constructor(options) {
        super(dialogs, 'chooseLanguage', options);
    }
    static async begin(context, state, options) {
        // Initialize stack and start control
        state['stack'] = [];
        const dc = dialogs.createContext(context, state['stack']);
        await dc.begin('chooseLanguage', options);
    }
    static async continue(context, state) {
        // Continue control execution
        const dc = dialogs.createContext(context, state['stack']);
        return await dc.continue();
    }
}
exports.LanguagePicker = LanguagePicker;
//---------------------------------------------------------
// LanguagePicker Implementation
//---------------------------------------------------------
const dialogs = new botbuilder_dialogs_1.DialogSet();
dialogs.add('chooseLanguage', [
    async function (dc, args) {
        // Merge options
        const options = Object.assign({
            defaultLocale: 'en',
            supportedLocales: allLocales
        }, args);
        // Find the current local (split on '-' for root LCID)
        let locale = (dc.context.request.locale || options.defaultLocale).split('-')[0];
        // Ensure that the users current locale is one we support.
        if (!localeToPrompt.hasOwnProperty(locale)) {
            locale = options.defaultLocale;
        }
        ;
        // Prompt user for choice
        const prompt = localeToPrompt[locale];
        const choices = options.supportedLocales.map((lcid) => localeToChoice[lcid]);
        return await dc.prompt('choicePrompt', prompt, choices);
    },
    async function (dc, choice) {
        // Map choice to locale and return
        const locale = choiceToLocale[choice.value];
        return await dc.end(locale);
    }
]);
dialogs.add('choicePrompt', new botbuilder_dialogs_1.ChoicePrompt());
const allLocales = ['en', 'es', 'fr', 'it', 'ja'];
const localeToPrompt = {
    'en': `Select your preferred language.`,
    'es': `Seleccione su idioma preferido.`,
    'fr': `Sélectionnez votre langue préférée.`,
    'it': `Selezionare la lingua desiderata.`,
    'ja': `希望する言語を選択します。`
};
const localeToChoice = {
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'it': 'Italiano',
    'ja': '日本語'
};
const choiceToLocale = {
    'English': 'en',
    'Español': 'es',
    'Français': 'fr',
    'Italiano': 'it',
    '日本語': 'ja'
};
