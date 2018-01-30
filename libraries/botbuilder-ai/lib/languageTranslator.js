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
const LanguageMap = require("./languageMap");
const LuisClient = require("botframework-luis");
let MsTranslator = require('mstranslator');
/**
 * The LanguageTranslator will use the Text Translator Cognitive service to translate text from a source language
 * to one of the native languages that the bot speaks.  By adding it to the middleware pipeline you will automatically
 * get a translated experience, and also a LUIS model allowing the user to ask to speak a language.
 */
class LanguageTranslator {
    constructor(translatorKey, nativeLanguages, luisAppId, luisAccessKey) {
        this.nativeLanguages = nativeLanguages;
        this.luisAppId = luisAppId;
        this.luisAccessKey = luisAccessKey;
        this.luisClient = new LuisClient();
        this.translator = new MsTranslator({ api_key: translatorKey }, true);
        this.translator.translateArrayAsync = denodeify(this.translator, this.translator.translateArray);
    }
    /// Incoming activity
    receiveActivity(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.request.type == "message" && context.request.text) {
                // determine the language we are using for this conversation
                let sourceLanguage = this.nativeLanguages[0];
                if (context.state && context.state.conversation && context.state.conversation.language) {
                    sourceLanguage = context.state.conversation.language;
                }
                // create translationcontext
                let translationContext = {};
                translationContext.sourceLanguage = sourceLanguage;
                translationContext.targetLanguage = (this.nativeLanguages.indexOf(sourceLanguage) >= 0) ? sourceLanguage : this.nativeLanguages[0];
                context.translation = translationContext;
                // translate to bots language
                if (translationContext.sourceLanguage != translationContext.targetLanguage) {
                    translationContext.sourceText = context.request.text;
                    yield this.TranslateMessageAsync(context, context.request, translationContext.sourceLanguage, translationContext.targetLanguage);
                }
                if (this.luisAppId && this.luisAccessKey) {
                    // look to see if this is a request to speak a different language
                    let lowertext = context.request.text.toLowerCase();
                    for (let iName in LanguageMap.Names) {
                        let name = LanguageMap.Names[iName];
                        if (lowertext.indexOf(name) >= 0) {
                            // it has a language name in it, it may be a request to speak another language
                            let commandText = context.request.text;
                            // translate commandtext if not in en already (our model is in english)
                            if (sourceLanguage != 'en') {
                                let translationResult = yield this.translator.translateArrayAsync({
                                    from: sourceLanguage,
                                    to: 'en',
                                    texts: [commandText]
                                });
                                commandText = translationResult[0].TranslatedText;
                            }
                            // look at intent of commandText
                            var intents = yield this.luisClient.getIntentsAndEntitiesV2(this.luisAppId, this.luisAccessKey, commandText);
                            if (intents.topScoringIntent && intents.topScoringIntent.intent == 'BotTranslator.ChangeLanguage' && intents.entities.length > 0) {
                                let languageFragment = intents.entities[0].entity || '';
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
        });
    }
    /// outgoing activities
    postActivity(context, activities, next) {
        let promises = [];
        for (let iActivity in activities) {
            let activity = activities[iActivity];
            if (activity.type === 'message') {
                let message = activity;
                if (message.text && message.text.length > 0) {
                    // use translationContext to reverse translate the response
                    let translationContext = context.translation;
                    if (translationContext.sourceLanguage != translationContext.targetLanguage)
                        promises.push(this.TranslateMessageAsync(context, message, translationContext.targetLanguage, translationContext.sourceLanguage));
                }
            }
        }
        return Promise.all(promises)
            .then(result => next());
    }
    /// Translate .Text field of a message, regardless of direction
    TranslateMessageAsync(context, message, sourceLanguage, targetLanguage) {
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
                        let mention = entity;
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
                            let mention = entity;
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
exports.LanguageTranslator = LanguageTranslator;
// turn a cb based azure method into a Promisified one
function denodeify(thisArg, fn) {
    return (...args) => {
        return new Promise((resolve, reject) => {
            args.push((error, result) => (error) ? reject(error) : resolve(result));
            fn.apply(thisArg, args);
        });
    };
}
//# sourceMappingURL=languageTranslator.js.map