/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware } from 'botbuilder';
export interface TranslationContext {
    sourceText: string;
    sourceLanguage: string;
    targetLanguage: string;
}
/**
 * The LanguageTranslator will use the Text Translator Cognitive service to translate text from a source language
 * to one of the native languages that the bot speaks.  By adding it to the middleware pipeline you will automatically
 * get a translated experience, and also a LUIS model allowing the user to ask to speak a language.
 */
export declare class LanguageTranslator implements Middleware {
    protected nativeLanguages: string[];
    private translator;
    constructor(translatorKey: string, nativeLanguages: string[]);
    receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void>;
    private TranslateMessageAsync(context, message, sourceLanguage, targetLanguage);
}
export declare class PostProcessTranslator {
    private wordAlignmentParse(alignment, source, target);
    private keepSrcWrdInTranslation(alignment, source, target, srcWrd);
    fixTranslation(sourceMessage: string, alignment: string, targetMessage: string): string;
}
