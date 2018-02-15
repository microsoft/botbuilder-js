/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware } from 'botbuilder';
import { Activity, ResourceResponse } from 'botbuilder';
import * as LanguageMap from './languageMap';
import LuisClient = require('botframework-luis');

let MsTranslator = require('mstranslator');

export interface TranslationContext {
    /// Original pre-translation text
    sourceText: string;

    /// source language
    sourceLanguage: string;

    /// The targeted translation language
    targetLanguage: string;
}

/**
 * The LanguageTranslator will use the Text Translator Cognitive service to translate text from a source language
 * to one of the native languages that the bot speaks.  By adding it to the middleware pipeline you will automatically
 * get a translated experience, and also a LUIS model allowing the user to ask to speak a language.
 */
export class LanguageTranslator implements Middleware {
    private luisClient: LuisClient;
    private translator: Translator;

    public constructor(translatorKey: string, protected nativeLanguages: string[], protected luisAppId: string, protected luisAccessKey: string) {
        this.luisClient = new LuisClient();
        this.translator = new MsTranslator({api_key: translatorKey}, true);
        this.translator.translateArrayAsync = denodeify(this.translator, this.translator.translateArray);
    }

    /// Incoming activity
    public async receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void> {
        if (context.request.type == "message" && context.request.text) {
            // determine the language we are using for this conversation
            let sourceLanguage = this.nativeLanguages[0];

            if (context.state && context.state.conversation && context.state.conversation.language) {
                sourceLanguage = context.state.conversation.language;
            }
            // create translationcontext
            let translationContext = <TranslationContext>{};
            translationContext.sourceLanguage = sourceLanguage;
            translationContext.targetLanguage = (this.nativeLanguages.indexOf(sourceLanguage) >= 0) ? sourceLanguage : this.nativeLanguages[0];
            (<any>context).translation = translationContext;


            // translate to bots language
            if (translationContext.sourceLanguage != translationContext.targetLanguage) {
                translationContext.sourceText = context.request.text;
                await this.TranslateMessageAsync(context, context.request, translationContext.sourceLanguage, translationContext.targetLanguage);
            }

            if (this.luisAppId && this.luisAccessKey) {
                // look to see if this is a request to speak a different language
                let lowertext = context.request.text.toLowerCase();
                for (let iName in LanguageMap.Names) {
                    let name = LanguageMap.Names[iName]
                    if (lowertext.indexOf(name) >= 0) {
                        // it has a language name in it, it may be a request to speak another language
                        let commandText = context.request.text;
                        // translate commandtext if not in en already (our model is in english)
                        if (sourceLanguage != 'en') {
                            let translationResult = await this.translator.translateArrayAsync({
                                from: sourceLanguage,
                                to: 'en',
                                texts: [commandText]
                            });
                            commandText = <string>translationResult[0].TranslatedText;
                        }
                        // look at intent of commandText
                        var intents = await this.luisClient.getIntentsAndEntitiesV2(this.luisAppId, this.luisAccessKey, commandText);
                        if (intents.topScoringIntent && intents.topScoringIntent.intent == 'BotTranslator.ChangeLanguage' && intents.entities.length > 0) {
                            let languageFragment: string = intents.entities[0].entity || '';
                            if (LanguageMap.namesToCode[languageFragment.toLowerCase()]) {
                                // set new source language
                                translationContext.sourceLanguage = LanguageMap.namesToCode[languageFragment];
                                // remember
                                if (context.state && context.state.conversation) {
                                    context.state.conversation.language = LanguageMap.namesToCode[languageFragment];
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
        return next();
    }


    /// outgoing activities
    public postActivity(context: BotContext, activities: Activity[], next: () => Promise<ResourceResponse[]>): Promise<ResourceResponse[]> {
        let promises: Promise<void>[] = [];

        for (let iActivity in activities) {
            let activity = activities[iActivity];
            if (activity.type === 'message') {
                let message = activity;
                if (message.text && message.text.length > 0) {
                    // use translationContext to reverse translate the response
                    let translationContext: TranslationContext = (<any>context).translation;
                    if (translationContext.sourceLanguage != translationContext.targetLanguage)
                        promises.push(this.TranslateMessageAsync(context, message, translationContext.targetLanguage, translationContext.sourceLanguage));
                }
            }
        }
        return Promise.all(promises)
            .then(result => next());
    }

    /// Translate .Text field of a message, regardless of direction
    private TranslateMessageAsync(context: BotContext, message: Partial<Activity>, sourceLanguage: string, targetLanguage: string): Promise<void> {
        // if we have text and a target language
        if (message.text && message.text.length > 0 && targetLanguage != sourceLanguage) {
            // truncate big text
            let text = message.text.length <= 65536 ? message.text : message.text.substring(0, 65536);

            // massage mentions so they don't get translated
            if (message.entities) {
                let i = 0;
                for (let iEntity in message.entities) {
                    let entity = message.entities[iEntity];
                    if (entity.type == 'mention') {
                        let mention: any = entity;
                        let placeholder = "__" + i++ + "__";
                        text = text.replace(mention.text, placeholder);
                    }
                }
            }

            let lines = text.split('\n');
            return this.translator.translateArrayAsync({
                from: sourceLanguage,
                to: targetLanguage,
                texts: lines,
                contentType: 'text/plain'
            })
                .then((translateResult) => {
                    text = '';
                    for (let iData in translateResult) {
                        if (text.length > 0)
                            text += '\n';
                        text += translateResult[iData].TranslatedText;
                    }

                    // restore mentions
                    if (message.entities) {
                        let i = 0;
                        for (let iEntity in message.entities) {
                            let entity = message.entities[iEntity];
                            if (entity.type == 'mention') {
                                let mention: any = entity;
                                let placeholder = "__" + i++ + "__";
                                text = text.replace(placeholder, mention.text);
                            }
                        }
                    }

                    message.text = text;
                });
        }
        return Promise.resolve();
    }
}

// turn a cb based azure method into a Promisified one
function denodeify<T>(thisArg: any, fn: Function): (...args: any[]) => Promise<T> {
    return (...args: any[]) => {
        return new Promise<T>((resolve, reject) => {
            args.push((error: Error, result: any) => (error) ? reject(error) : resolve(result));
            fn.apply(thisArg, args);
        });
    };
}

declare interface TranslateArrayOptions {
    texts: string[];
    from: string;
    to: string;
    contentType?: string;
    category?: string;
}

interface ErrorOrResult<TResult> {
    (error: Error, result: TResult): void
}

interface TranslationResult {
    TranslatedText: string;
}

interface Translator {
    translateArray(options: TranslateArrayOptions, callback: ErrorOrResult<TranslationResult[]>): void;

    translateArrayAsync(options: TranslateArrayOptions): Promise<TranslationResult[]>
}
