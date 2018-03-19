import { DialogSet, Control, ChoicePrompt, DialogResult, FoundChoice } from 'botbuilder-dialogs';
import { BotContext } from 'botbuilder';

export interface LanguagePickerOptions {
    defaultLocale?: string;
    supportedLocales?: string[]; 
}

export class LanguagePicker extends Control {
    constructor(options?: LanguagePickerOptions) {
        super(dialogs, 'chooseLanguage', options)
    } 

    static async begin(context: BotContext, state: object, options?: LanguagePickerOptions) {
        // Initialize stack and start control
        state['stack'] = [];
        const dc = dialogs.createContext(context, state['stack']);
        await dc.begin('chooseLanguage', options);
    }

    static async continue(context: BotContext, state: object) {
        // Continue control execution
        const dc = dialogs.createContext(context, state['stack']);
        return await dc.continue() as DialogResult<string>;
    }
}

//---------------------------------------------------------
// LanguagePicker Implementation
//---------------------------------------------------------

const dialogs = new DialogSet();

dialogs.add('chooseLanguage', [
    async function (dc, args?: LanguagePickerOptions) {
        // Merge options
        const options = Object.assign({
            defaultLocale: 'en',
            supportedLocales: allLocales
        } as LanguagePickerOptions, args);

        // Find the current local (split on '-' for root LCID)
        let locale = (dc.context.request.locale || options.defaultLocale).split('-')[0];
        
        // Ensure that the users current locale is one we support.
        if (!localeToPrompt.hasOwnProperty(locale)) { locale = options.defaultLocale };

        // Prompt user for choice
        const prompt = localeToPrompt[locale];
        const choices = options.supportedLocales.map((lcid) => localeToChoice[lcid]);
        return await dc.prompt('choicePrompt', prompt, choices);
    },
    async function (dc, choice: FoundChoice) {
        // Map choice to locale and return
        const locale = choiceToLocale[choice.value];
        return await dc.end(locale);
    }
]);

dialogs.add('choicePrompt', new ChoicePrompt());

const allLocales = [ 'en', 'es', 'fr', 'it', 'ja' ];

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