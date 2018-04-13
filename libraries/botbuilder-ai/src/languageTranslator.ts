/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext, ActivityTypes, Activity } from 'botbuilder';
import * as request from 'request-promise-native';
import { DOMParser } from "xmldom";

export interface TranslatorSettings {
    translatorKey: string;
    nativeLanguages: string[];
    noTranslatePatterns: Set<string>;
    getUserLanguage?: (context: TurnContext) => string;
    setUserLanguage?: (context: TurnContext) => Promise<boolean>;
    translateBackToUserLanguage?: boolean;
}

/**
 * The LanguageTranslator will use the Text Translator Cognitive service to translate text from a source language
 * to one of the native languages that the bot speaks.  By adding it to the middleware pipeline you will automatically
 * get a translated experience, and also a LUIS model allowing the user to ask to speak a language.
 */
export class LanguageTranslator implements Middleware {
    private translator: Translator;
    private getUserLanguage: ((context: TurnContext) => string) | undefined;
    private setUserLanguage: ((context: TurnContext) => Promise<boolean>) | undefined;
    private nativeLanguages: string[];
    private translateBackToUserLanguage: boolean

    public constructor(settings: TranslatorSettings) {
        this.translator = new MicrosoftTranslator(settings.translatorKey, settings.noTranslatePatterns);
        this.nativeLanguages = settings.nativeLanguages;
        this.getUserLanguage = settings.getUserLanguage;
        this.setUserLanguage = settings.setUserLanguage;
        this.translateBackToUserLanguage = settings.translateBackToUserLanguage;
    }

    /// Incoming activity
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type != ActivityTypes.Message) {
            return next();
        } 
        if (this.setUserLanguage != undefined) {
            let changedLanguage = await this.setUserLanguage(context);
            if (changedLanguage) {
                return Promise.resolve();
            }
        }
        // determine the language we are using for this conversation
        let sourceLanguage: string;
        if (this.getUserLanguage != undefined) {
            sourceLanguage = this.getUserLanguage(context);
        } else {
            sourceLanguage = await this.translator.detect(context.activity.text);
        }
        
        let targetLanguage = (this.nativeLanguages.indexOf(sourceLanguage) >= 0) ? sourceLanguage : this.nativeLanguages[0];
        
        await this.translateMessageAsync(context, context.activity, sourceLanguage, targetLanguage);

        if (this.translateBackToUserLanguage) {
            context.onSendActivities(async (newContext, activities, newNext) => {
                await Promise.all(activities.map(async (activity) => {
                    if (activity.type == ActivityTypes.Message) {
                        await this.translateMessageAsync(newContext, activity, targetLanguage, sourceLanguage);
                    }
                }));
                
                return newNext();
            })
        }
        // translate to bots language
        return next();
        
    }

    /// Translate .Text field of a message, regardless of direction
    private async translateMessageAsync(context: TurnContext, message: Partial<Activity>, sourceLanguage: string, targetLanguage: string): Promise<TranslationResult[]> {
        if (sourceLanguage == targetLanguage) {
            return Promise.resolve([]);
        }
        
        let text = message.text;
        
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
                text += translateResult[iData].translatedText;
            }
            message.text = text;
            return Promise.resolve(translateResult);
        })
    }
}

declare interface TranslateArrayOptions {
    texts: string[];
    from: string;
    to: string;
    contentType?: string;
    category?: string;
}

interface TranslationResult {
    translatedText: string;
}

interface Translator {
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
        .then(result => Promise.resolve(result))
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
        let query: any = `?text=${encodeURI(text)}`;
        return this.getAccessToken()
        .then(accessToken => {
            return request({
                url: uri + query,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            })
        })
        .then(lang => Promise.resolve(lang.replace(/<[^>]*>/g, '')))
    }

    translateArrayAsync(options: TranslateArrayOptions): Promise<TranslationResult[]> {
        let from = options.from;
        let to = options.to;
        let texts = options.texts;
        let orgTexts = [];
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
        
        return this.getAccessToken()
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
                let result: TranslationResult = { translatedText: translation };
                results.push(result);
                index += 1;
            });
            return Promise.resolve(results);
        })
    }
}

export class PostProcessTranslator {
    noTranslatePatterns: Set<string>;

    constructor(noTranslatePatterns: Set<string>) {
        this.noTranslatePatterns = new Set<string>();

        if(noTranslatePatterns) {
            noTranslatePatterns.forEach(pattern => {
                if (pattern.indexOf('(') == -1) {
                    pattern = `(${pattern})`;
                }
                this.noTranslatePatterns.add(pattern);
            });
        }  
    }

    private join(delimiter: string, words: string[]): string {
        let sentence = words.join(delimiter);
        sentence = sentence.replace(new RegExp("[ ]?'[ ]?", "g"), "'");
        
        return sentence;
    }

    private splitSentence(sentence: string, alignments: string[], isSrcSentence = true): string[] {
        let wrds = sentence.split(' ');
        if (alignments.length > 0) {
            let outWrds: string[] = [];
            let wrdIndexInAlignment = 1;

            if (isSrcSentence) {
                wrdIndexInAlignment = 0;
            } else {
                alignments.sort((a, b) => {
                    let aIndex = parseInt(a.split('-')[wrdIndexInAlignment].split(':')[0]);
                    let bIndex = parseInt(b.split('-')[wrdIndexInAlignment].split(':')[0]);
                    if (aIndex <= bIndex) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
            }

            for (let alignData of alignments) {
                wrds = outWrds;
                let wordIndexes = alignData.split('-')[wrdIndexInAlignment];
                let startIndex = parseInt(wordIndexes.split(':')[0]);
                let length = parseInt(wordIndexes.split(':')[1]) - startIndex + 1;
                let wrd = sentence.substr(startIndex, length);
                let newWrds: string[] = new Array(outWrds.length + 1);
                if (newWrds.length > 1) {
                    newWrds = wrds.slice();
                }
                newWrds[outWrds.length] = wrd;
                
                let subSentence = this.join(" ", newWrds);
                if (sentence.indexOf(subSentence) != -1) {
                    outWrds.push(wrd);
                }
            }
            wrds = outWrds;
        }
        return wrds;
    }

    private wordAlignmentParse(alignments: string[], srcWords: string[], trgWords: string[]): { [id: number] : number } {
        let alignMap: { [id: number] : number } = {};

        let sourceMessage = this.join(" ", srcWords);
        let trgMessage = this.join(" ", trgWords);

        alignments.forEach(alignData => {
            let wordIndexes = alignData.split('-');
            
            let srcStartIndex = parseInt(wordIndexes[0].split(':')[0]);
            let srcLength = parseInt(wordIndexes[0].split(':')[1]) - srcStartIndex + 1;
            let srcWrd = sourceMessage.substr(srcStartIndex, srcLength);
            let srcWrdIndex = srcWords.findIndex(wrd => wrd == srcWrd);
            
            let trgstartIndex = parseInt(wordIndexes[1].split(':')[0]);
            let trgLength = parseInt(wordIndexes[1].split(':')[1]) - trgstartIndex + 1;
            let trgWrd = trgMessage.substr(trgstartIndex, trgLength);
            let trgWrdIndex = trgWords.findIndex(wrd => wrd == trgWrd);

            alignMap[srcWrdIndex] = trgWrdIndex;

        });
        return alignMap;
    }

    private keepSrcWrdInTranslation(alignment: { [id: number] : number }, sourceWords: string[], targetWords: string[], srcWrdIndex: number) {
        if (!(typeof alignment[srcWrdIndex] === "undefined")) {
            targetWords[alignment[srcWrdIndex]] = sourceWords[srcWrdIndex];
        }
        return targetWords;
    }

    public fixTranslation(sourceMessage: string, alignment: string, targetMessage: string): string {
        let numericMatches = sourceMessage.match(new RegExp("[0-9]+", "g"));
        let containsNum = numericMatches != null;
        let noTranslatePatterns = Array.from(this.noTranslatePatterns);
        
        if (!containsNum && noTranslatePatterns.length == 0) {
            return targetMessage;
        }

        let toBeReplaced: string[] = [];
        noTranslatePatterns.forEach(pattern => {
            let regExp = new RegExp(pattern, "i");
            let matches = sourceMessage.match(regExp);
            if (matches != null) {
                toBeReplaced.push(pattern);
            }
        });

        let alignments: string[];
        
        if (alignment.trim() == '') {
            alignments = [];
        } else {
            alignments = alignment.trim().split(' ');
        }
       
        let srcWords = this.splitSentence(sourceMessage, alignments);
        let trgWords = this.splitSentence(targetMessage, alignments, false);
        let alignMap = this.wordAlignmentParse(alignments, srcWords, trgWords);

        if (toBeReplaced.length > 0) {
            toBeReplaced.forEach(pattern => {
                let regExp = new RegExp(pattern, "i");
                let match = regExp.exec(sourceMessage);
                
                let noTranslateStartChrIndex = match.index + match[0].indexOf(match[1]);
                let noTranslateMatchLength = match[1].length;
                let wrdIndx = 0;
                let chrIndx = 0;
                let newChrLengthFromMatch = 0;
                let srcIndx = -1;
                let newNoTranslateArrayLength = 1;

                for (let wrd of srcWords) {
                    chrIndx += wrd.length + 1;
                    wrdIndx++;
                    if (chrIndx == noTranslateStartChrIndex) {
                        srcIndx = wrdIndx;
                    }
                    if (srcIndx != -1) {
                        if (newChrLengthFromMatch + srcWords[wrdIndx].length >= noTranslateMatchLength) {
                            break;
                        }
                        newNoTranslateArrayLength++;
                        newChrLengthFromMatch += srcWords[wrdIndx].length + 1;
                    }
                }
                
                let wrdNoTranslate = srcWords.slice(srcIndx, srcIndx + newNoTranslateArrayLength)
                
                wrdNoTranslate.forEach(srcWrds => {
                    trgWords = this.keepSrcWrdInTranslation(alignMap, srcWords, trgWords, srcIndx);
                    srcIndx++;
                });
                
            });
        }

        if (containsNum) {
            for (const numericMatch in numericMatches) {
                let srcIndx = srcWords.findIndex(wrd => wrd == numericMatch)
                trgWords = this.keepSrcWrdInTranslation(alignMap, srcWords, trgWords, srcIndx);
            }
        }
        return this.join(" ", trgWords);
    }
}