import { DialogSet, DialogContainer, ChoicePrompt, FoundChoice } from 'botbuilder-dialogs';
import { TurnContext } from 'botbuilder';

export interface LanguagePickerSettings {
    defaultLocale?: string;
    supportedLocales?: string[]; 
}

export class LanguagePicker extends DialogContainer<string> {
    constructor(settings?: LanguagePickerSettings) {
        super('chooseLanguage');
        settings = Object.assign({
            defaultLocale: 'en',
            supportedLocales: allLocales
        } as LanguagePickerSettings, settings);


        this.dialogs.add('chooseLanguage', [
            async function (dc) {
        
                // Find the current local (split on '-' for root LCID)
                let locale = (dc.context.activity.locale || settings.defaultLocale).split('-')[0];
                
                // Ensure that the users current locale is one we support.
                if (!localeToPrompt.hasOwnProperty(locale)) { locale = settings.defaultLocale };
        
                // Prompt user for choice
                const prompt = localeToPrompt[locale];
                const choices = settings.supportedLocales.map((lcid) => localeToChoice[lcid]);
                return await dc.prompt('choicePrompt', prompt, choices);
            },
            async function (dc, choice: FoundChoice) {
                // Map choice to locale and return
                const locale = choiceToLocale[choice.value];
                return await dc.endDialog(locale);
            }
        ]);
        
        this.dialogs.add('choicePrompt', new ChoicePrompt());
    } 
}

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
