/**
 * @module botbuilder-ai
 */
/** second comment block */
import { Activity, ConversationResourceResponse, Middleware } from 'botbuilder';
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
    protected luisAppId: string;
    protected luisAccessKey: string;
    private luisClient;
    private translator;
    constructor(translatorKey: string, nativeLanguages: string[], luisAppId: string, luisAccessKey: string);
    receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void>;
    postActivity(context: BotContext, activities: Activity[], next: () => Promise<ConversationResourceResponse[]>): Promise<ConversationResourceResponse[]>;
    private TranslateMessageAsync(context, message, sourceLanguage, targetLanguage);
}
