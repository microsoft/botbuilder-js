"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const request = require("request-promise-native");
const xmldom_1 = require("xmldom");
/**
 * The LanguageTranslator will use the Text Translator Cognitive service to translate text from a source language
 * to one of the native languages that the bot speaks.  By adding it to the middleware pipeline you will automatically
 * get a translated experience, and also a LUIS model allowing the user to ask to speak a language.
 */
class LanguageTranslator {
    constructor(settings) {
        this.translator = new MicrosoftTranslator(settings.translatorKey, settings.noTranslatePatterns);
        this.nativeLanguages = settings.nativeLanguages;
        this.getUserLanguage = settings.getUserLanguage;
        this.setUserLanguage = settings.setUserLanguage;
    }
    /// Incoming activity
    onTurn(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type != botbuilder_1.ActivityTypes.Message) {
                return next();
            }
            if (this.setUserLanguage != undefined) {
                let changedLanguage = yield this.setUserLanguage(context);
                if (changedLanguage) {
                    return Promise.resolve();
                }
            }
            // translate to bots language
            return this.translateMessageAsync(context)
                .then(() => next());
        });
    }
    /// Translate .Text field of a message, regardless of direction
    translateMessageAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // determine the language we are using for this conversation
            let sourceLanguage;
            if (this.getUserLanguage != undefined) {
                sourceLanguage = this.getUserLanguage(context);
            }
            else if (context.activity.locale != undefined) {
                sourceLanguage = context.activity.locale;
            }
            else {
                sourceLanguage = yield this.translator.detect(context.activity.text);
            }
            let targetLanguage = (this.nativeLanguages.indexOf(sourceLanguage) >= 0) ? sourceLanguage : this.nativeLanguages[0];
            if (sourceLanguage == targetLanguage) {
                return Promise.resolve([]);
            }
            let message = context.activity;
            let text = context.activity.text;
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
            });
        });
    }
}
exports.LanguageTranslator = LanguageTranslator;
class MicrosoftTranslator {
    constructor(apiKey, noTranslatePatterns) {
        this.noTranslatePatterns = new Set();
        this.entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };
        this.apiKey = apiKey;
        this.postProcessor = new PostProcessTranslator(noTranslatePatterns);
    }
    getAccessToken() {
        return request({
            url: `https://api.cognitive.microsoft.com/sts/v1.0/issueToken?Subscription-Key=${this.apiKey}`,
            method: 'POST'
        })
            .then(result => Promise.resolve(result));
    }
    escapeHtml(source) {
        return String(source).replace(/[&<>"'\/]/g, s => this.entityMap[s]);
    }
    detect(text) {
        let uri = "http://api.microsofttranslator.com/v2/Http.svc/Detect";
        let query = `?text=${encodeURI(text)}`;
        return this.getAccessToken()
            .then(accessToken => {
            return request({
                url: uri + query,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
        })
            .then(lang => Promise.resolve(lang.replace(/<[^>]*>/g, '')));
    }
    translateArrayAsync(options) {
        let from = options.from;
        let to = options.to;
        let texts = options.texts;
        let orgTexts = [];
        texts.forEach((text, index, array) => {
            orgTexts.push(text);
            texts[index] = this.escapeHtml(text);
            texts[index] = `<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">${text}</string>`;
        });
        let uri = "https://api.microsofttranslator.com/v2/Http.svc/TranslateArray2";
        let body = "<TranslateArrayRequest>" +
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
            });
        })
            .then(response => {
            let results = [];
            let parser = new xmldom_1.DOMParser();
            let responseObj = parser.parseFromString(response);
            let elements = responseObj.getElementsByTagName("TranslateArray2Response");
            let index = 0;
            Array.from(elements).forEach(element => {
                let translation = element.getElementsByTagName('TranslatedText')[0].textContent;
                let alignment = element.getElementsByTagName('Alignment')[0].textContent;
                translation = this.postProcessor.fixTranslation(orgTexts[index], alignment, translation);
                let result = { translatedText: translation };
                results.push(result);
            });
            return Promise.resolve(results);
        });
    }
}
class PostProcessTranslator {
    constructor(noTranslatePatterns) {
        this.noTranslatePatterns = new Set();
        if (noTranslatePatterns) {
            noTranslatePatterns.forEach(pattern => {
                if (pattern.indexOf('(') == -1) {
                    pattern = `(${pattern})`;
                }
                this.noTranslatePatterns.add(pattern);
            });
        }
    }
    wordAlignmentParse(alignment, source, target) {
        let alignMap = {};
        if (alignment.trim().replace('\n', '') == "") {
            return alignMap;
        }
        let alignments = alignment.trim().split(' ');
        let srcWrds = source.trim().split(' ');
        let trgWrds = target.trim().split(' ');
        alignments.forEach(alignData => {
            let wordIndexes = alignData.split('-');
            let srcStartIndex = parseInt(wordIndexes[0].split(':')[0]);
            let srcLength = parseInt(wordIndexes[0].split(':')[1]) - srcStartIndex + 1;
            let srcWrd = source.substr(srcStartIndex, srcLength);
            let srcWrdIndex = srcWrds.findIndex(wrd => wrd == srcWrd);
            let trgstartIndex = parseInt(wordIndexes[1].split(':')[0]);
            let trgLength = parseInt(wordIndexes[1].split(':')[1]) - trgstartIndex + 1;
            let trgWrd = target.substr(trgstartIndex, trgLength);
            let trgWrdIndex = trgWrds.findIndex(wrd => wrd == trgWrd);
            alignMap[srcWrdIndex] = trgWrdIndex;
        });
        return alignMap;
    }
    keepSrcWrdInTranslation(alignment, source, target, srcWrdIndex) {
        let processedTranslation = target;
        if (!(typeof alignment[srcWrdIndex] === "undefined")) {
            let trgWrds = processedTranslation.split(' ');
            trgWrds[alignment[srcWrdIndex]] = source.split(' ')[srcWrdIndex];
            processedTranslation = trgWrds.join(' ');
        }
        return processedTranslation;
    }
    fixTranslation(sourceMessage, alignment, targetMessage) {
        let processedTranslation = targetMessage;
        let numericMatches = sourceMessage.match(new RegExp("\d+", "g"));
        let containsNum = numericMatches != null;
        let noTranslatePatterns = Array.from(this.noTranslatePatterns);
        if (!containsNum && noTranslatePatterns.length == 0) {
            return processedTranslation;
        }
        let toBeReplaced = [];
        noTranslatePatterns.forEach(pattern => {
            let regExp = new RegExp(pattern, "i");
            let matches = sourceMessage.match(regExp);
            if (matches != null) {
                toBeReplaced.push(pattern);
            }
        });
        let alignMap = this.wordAlignmentParse(alignment, sourceMessage, targetMessage);
        let srcWrds = sourceMessage.split(' ');
        if (toBeReplaced.length > 0) {
            toBeReplaced.forEach(pattern => {
                let regExp = new RegExp(pattern, "i");
                let captureGroup = pattern.match('\(.*\)')[0].replace('(', '').replace(')', '');
                let match = regExp.exec(sourceMessage);
                let noTranslateStarChrIndex = match.index + match[0].toLowerCase().indexOf(captureGroup.toLowerCase());
                let wrdIndx = 0;
                let chrIndx = 0;
                let srcIndx = -1;
                for (const wrd in srcWrds) {
                    if (srcWrds.hasOwnProperty(wrd)) {
                        const element = srcWrds[wrd];
                        if (chrIndx == noTranslateStarChrIndex) {
                            srcIndx = wrdIndx;
                            break;
                        }
                        chrIndx += element.length + 1;
                        wrdIndx++;
                    }
                }
                let wrdNoTranslate = match[1].split(' ');
                wrdNoTranslate.forEach(srcWrds => {
                    processedTranslation = this.keepSrcWrdInTranslation(alignMap, sourceMessage, processedTranslation, srcIndx);
                    srcIndx++;
                });
            });
        }
        if (numericMatches != null) {
            for (const numericMatch in numericMatches) {
                let srcIndx = srcWrds.findIndex(wrd => wrd == numericMatch);
                processedTranslation = this.keepSrcWrdInTranslation(alignMap, sourceMessage, processedTranslation, srcIndx);
            }
        }
        return processedTranslation;
    }
}
exports.PostProcessTranslator = PostProcessTranslator;
//# sourceMappingURL=languageTranslator.js.map