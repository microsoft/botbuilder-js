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
import * as request from 'request-promise-native';
import LuisClient = require('botframework-luis');
import { DOMParser } from "xmldom";

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
    private translator: Translator;
    private getUserLanguage: ((context: BotContext) => string) | undefined;
    private setUserLanguage: ((context: BotContext) => Promise<boolean>) | undefined;

    public constructor(translatorKey: string, protected nativeLanguages: string[], noTranslatePatterns: Set<string>, getUserLanguage?: (c: BotContext) => string, setUserLanguage?: (context: BotContext) => Promise<boolean>) {
        this.translator = new MicrosoftTranslator(translatorKey, noTranslatePatterns);
        this.getUserLanguage = getUserLanguage;
        this.setUserLanguage = setUserLanguage;
    }

    /// Incoming activity
    public async receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void> {
        if (context.request.type == "message" && context.request.text) {
            
            if (this.setUserLanguage != undefined) {
                let changedLanguage = await this.setUserLanguage(context);
                if (changedLanguage) {
                    return next();
                }
            }
            // determine the language we are using for this conversation
            let sourceLanguage: string;
            if (this.getUserLanguage != undefined) {
                sourceLanguage = this.getUserLanguage(context);
            } else {
                sourceLanguage = await this.translator.detect(context.request.text);
            }

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
        }
        return next();
    }


    // /// outgoing activities
    // public postActivity(context: BotContext, activities: Activity[], next: () => Promise<ResourceResponse[]>): Promise<ResourceResponse[]> {
    //     let promises: Promise<void>[] = [];

    //     for (let iActivity in activities) {
    //         let activity = activities[iActivity];
    //         if (activity.type === 'message') {
    //             let message = activity;
    //             if (message.text && message.text.length > 0) {
    //                 // use translationContext to reverse translate the response
    //                 let translationContext: TranslationContext = (<any>context).translation;
    //                 if (translationContext.sourceLanguage != translationContext.targetLanguage)
    //                     promises.push(this.TranslateMessageAsync(context, message, translationContext.targetLanguage, translationContext.sourceLanguage));
    //             }
    //         }
    //     }
    //     return Promise.all(promises)
    //         .then(result => next());
    // }

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

    translateArrayAsync(options: TranslateArrayOptions): Promise<TranslationResult[]>;

    detect(text: string): Promise<string>;
}

class MicrosoftTranslator implements Translator {
    
    apiKey: string;
    postProcessor: PostProcessTranslator;
    noTranslatePatterns: Set<string> = new Set<string>();

    constructor(apiKey: string, noTranslatePatterns: Set<string>) {
        this.apiKey = apiKey;
        this.postProcessor = new PostProcessTranslator(noTranslatePatterns);
    }

    getAccessToken(): Promise<string> {
        
        return request({
            url: `https://api.cognitive.microsoft.com/sts/v1.0/issueToken?Subscription-Key=${this.apiKey}`,
            method: 'POST'
        })
        .then(result => result)

    }

    entityMap: any = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };
    
    escapeHtml(source: string) {
        return String(source).replace(/[&<>"'\/]/g, s => this.entityMap[s]);
    }

    detect(text: string): Promise<string> {
        let uri: any = "http://api.microsofttranslator.com/v2/Http.svc/Detect";
        let query: any = `?text=${encodeURI(text)}`
        return new Promise<string>((resolve, reject) => {
            this.getAccessToken()
            .then(accessToken => {
                return request({
                    url: uri + query,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                })
            })
            .then(lang => resolve(lang.replace(/<[^>]*>/g, '')))
            .catch(error => reject(error))
        })
    }

    translateArray(options: TranslateArrayOptions, callback: ErrorOrResult<TranslationResult[]>): void {
        return;
    }

    translateArrayAsync(options: TranslateArrayOptions): Promise<TranslationResult[]> {
        let from: any = options.from;
        let to: any = options.to;
        let texts: string[] = options.texts;
        let orgTexts: string[] = [];
        texts.forEach((text, index, array) => {
            orgTexts.push(text);
            texts[index] = this.escapeHtml(text);
            texts[index] = `<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">${text}</string>`;
        });
        
        let uri: any = "https://api.microsofttranslator.com/v2/Http.svc/TranslateArray2";
        let body: any = "<TranslateArrayRequest>" +
        "<AppId />" +
            `<From>${from}</From>` +
            "<Options>" +
            " <Category xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" >generalnn</Category>" +
                "<ContentType xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\">text/plain</ContentType>" +
                "<ReservedFlags xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" />" +
                "<State xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" />" +
                "<Uri xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" />" +
                "<User xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" />" +
            "</Options>" +
            "<Texts>" +
            texts.join('') +
            "</Texts>" +
            `<To>${to}</To>` +
        "</TranslateArrayRequest>";
        
        return new Promise<TranslationResult[]>((resolve, reject) => {
            this.getAccessToken()
            .then(accessToken => {
                return request({
                    url: uri,
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken,
                        'Content-Type': 'text/xml'
                    },
                    body: body,
                    
                })
            })
            .then(response => {
                let results: TranslationResult[] = [];
                let parser = new DOMParser();
                let responseObj = parser.parseFromString(response);
                let elements = responseObj.getElementsByTagName("TranslateArray2Response");
                let index = 0;
                Array.from(elements).forEach(element => {
                    let translation = element.getElementsByTagName('TranslatedText')[0].textContent as string;
                    let alignment = element.getElementsByTagName('Alignment')[0].textContent as string;
                    translation = this.postProcessor.fixTranslation(orgTexts[index], alignment, translation);
                    let result: TranslationResult = { TranslatedText: translation }
                    results.push(result)
                });
                resolve(results);
            })
            .catch(error => {
                console.log(error);
            })
        })
    }
}

export class PostProcessTranslator {
    noTranslatePatterns: Set<string>;

    constructor(noTranslatePatterns: Set<string>) {
        this.noTranslatePatterns = noTranslatePatterns;
    }

    private wordAlignmentParse(alignment: string, source: string, target: string): { [id: string] : string } {
        let alignMap: { [id: string] : string } = {};
        if (alignment.trim() == "")
            return alignMap;
        let alignments: string[] = alignment.trim().split(' ');
        alignments.forEach(alignData => {
            let wordIndexes = alignData.split('-');
            let trgstartIndex = parseInt(wordIndexes[1].split(':')[0]);
            let trgLength = parseInt(wordIndexes[1].split(':')[1]) - trgstartIndex + 1;
            alignMap[wordIndexes[0]] = trgstartIndex + ":" + trgLength
        });
        return alignMap;
    }

    private keepSrcWrdInTranslation(alignment: { [id: string] : string }, source: string, target: string, srcWrd: string) {
        let processedTranslation: string = target;
        let wrdStartIndex = source.indexOf(srcWrd);
        let wrdEndIndex = wrdStartIndex + srcWrd.length - 1;
        let wrdIndexesString = wrdStartIndex + ":" + wrdEndIndex;
        if (wrdIndexesString in alignment) {
            let trgWrdLocation = alignment[wrdIndexesString].split(':');
            let targetWrd = target.substr(parseInt(trgWrdLocation[0]), parseInt(trgWrdLocation[1]));
            if (targetWrd.trim().length == parseInt(trgWrdLocation[1]) && targetWrd != srcWrd)
                processedTranslation = processedTranslation.replace(targetWrd, srcWrd);
        }
        return processedTranslation;
    }

    public fixTranslation(sourceMessage: string, alignment: string, targetMessage: string): string {
        let processedTranslation = targetMessage;
        let numericMatches = sourceMessage.match(new RegExp("\d+", "g"));
        let containsNum = numericMatches != null;
        let noTranslatePatterns = Array.from(this.noTranslatePatterns);

        if (!containsNum && noTranslatePatterns.length == 0) {
            return processedTranslation;
        }

        let toBeReplaced: string[] = [];
        noTranslatePatterns.forEach(pattern => {
            let regExp = new RegExp(pattern, "i");
            let matches = sourceMessage.match(regExp);
            if (matches != null) {
                toBeReplaced.push(pattern);
            }
        });
        
        let alignMap = this.wordAlignmentParse(alignment, sourceMessage, targetMessage);

        if (toBeReplaced.length > 0) {
            toBeReplaced.forEach(pattern => {
                let regExp = new RegExp(pattern, "i");
                let match = regExp.exec(sourceMessage);
                
                if (match != null) {
                    let wrdNoTranslate = match[1].split(' ');
                    wrdNoTranslate.forEach(srcWrd => {
                        processedTranslation = this.keepSrcWrdInTranslation(alignMap, sourceMessage, processedTranslation, srcWrd);
                    });
                }
            });
        }

        if (numericMatches != null) {
            for (const numericMatch in numericMatches) {
                processedTranslation = this.keepSrcWrdInTranslation(alignMap, sourceMessage, processedTranslation, numericMatch);
            }
        }
        return processedTranslation;
    }
}