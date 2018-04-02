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
    noTranslatePatterns: Set<string>;
    getUserLanguage?: ((c: TurnContext) => string) | undefined;
    setUserLanguage?: ((context: TurnContext) => Promise<boolean>) | undefined;
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
    constructor(settings: TranslatorSettings);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    private translateMessageAsync(context);
}
export declare class PostProcessTranslator {
    noTranslatePatterns: Set<string>;
    constructor(noTranslatePatterns: Set<string>);
    private wordAlignmentParse(alignment, source, target);
    private keepSrcWrdInTranslation(alignment, source, target, srcWrdIndex);
    fixTranslation(sourceMessage: string, alignment: string, targetMessage: string): string;
}
