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
    onProcessRequest(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.request.type == "message" && context.request.text) {
                if (this.setUserLanguage != undefined) {
                    let changedLanguage = yield this.setUserLanguage(context);
                    if (changedLanguage) {
                        return next();
                    }
                }
                // determine the language we are using for this conversation
                let sourceLanguage;
                if (this.getUserLanguage != undefined) {
                    sourceLanguage = this.getUserLanguage(context);
                }
                else if (context.request.locale != undefined) {
                    sourceLanguage = context.request.locale;
                }
                else {
                    sourceLanguage = yield this.translator.detect(context.request.text);
                }
                let targetLanguage = (this.nativeLanguages.indexOf(sourceLanguage) >= 0) ? sourceLanguage : this.nativeLanguages[0];
                // translate to bots language
                if (sourceLanguage != targetLanguage) {
                    yield this.TranslateMessageAsync(context, sourceLanguage, targetLanguage);
                }
            }
            return next();
        });
    }
    /// Translate .Text field of a message, regardless of direction
    TranslateMessageAsync(context, sourceLanguage, targetLanguage) {
        // if we have text and a target language
        let message = context.request;
        if (message.text && message.text.length > 0 && targetLanguage != sourceLanguage) {
            // truncate big text
            let text = message.text.length <= 65536 ? message.text : message.text.substring(0, 65536);
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
                message.text = text;
                return Promise.resolve();
            })
                .catch(error => Promise.reject(error));
        }
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
            .then(result => result)
            .catch(error => Promise.reject(error));
    }
    escapeHtml(source) {
        return String(source).replace(/[&<>"'\/]/g, s => this.entityMap[s]);
    }
    detect(text) {
        let uri = "http://api.microsofttranslator.com/v2/Http.svc/Detect";
        let query = `?text=${encodeURI(text)}`;
        return new Promise((resolve, reject) => {
            this.getAccessToken()
                .then(accessToken => {
                return request({
                    url: uri + query,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                });
            })
                .then(lang => resolve(lang.replace(/<[^>]*>/g, '')))
                .catch(error => reject(error));
        });
    }
    translateArray(options, callback) {
        return;
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
        return new Promise((resolve, reject) => {
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
                    let result = { TranslatedText: translation };
                    results.push(result);
                });
                resolve(results);
            })
                .catch(error => Promise.reject(error));
        });
    }
}
class PostProcessTranslator {
    constructor(noTranslatePatterns) {
        this.noTranslatePatterns = noTranslatePatterns;
    }
    wordAlignmentParse(alignment, source, target) {
        let alignMap = {};
        if (alignment.trim() == "")
            return alignMap;
        let alignments = alignment.trim().split(' ');
        alignments.forEach(alignData => {
            let wordIndexes = alignData.split('-');
            let trgstartIndex = parseInt(wordIndexes[1].split(':')[0]);
            let trgLength = parseInt(wordIndexes[1].split(':')[1]) - trgstartIndex + 1;
            alignMap[wordIndexes[0]] = trgstartIndex + ":" + trgLength;
        });
        return alignMap;
    }
    keepSrcWrdInTranslation(alignment, source, target, srcWrd) {
        let processedTranslation = target;
        let wrdStartIndex = source.indexOf(srcWrd);
        let wrdEndIndex = wrdStartIndex + srcWrd.length - 1;
        let wrdIndexesString = wrdStartIndex + ":" + wrdEndIndex;
        if (!(typeof alignment[wrdIndexesString] === "undefined")) {
            let trgWrdLocation = alignment[wrdIndexesString].split(':');
            let targetWrd = target.substr(parseInt(trgWrdLocation[0]), parseInt(trgWrdLocation[1]));
            if (targetWrd.trim().length == parseInt(trgWrdLocation[1]) && targetWrd != srcWrd)
                processedTranslation = processedTranslation.replace(targetWrd, srcWrd);
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
        if (toBeReplaced.length > 0) {
            toBeReplaced.forEach(pattern => {
                let regExp = new RegExp(pattern, "i");
                let match = regExp.exec(sourceMessage);
                if (match != null && match[1] != undefined) {
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
exports.PostProcessTranslator = PostProcessTranslator;
//# sourceMappingURL=languageTranslator.js.map