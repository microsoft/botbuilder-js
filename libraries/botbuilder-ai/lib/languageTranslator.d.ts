/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext } from 'botbuilder';
/**
 * Settings used to configure an instance of `LanguageTranslator`.
 */
export interface TranslatorSettings {
    /** The API key assigned by the Text Translator Cognitive Service. */
    translatorKey: string;
    /** Native languages the bot understands. */
    nativeLanguages: string[];
    /** (Optional) list of patterns that should NOT be translated. */
    noTranslatePatterns?: {
        [id: string]: string[];
    };
    /** (Optional) list of replacement words. */
    wordDictionary?: {
        [id: string]: string;
    };
    /**
     * (Optional) handler that will be called to get the users preferred language for the current
     * turn.
     */
    getUserLanguage?: (context: TurnContext) => string;
    /**
     * (Optional) handler that will be called to determine if the user would like to change their
     * preferred language.
     */
    setUserLanguage?: (context: TurnContext) => Promise<boolean>;
    /**
     * (Optional) if `true` outgoing activities will be translated into the users preferred language.
     *
     * @remarks
     * Defaults to `false`.
     */
    translateBackToUserLanguage?: boolean;
}
/**
 * Middleware that uses the Text Translator Cognitive service to translate text from a source
 * language to one of the native languages that the bot speaks.
 *
 * @remarks
 * When added to your bot adapters middleware pipeline it will automatically translate incoming
 * message activities.
 *
 * The middleware component can also be optionally configured to automatically translate outgoing
 * message activities into the users preferred language.
 */
export declare class LanguageTranslator implements Middleware {
    private translator;
    private getUserLanguage;
    private setUserLanguage;
    private nativeLanguages;
    private translateBackToUserLanguage;
    private noTranslatePatterns;
    private wordDictionary;
    /**
     * Creates a new LanguageTranslator instance.
     * @param settings Settings required to configure the component.
     */
    constructor(settings: TranslatorSettings);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    private translateMessageAsync(context, message, sourceLanguage, targetLanguage);
}
/**
 * @private
 */
export declare class PostProcessTranslator {
    noTranslatePatterns: string[];
    wordDictionary: {
        [id: string]: string;
    };
    constructor(noTranslatePatterns?: string[], wordDictionary?: {
        [id: string]: string;
    });
    private join(delimiter, words);
    private splitSentence(sentence, alignments, isSrcSentence?);
    private wordAlignmentParse(alignments, srcWords, trgWords);
    private keepSrcWrdInTranslation(alignment, sourceWords, targetWords, srcWrdIndex);
    private replaceWordInDictionary(alignment, sourceWords, targetWords, srcWrdIndex);
    fixTranslation(sourceMessage: string, alignment: string, targetMessage: string): string;
}
