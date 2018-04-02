import { DialogSet, CompositeControl, ChoicePrompt, DialogResult, FoundChoice } from 'botbuilder-dialogs';
import { TurnContext } from 'botbuilder';

export interface LanguagePickerOptions {
    defaultLocale?: string;
    supportedLocales?: string[]; 
}

export class LanguagePicker extends CompositeControl<string, LanguagePickerOptions> {
    constructor(defaultOptions?: LanguagePickerOptions) {
        super(dialogs, 'chooseLanguage', defaultOptions)
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
        let locale = (dc.context.activity.locale || options.defaultLocale).split('-')[0];
        
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
    'ja': `言語を選択。` 
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