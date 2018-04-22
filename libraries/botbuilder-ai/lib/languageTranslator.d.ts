/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext } from 'botbuilder';
export interface TranslatorSettings {
    translatorKey: string;
    nativeLanguages: string[];
    noTranslatePatterns?: {
        [id: string]: string[];
    };
    getUserLanguage?: (context: TurnContext) => string;
    setUserLanguage?: (context: TurnContext) => Promise<boolean>;
    translateBackToUserLanguage?: boolean;
}
/**
 * The LanguageTranslator will use the Text Translator Cognitive service to translate text from a source language
 * to one of the native languages that the bot speaks.  By adding it to the middleware pipeline you will automatically
 * get a translated experience, and also a LUIS model allowing the user to ask to speak a language.
 */
export declare class LanguageTranslator implements Middleware {
    private translator;
    private getUserLanguage;
    private setUserLanguage;
    private nativeLanguages;
    private translateBackToUserLanguage;
    private noTranslatePatterns;
    constructor(settings: TranslatorSettings);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    private translateMessageAsync(context, message, sourceLanguage, targetLanguage);
}
export declare class PostProcessTranslator {
    noTranslatePatterns: string[];
    constructor(noTranslatePatterns?: string[]);
    private join(delimiter, words);
    private splitSentence(sentence, alignments, isSrcSentence?);
    private wordAlignmentParse(alignments, srcWords, trgWords);
    private keepSrcWrdInTranslation(alignment, sourceWords, targetWords, srcWrdIndex);
    fixTranslation(sourceMessage: string, alignment: string, targetMessage: string): string;
}
