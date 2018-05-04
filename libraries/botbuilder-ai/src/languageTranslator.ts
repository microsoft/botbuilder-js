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

/**
 * Settings used to configure an instance of `LanguageTranslator`.
 */
export interface TranslatorSettings {
    /** The API key assigned by the Text Translator Cognitive Service. */
    translatorKey: string;

    /** Native languages the bot understands. */
    nativeLanguages: string[];

    /** (Optional) list of patterns that should NOT be translated. */
    noTranslatePatterns?: { [id: string] : string[] };

    /** (Optional) list of replacement words. */
    wordDictionary?: { [id: string]: string};

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
export class LanguageTranslator implements Middleware {
    private translator: Translator;
    private getUserLanguage: ((context: TurnContext) => string) | undefined;
    private setUserLanguage: ((context: TurnContext) => Promise<boolean>) | undefined;
    private nativeLanguages: string[];
    private translateBackToUserLanguage: boolean;
    private noTranslatePatterns: { [id: string] : string[] };
    private wordDictionary: { [id:string]: string }

    /**
     * Creates a new LanguageTranslator instance.
     * @param settings Settings required to configure the component.
     */
    constructor(settings: TranslatorSettings) {
        this.translator = new MicrosoftTranslator(settings.translatorKey);
        this.nativeLanguages = settings.nativeLanguages;
        this.getUserLanguage = settings.getUserLanguage;
        this.setUserLanguage = settings.setUserLanguage;
        this.translateBackToUserLanguage = settings.translateBackToUserLanguage;
        this.noTranslatePatterns = settings.noTranslatePatterns;
        this.wordDictionary = settings.wordDictionary;
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
        
        if (this.noTranslatePatterns && this.noTranslatePatterns[sourceLanguage] && this.noTranslatePatterns[sourceLanguage].length > 0) {
            this.translator.setPostProcessorTemplate(this.noTranslatePatterns[sourceLanguage], this.wordDictionary);
        } else if (this.wordDictionary) {
            this.translator.setPostProcessorTemplate([], this.wordDictionary);
        }

        return this.translator.translateArrayAsync({
            from: sourceLanguage,
            to: targetLanguage,
            texts: lines,
            contentType: 'text/plain'
        })
        .then((translateResult) => {
            text = '';
            translateResult.forEach(translatedSentence => {
                if (text.length > 0)
                    text += '\n';
                text += translatedSentence.translatedText;
            });
            message.text = text;
            return Promise.resolve(translateResult);
        })
    }
}

/**
 * @private
 */
declare interface TranslateArrayOptions {
    texts: string[];
    from: string;
    to: string;
    contentType?: string;
    category?: string;
}

/**
 * @private
 */
interface TranslationResult {
    translatedText: string;
}

/**
 * @private
 */
interface Translator {
    translateArrayAsync(options: TranslateArrayOptions): Promise<TranslationResult[]>;

    detect(text: string): Promise<string>;

    setPostProcessorTemplate(noTranslatePatterns: string[], wordDictionary?: { [id: string]: string});
}

/**
 * @private
 */
class MicrosoftTranslator implements Translator {
    
    apiKey: string;
    postProcessor: PostProcessTranslator;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.postProcessor = new PostProcessTranslator();
    }

    setPostProcessorTemplate(noTranslatePatterns: string[], wordDictionary?: { [id: string]: string }) {
        this.postProcessor = new PostProcessTranslator(noTranslatePatterns, wordDictionary);
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
            let escapedText = this.escapeHtml(text);
            texts[index] = `<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">${escapedText}</string>`;
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
            Array.from(elements).forEach((element, index, array) => {
                let translation = element.getElementsByTagName('TranslatedText')[0].textContent as string;
                let alignment = element.getElementsByTagName('Alignment')[0].textContent as string;
                translation = this.postProcessor.fixTranslation(orgTexts[index], alignment, translation);
                let result: TranslationResult = { translatedText: translation };
                results.push(result);
            });
            return Promise.resolve(results);
        })
    }
}

/**
 * @private
 */
export class PostProcessTranslator {
    noTranslatePatterns: string[];
    wordDictionary: { [id: string]: string};

    constructor(noTranslatePatterns?: string[], wordDictionary?: { [id: string]: string }) {
        this.noTranslatePatterns = [];
        this.wordDictionary = wordDictionary;
        
        if (wordDictionary) {
            Object.keys(this.wordDictionary).forEach(word => {
                if (word != word.toLowerCase()) {
                    Object.defineProperty(this.wordDictionary, word.toLowerCase(),
                        Object.getOwnPropertyDescriptor(this.wordDictionary, word));
                    delete this.wordDictionary[word];
                }
            });
            
        }

        if(noTranslatePatterns) {
            noTranslatePatterns.forEach(pattern => {
                if (pattern.indexOf('(') == -1) {
                    pattern = `(${pattern})`;
                }
                this.noTranslatePatterns.push(pattern);
            });
        }  
    }

    private join(delimiter: string, words: string[]): string {
        return words.join(delimiter).replace(/[ ]?'[ ]?/g, "'").trim();
    }

    private splitSentence(sentence: string, alignments: string[], isSrcSentence = true): string[] {
        let wrds = sentence.split(' ');
        let lastWrd = wrds[wrds.length - 1];
        if (".,:;?!".indexOf(lastWrd[lastWrd.length - 1]) != -1) {
            wrds[wrds.length - 1] = lastWrd.substr(0, lastWrd.length - 1);
        }
        let alignSplitWrds: string[] = [];
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
        let sentenceWithoutSpaces = sentence.replace(/\s/g, '');
        alignments.forEach(alignData => {
            alignSplitWrds = outWrds;
            let wordIndexes = alignData.split('-')[wrdIndexInAlignment];
            let startIndex = parseInt(wordIndexes.split(':')[0]);
            let length = parseInt(wordIndexes.split(':')[1]) - startIndex + 1;
            let wrd = sentence.substr(startIndex, length);
            let newWrds: string[] = new Array(outWrds.length + 1);
            if (newWrds.length > 1) {
                newWrds = alignSplitWrds.slice();
            }
            newWrds[outWrds.length] = wrd;
            
            let subSentence = this.join("", newWrds);
            
            if (sentenceWithoutSpaces.indexOf(subSentence) != -1) {
                outWrds.push(wrd);
            }
        });
        
        alignSplitWrds = outWrds;
        
        if (this.join("", alignSplitWrds) == this.join("", wrds)) {
            return alignSplitWrds;
        } else {
            return wrds;
        }
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

            if (srcWrdIndex != -1 && trgWrdIndex != -1) {
                alignMap[srcWrdIndex] = trgWrdIndex;   
            }
        });
        return alignMap;
    }

    private keepSrcWrdInTranslation(alignment: { [id: number] : number }, sourceWords: string[], targetWords: string[], srcWrdIndex: number) {
        if (!(typeof alignment[srcWrdIndex] === "undefined")) {
            targetWords[alignment[srcWrdIndex]] = sourceWords[srcWrdIndex];
        }
        return targetWords;
    }

    private replaceWordInDictionary(alignment: { [id: number] : number }, sourceWords: string[], targetWords: string[], srcWrdIndex: number) {
        if (!(typeof alignment[srcWrdIndex] === "undefined")) {
            targetWords[alignment[srcWrdIndex]] = this.wordDictionary[sourceWords[srcWrdIndex].toLowerCase()];
        }
        return targetWords;
    }

    public fixTranslation(sourceMessage: string, alignment: string, targetMessage: string): string {
        let numericMatches = sourceMessage.match(/[0-9]+/g);
        let containsNum = numericMatches != null;
        
        if ((!containsNum && this.noTranslatePatterns.length == 0 && !this.wordDictionary) || alignment.trim() == '') {
            return targetMessage;
        }

        let toBeReplaced: string[] = [];
        this.noTranslatePatterns.forEach(pattern => {
            let regExp = new RegExp(pattern, "i");
            let matches = sourceMessage.match(regExp);
            if (matches != null) {
                toBeReplaced.push(pattern);
            }
        });

        let toBeReplacedByDictionary: string [] = [];
        if (this.wordDictionary) {
            Object.keys(this.wordDictionary).forEach(word => {
                if (sourceMessage.toLowerCase().indexOf(word.toLowerCase()) != -1) {
                    toBeReplacedByDictionary.push(word);
                }
            });
        }
        
        let alignments = alignment.trim().split(' ');
        
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

                srcWords.forEach(wrd => {
                    if (chrIndx == noTranslateStartChrIndex) {
                        srcIndx = wrdIndx;
                    }
                    if (srcIndx != -1) {
                        if (newChrLengthFromMatch + srcWords[wrdIndx].length >= noTranslateMatchLength) {
                            return;
                        }
                        newNoTranslateArrayLength++;
                        newChrLengthFromMatch += srcWords[wrdIndx].length + 1;
                    }
                    chrIndx += wrd.length + 1;
                    wrdIndx++;
                });
                                
                let wrdNoTranslate = srcWords.slice(srcIndx, srcIndx + newNoTranslateArrayLength)
                
                wrdNoTranslate.forEach(srcWrds => {
                    trgWords = this.keepSrcWrdInTranslation(alignMap, srcWords, trgWords, srcIndx);
                    srcIndx++;
                });
                
            });
        }
        
        if (toBeReplacedByDictionary.length > 0) {
            toBeReplacedByDictionary.forEach(word => {
                let regExp = new RegExp(word, "i");
                let match = regExp.exec(sourceMessage);
                
                let noTranslateStartChrIndex = match.index;
                
                let noTranslateMatchLength = match[0].length;
                
                let wrdIndx = 0;
                let chrIndx = 0;
                let newChrLengthFromMatch = 0;
                let srcIndx = -1;
                let newNoTranslateArrayLength = 1;

                srcWords.forEach(wrd => {
                    chrIndx += wrd.length + 1;
                    wrdIndx++;
                    if (chrIndx == noTranslateStartChrIndex) {
                        srcIndx = wrdIndx;
                        return;
                    }
                });
                
                let wrdNoTranslate = srcWords.slice(srcIndx, srcIndx + 1)
                
                wrdNoTranslate.forEach(srcWrds => {
                    trgWords = this.replaceWordInDictionary(alignMap, srcWords, trgWords, srcIndx);
                    srcIndx++;
                });
                
            });
        }

        console.log(toBeReplacedByDictionary);
        
        if (toBeReplacedByDictionary.length > 0) {
            toBeReplacedByDictionary.forEach(word => {
                let regExp = new RegExp(word, "i");
                let match = regExp.exec(sourceMessage);
                
                let noTranslateStartChrIndex = match.index;
                
                let noTranslateMatchLength = match[0].length;
                
                let wrdIndx = 0;
                let chrIndx = 0;
                let newChrLengthFromMatch = 0;
                let srcIndx = -1;
                let newNoTranslateArrayLength = 1;

                srcWords.forEach(wrd => {
                    chrIndx += wrd.length + 1;
                    wrdIndx++;
                    if (chrIndx == noTranslateStartChrIndex) {
                        srcIndx = wrdIndx;
                        return;
                    }
                });
                
                let wrdNoTranslate = srcWords.slice(srcIndx, srcIndx + 1)
                
                wrdNoTranslate.forEach(srcWrds => {
                    trgWords = this.replaceWordInDictionary(alignMap, srcWords, trgWords, srcIndx);
                    srcIndx++;
                });
                
            });
        }

        if (containsNum) {
            numericMatches.forEach(numericMatch => {
                let srcIndx = srcWords.findIndex(wrd => wrd == numericMatch)
                trgWords = this.keepSrcWrdInTranslation(alignMap, srcWords, trgWords, srcIndx);
            });
        }
        return this.join(" ", trgWords);
    }
}