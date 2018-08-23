/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {  Activity, ActivityTypes, Middleware,  ResourceResponse, TurnContext } from 'botbuilder';
import * as request from 'request-promise-native';

/**
 * Settings used to configure an instance of `LanguageTranslator`.
 */
export interface TranslatorSettings {
    // The API key assigned by the Text Translator Cognitive Service.
    translatorKey: string;

    // Native languages the bot understands.
    nativeLanguages: string[];

    // (Optional) list of patterns that should NOT be translated.
    noTranslatePatterns?: { [id: string] : string[] };

    // (Optional) list of replacement words.
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
    private wordDictionary: { [id: string]: string };

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
        if (context.activity.type !== ActivityTypes.Message) {
            return next();
        }
        if (this.setUserLanguage !== undefined) {
            const changedLanguage: any = await this.setUserLanguage(context);
            if (changedLanguage) {
                return Promise.resolve();
            }
        }
        // determine the language we are using for this conversation
        let sourceLanguage: string;
        if (this.getUserLanguage !== undefined) {
            sourceLanguage = this.getUserLanguage(context);
        } else {
            sourceLanguage = await this.translator.detect(context.activity.text);
        }

        const targetLanguage: string = (this.nativeLanguages.indexOf(sourceLanguage) >= 0) ? sourceLanguage : this.nativeLanguages[0];

        await this.translateMessageAsync(context, context.activity, sourceLanguage, targetLanguage);

        if (this.translateBackToUserLanguage) {
            context.onSendActivities(async (newContext: TurnContext, activities: Partial<Activity>[], newNext: any) => {
                await Promise.all(activities.map(async (activity: Activity) => {
                    if (activity.type === ActivityTypes.Message) {
                        await this.translateMessageAsync(newContext, activity, targetLanguage, sourceLanguage);
                    }
                }));

                return newNext();
            });
        }

        // translate to bots language
        return next();

    }

    /// Translate .Text field of a message, regardless of direction
    private async translateMessageAsync(
        context: TurnContext,
        message: Partial<Activity>,
        sourceLanguage: string,
        targetLanguage: string
    ): Promise<TranslationResult[]> {
        if (sourceLanguage === targetLanguage) {
            return Promise.resolve([]);
        }

        let text: string = message.text;

        const lines: string[] = text.split('\n');

        if (this.noTranslatePatterns && this.noTranslatePatterns[sourceLanguage] && this.noTranslatePatterns[sourceLanguage].length > 0) {
            this.translator.setPostProcessorTemplate(this.noTranslatePatterns[sourceLanguage], this.wordDictionary);
        } else if (this.wordDictionary) {
            this.translator.setPostProcessorTemplate([], this.wordDictionary);
        }

        const translateOptions: TranslateArrayOptions = {
            from: sourceLanguage,
            to: targetLanguage,
            texts: lines.slice(),
            contentType: 'text/plain'
        };

        return this.translator.translateArrayAsync(translateOptions)
        .then((translateResult: string) => {
            const postProcessResult: TranslationResult[] = this.translator.postProcessTranslation(translateResult, lines);
            text = '';
            postProcessResult.forEach((translatedSentence: TranslationResult) => {
                if (text.length > 0) {
                    text += '\n';
                }
                text += translatedSentence.translatedText;
            });
            message.text = text;

            return Promise.resolve(postProcessResult);
        });
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
    translateArrayAsync(options: TranslateArrayOptions): Promise<string>;

    postProcessTranslation(response: string, texts: string[]): TranslationResult[];

    detect(text: string): Promise<string>;

    setPostProcessorTemplate(noTranslatePatterns: string[], wordDictionary?: { [id: string]: string}): void;
}

/**
 * @private
 */
class MicrosoftTranslator implements Translator {
    // tslint:disable-next-line:max-line-length
    private readonly TRANSLATEURL: string = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&includeAlignment=true&includeSentenceLength=true';
    private readonly DETECTURL: string = 'https://api.cognitive.microsofttranslator.com/detect?api-version=3.0';

    private apiKey: string;
    private postProcessor: PostProcessTranslator;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.postProcessor = new PostProcessTranslator();
    }

    public setPostProcessorTemplate(noTranslatePatterns: string[], wordDictionary?: { [id: string]: string }): void {
        this.postProcessor = new PostProcessTranslator(noTranslatePatterns, wordDictionary);
    }

    public detect(text: string): Promise<string> {
        if (text.trim() === '') {
            return Promise.resolve('');
        }

        return request({
            url: this.DETECTURL,
            method: 'POST',
            headers: { 'Ocp-Apim-Subscription-Key': this.apiKey },
            json: [{text: text}]
        })
        .then((response: any) => {
            return response[0].language;
        });
    }

    public translateArrayAsync(options: TranslateArrayOptions): Promise<string> {
        const from: string = options.from;
        const to: string = options.to;
        const texts: string[] = options.texts;
        const uri: string = `${this.TRANSLATEURL}&from=${options.from}&to=${options.to}`;

        if (texts.join('').trim() === '') {
            return Promise.resolve('[]');
        }

        const uriOptions: any = {
            uri: uri,
            method: 'POST',
            headers: { 'Ocp-Apim-Subscription-Key': this.apiKey },
            json: texts.map((t: string) => ({Text: t }))
        };

        return request(uriOptions)
        .then((response: any) => Promise.resolve(JSON.stringify(response)));
    }

    public postProcessTranslation(response: string, orgTexts: string[]): TranslationResult[] {
        return JSON.parse(response).map((responseElement: any) => {
            const translationElement: any = responseElement.translations[0];
            if (translationElement.alignment != null) {
                const alignment: string = translationElement.alignment.proj as string;
                translationElement.text = this.postProcessor.fixTranslation(orgTexts[0], alignment, translationElement.text);
            }

            return { translatedText: translationElement.text };
        }) as TranslationResult[];
    }
}

/**
 * @private
 */
export class PostProcessTranslator {
    public noTranslatePatterns: string[];
    public wordDictionary: { [id: string]: string};

    constructor(noTranslatePatterns?: string[], wordDictionary?: { [id: string]: string }) {
        this.noTranslatePatterns = [];
        this.wordDictionary = wordDictionary;

        if (wordDictionary) {
            Object.keys(this.wordDictionary).forEach((word: string) => {
                if (word !== word.toLowerCase()) {
                    Object.defineProperty(
                        this.wordDictionary,
                        word.toLowerCase(),
                        Object.getOwnPropertyDescriptor(this.wordDictionary, word)
                    );
                    delete this.wordDictionary[word];
                }
            });
        }

        if (noTranslatePatterns) {
            noTranslatePatterns.forEach((pattern: string) => {
                if (pattern.indexOf('(') === -1) {
                    pattern = `(${pattern})`;
                }
                this.noTranslatePatterns.push(pattern);
            });
        }
    }

    // tslint:disable-next-line:max-func-body-length
    public fixTranslation(sourceMessage: string, alignment: string, targetMessage: string): string {
        const numericMatches: any = sourceMessage.match(/[0-9]+/g);
        const containsNum: boolean = numericMatches !== null;

        if ((!containsNum && this.noTranslatePatterns.length === 0 && !this.wordDictionary) || alignment.trim() === '') {
            return targetMessage;
        }

        const toBeReplaced: string[] = [];
        this.noTranslatePatterns.forEach((pattern: string) => {
            const regExp: RegExp = new RegExp(pattern, 'i');
            const matches: any = sourceMessage.match(regExp);
            if (matches != null) {
                toBeReplaced.push(pattern);
            }
        });

        const toBeReplacedByDictionary: string [] = [];
        if (this.wordDictionary) {
            Object.keys(this.wordDictionary).forEach((word: string) => {
                if (sourceMessage.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
                    toBeReplacedByDictionary.push(word);
                }
            });
        }

        const alignments: string[] = alignment.trim().split(' ');

        const srcWords: string[] = this.splitSentence(sourceMessage, alignments);
        let trgWords: string[] = this.splitSentence(targetMessage, alignments, false);

        const alignMap: { [id: number] : number } = this.wordAlignmentParse(alignments, srcWords, trgWords);

        if (toBeReplaced.length > 0) {
            toBeReplaced.forEach((pattern: string) => {
                const regExp: RegExp = new RegExp(pattern, 'i');
                const match: any = regExp.exec(sourceMessage);

                const noTranslateStartChrIndex: number = match.index + match[0].indexOf(match[1]);
                const noTranslateMatchLength: number = match[1].length;
                let wrdIndx: number = 0;
                let chrIndx: number = 0;
                let newChrLengthFromMatch: number = 0;
                let srcIndx: number = -1;
                let newNoTranslateArrayLength: number = 1;

                srcWords.forEach((wrd: string) => {
                    if (chrIndx === noTranslateStartChrIndex) {
                        srcIndx = wrdIndx;
                    }
                    if (srcIndx !== -1) {
                        if (newChrLengthFromMatch + srcWords[wrdIndx].length >= noTranslateMatchLength) {
                            return;
                        }
                        newNoTranslateArrayLength++;
                        newChrLengthFromMatch += srcWords[wrdIndx].length + 1;
                    }
                    chrIndx += wrd.length + 1;
                    wrdIndx++;
                });

                const wrdNoTranslate: string[] = srcWords.slice(srcIndx, srcIndx + newNoTranslateArrayLength);

                wrdNoTranslate.forEach((srcWrds: string) => {
                    trgWords = this.keepSrcWrdInTranslation(alignMap, srcWords, trgWords, srcIndx);
                    srcIndx++;
                });

            });
        }

        if (toBeReplacedByDictionary.length > 0) {
            toBeReplacedByDictionary.forEach((word: string) => {
                const regExp: RegExp = new RegExp(word, 'i');
                const match: any = regExp.exec(sourceMessage);

                const noTranslateStartChrIndex: number = match.index;

                const noTranslateMatchLength: number = match[0].length;

                let wrdIndx: number = 0;
                let chrIndx: number = 0;
                const newChrLengthFromMatch: number = 0;
                let srcIndx: number = -1;
                const newNoTranslateArrayLength: number = 1;

                srcWords.forEach((wrd: string) => {
                    chrIndx += wrd.length + 1;
                    wrdIndx++;
                    if (chrIndx === noTranslateStartChrIndex) {
                        srcIndx = wrdIndx;

                        return;
                    }
                });

                const wrdNoTranslate: string[] = srcWords.slice(srcIndx, srcIndx + 1);

                wrdNoTranslate.forEach((srcWrds: string) => {
                    trgWords = this.replaceWordInDictionary(alignMap, srcWords, trgWords, srcIndx);
                    srcIndx++;
                });

            });
        }

        if (toBeReplacedByDictionary.length > 0) {
            toBeReplacedByDictionary.forEach((word: string) => {
                const regExp: RegExp = new RegExp(word, 'i');
                const match: any = regExp.exec(sourceMessage);

                const noTranslateStartChrIndex: number = match.index;

                const noTranslateMatchLength: number = match[0].length;

                let wrdIndx: number = 0;
                let chrIndx: number = 0;
                const newChrLengthFromMatch: number = 0;
                let srcIndx: number = -1;
                const newNoTranslateArrayLength: number = 1;

                srcWords.forEach((wrd: string) => {
                    chrIndx += wrd.length + 1;
                    wrdIndx++;
                    if (chrIndx === noTranslateStartChrIndex) {
                        srcIndx = wrdIndx;

                        return;
                    }
                });

                const wrdNoTranslate: string[] = srcWords.slice(srcIndx, srcIndx + 1);

                wrdNoTranslate.forEach((srcWrds: string) => {
                    trgWords = this.replaceWordInDictionary(alignMap, srcWords, trgWords, srcIndx);
                    srcIndx++;
                });

            });
        }

        if (containsNum) {
            numericMatches.forEach((numericMatch: string) => {
                const srcIndx: number = srcWords.findIndex((wrd: string) => wrd === numericMatch);
                trgWords = this.keepSrcWrdInTranslation(alignMap, srcWords, trgWords, srcIndx);
            });
        }

        return this.join(' ', trgWords);
    }

    private join(delimiter: string, words: string[]): string {
        return words.join(delimiter).replace(/[ ]?'[ ]?/g, '\'').trim();
    }

    private splitSentence(sentence: string, alignments: string[], isSrcSentence: boolean = true): string[] {
        const wrds: string[] = sentence.split(' ');
        const lastWrd: string = wrds[wrds.length - 1];
        if ('.,:;?!'.indexOf(lastWrd[lastWrd.length - 1]) !== -1) {
            wrds[wrds.length - 1] = lastWrd.substr(0, lastWrd.length - 1);
        }
        let alignSplitWrds: string[] = [];
        const outWrds: string[] = [];
        let wrdIndexInAlignment: number = 1;

        if (isSrcSentence) {
            wrdIndexInAlignment = 0;
        } else {
            alignments.sort((a: string, b: string) => {
                const aIndex: number = parseInt(a.split('-')[wrdIndexInAlignment].split(':')[0], 10);
                const bIndex: number = parseInt(b.split('-')[wrdIndexInAlignment].split(':')[0], 10);
                if (aIndex <= bIndex) {
                    return -1;
                } else {
                    return 1;
                }
            });
        }
        const sentenceWithoutSpaces: string = sentence.replace(/\s/g, '');
        alignments.forEach((alignData: string) => {
            alignSplitWrds = outWrds;
            const wordIndexes: string = alignData.split('-')[wrdIndexInAlignment];
            const startIndex: number = parseInt(wordIndexes.split(':')[0], 10);
            const length: number = parseInt(wordIndexes.split(':')[1], 10) - startIndex + 1;
            const wrd: string = sentence.substr(startIndex, length);
            // tslint:disable-next-line:prefer-array-literal
            let newWrds: string[] = new Array(outWrds.length + 1);
            if (newWrds.length > 1) {
                newWrds = alignSplitWrds.slice();
            }
            newWrds[outWrds.length] = wrd;

            const subSentence: string = this.join('', newWrds);

            if (sentenceWithoutSpaces.indexOf(subSentence) !== -1) {
                outWrds.push(wrd);
            }
        });

        alignSplitWrds = outWrds;

        if (this.join('', alignSplitWrds) === this.join('', wrds)) {
            return alignSplitWrds;
        } else {
            return wrds;
        }
    }

    private wordAlignmentParse(alignments: string[], srcWords: string[], trgWords: string[]): { [id: number] : number } {
        const alignMap: { [id: number] : number } = {};

        const sourceMessage: string = this.join(' ', srcWords);
        const trgMessage: string = this.join(' ', trgWords);

        alignments.forEach((alignData: string) => {
            const wordIndexes: string[] = alignData.split('-');

            const srcStartIndex: number = parseInt(wordIndexes[0].split(':')[0], 10);
            const srcLength: number = parseInt(wordIndexes[0].split(':')[1], 10) - srcStartIndex + 1;
            const srcWrd: string = sourceMessage.substr(srcStartIndex, srcLength);
            const srcWrdIndex: number = srcWords.findIndex((wrd: string) => wrd === srcWrd);

            const trgstartIndex: number = parseInt(wordIndexes[1].split(':')[0], 10);
            const trgLength: number = parseInt(wordIndexes[1].split(':')[1], 10) - trgstartIndex + 1;
            const trgWrd: string = trgMessage.substr(trgstartIndex, trgLength);
            const trgWrdIndex: number = trgWords.findIndex((wrd: string) => wrd === trgWrd);

            if (srcWrdIndex !== -1 && trgWrdIndex !== -1) {
                alignMap[srcWrdIndex] = trgWrdIndex;
            }
        });

        return alignMap;
    }

    private keepSrcWrdInTranslation(
        alignment: { [id: number] : number },
        sourceWords: string[],
        targetWords: string[],
        srcWrdIndex: number
    ): string[] {
        if (!(alignment[srcWrdIndex] === undefined)) {
            targetWords[alignment[srcWrdIndex]] = sourceWords[srcWrdIndex];
        }

        return targetWords;
    }

    private replaceWordInDictionary(
        alignment: { [id: number] : number },
        sourceWords: string[], targetWords: string[],
        srcWrdIndex: number
    ): string[] {
        if (!(alignment[srcWrdIndex] === undefined)) {
            targetWords[alignment[srcWrdIndex]] = this.wordDictionary[sourceWords[srcWrdIndex].toLowerCase()];
        }

        return targetWords;
    }

}
