import { Culture } from '@microsoft/recognizers-text-suite';

export interface PromptCultureModel {
    /**
     * Culture Model's Locale.
     * @example
     * "en-US"
     */
    locale: string;
    /**
     * Culture Model's InlineSeparator.
     * @example
     * ", "
     */
    separator: string;
    /**
     * Culture Model's InlineOr.
     * @example
     * " or "
     */
    inlineOr: string;
    /**
     * Culture Model's InlineOrMore.
     * @example
     * ", or "
     */
    inlineOrMore: string;
    /**
     * Equivalent of "Yes" in Culture Model's Language.
     * @example
     * "Yes"
     */
    yesInLanguage: string;
    /**
     * Equivalent of "No" in Culture Model's Language.
     * @example
     * "No"
     */
    noInLanguage: string;
}

/**
 * Class container for currently-supported Culture Models in Confirm and Choice Prompt.
 */
export class PromptCultureModels {
    public static Chinese: PromptCultureModel = {
        locale: Culture.Chinese,
        separator: ', ',
        inlineOr: ' 要么 ',
        inlineOrMore: '， 要么 ',
        yesInLanguage: '是的',
        noInLanguage: '不',
    }

    public static Dutch: PromptCultureModel = {
        locale: Culture.Dutch,
        separator: ', ',
        inlineOr: ' of ',
        inlineOrMore: ', of ',
        yesInLanguage: 'Ja',
        noInLanguage: 'Nee',
    }

    public static English: PromptCultureModel = {
        locale: Culture.English,
        separator: ', ',
        inlineOr: ' or ',
        inlineOrMore: ', or ',
        yesInLanguage: 'Yes',
        noInLanguage: 'No',
    }

    public static French: PromptCultureModel = {
        locale: Culture.French,
        separator: ', ',
        inlineOr: ' ou ',
        inlineOrMore: ', ou ',
        yesInLanguage: 'Oui',
        noInLanguage: 'Non',
    }

    public static German: PromptCultureModel = {
        locale: Culture.German,
        separator: ', ',
        inlineOr: ' oder ',
        inlineOrMore: ', oder ',
        yesInLanguage: 'Ja',
        noInLanguage: 'Nein',
    }

    public static Japanese: PromptCultureModel = {
        locale: Culture.Japanese,
        separator: '、 ',
        inlineOr: ' または ',
        inlineOrMore: '、 または ',
        yesInLanguage: 'はい',
        noInLanguage: 'いいえ',
    }

    public static Portuguese: PromptCultureModel = {
        locale: Culture.Portuguese,
        separator: ', ',
        inlineOr: ' ou ',
        inlineOrMore: ', ou ',
        yesInLanguage: 'Sim',
        noInLanguage: 'Não',
    }

    public static Spanish: PromptCultureModel = {
        locale: Culture.Spanish,
        separator: ', ',
        inlineOr: ' o ',
        inlineOrMore: ', o ',
        yesInLanguage: 'Sí',
        noInLanguage: 'No',
    }

    /**
     * Use Recognizers-Text to normalize various potential Locale strings to a standard.
     * @param cultureCode Represents locale. Examples: "en-US, en-us, EN".
     * @returns Normalized locale.
     */
    public static mapToNearestLanguage = (cultureCode: string): string => Culture.mapToNearestLanguage(cultureCode);

    public static getSupportedCultures = (): PromptCultureModel[] => 
        [
            PromptCultureModels.Chinese,
            PromptCultureModels.Dutch,
            PromptCultureModels.English,
            PromptCultureModels.French,
            PromptCultureModels.German,
            PromptCultureModels.Japanese,
            PromptCultureModels.Portuguese,
            PromptCultureModels.Spanish,
        ];
}