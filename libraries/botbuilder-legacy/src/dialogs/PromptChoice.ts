// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Bot Framework: http://botframework.com
// 
// Bot Builder SDK Github:
// https://github.com/Microsoft/BotBuilder
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { Session } from '../Session';
import { Prompt, IPromptContext, IPromptOptions, IPromptFeatures, ListStyle } from './Prompt';
import { IRecognizeContext } from './IntentRecognizer';
import { PromptRecognizers, StringOrRegExp, IChoice } from './PromptRecognizers';
import { IFindMatchResult } from './EntityRecognizer';
import { Message } from '../Message';
import { Keyboard } from '../cards/Keyboard';
import * as consts from '../consts';
import * as Channel from '../Channel';

export interface IPromptChoiceFeatures extends IPromptFeatures {
    /** (Optional) if true, the prompt will attempt to recognize numbers in the users utterance as the index of the choice to return. The default value is "true". */
    recognizeNumbers?: boolean;

    /** (Optional) if true, the prompt will attempt to recognize ordinals like "the first one" or "the second one" as the index of the choice to return. The default value is "true". */
    recognizeOrdinals?: boolean;

    /** (Optional) if true, the prompt will attempt to recognize the selected value using the choices themselves. The default value is "true". */
    recognizeChoices?: boolean;

    /** (Optional) style to use as the default when the caller specifies ListStyle.auto and it's determined that keyboards aren't supported. The default value is "ListStyle.list". */
    defaultListStyle?: ListStyle;

    /** (Optional) number of items to show in an inline list when a `defaultListStyle` of ListStyle.list is being applied. The default value is "3". Set this value to "0" to disable inline mode. */
    inlineListCount?: number;

    /** (Optional) minimum score from 0.0 - 1.0 needed for a recognized choice to be considered a match. The default value is "0.4". */
    minScore?: number;
}

export interface IPromptChoiceOptions extends IPromptOptions {
    /** (Optional) List of choices to present to the user. If ommited a `PromptChoice.onChoices()` handler should be provided. */
    choices?: IChoice[];
}

export interface IOnChoicesHandler {
    (context: IRecognizeContext, callback: (err: Error, choices?: IChoice[]) => void, recognizePhase?: boolean): void;
}

export class PromptChoice extends Prompt<IPromptChoiceFeatures> {
    private _onChoices: IOnChoicesHandler[] = [];

    constructor(features?: IPromptChoiceFeatures) {
        super({
            defaultRetryPrompt: 'default_choice',
            defaultRetryNamespace: consts.Library.system,
            recognizeNumbers: true,
            recognizeOrdinals: true,
            recognizeChoices: true,
            defaultListStyle: ListStyle.list,
            inlineListCount: 3,
            minScore: 0.4
        });
        this.updateFeatures(features);

        // Default recognizer logic
        this.onRecognize((context, cb) => {
            if (context.message.text && !this.features.disableRecognizer) {
                this.findChoices(context, true, (err, choices) => {
                    if (err || !choices || !choices.length) {
                        return cb(err, 0.0);
                    }

                    let topScore = 0.0;
                    let topMatch: IFindMatchResult = null;
                    let utterance = context.message.text.trim();

                    // Recognize using choices
                    if (this.features.recognizeChoices) {
                        let options = { allowPartialMatches: true };
                        let match = PromptRecognizers.findTopEntity(PromptRecognizers.recognizeChoices(utterance, choices, options));
                        if (match) {
                            topScore = match.score;
                            topMatch = match.entity
                        }
                    }

                    // Recognize index by number
                    if (this.features.recognizeNumbers) {
                        let options = { minValue: 1, maxValue: choices.length, integerOnly: true };
                        let match = PromptRecognizers.findTopEntity(PromptRecognizers.recognizeNumbers(context, options));
                        if (match && match.score > topScore) {
                            let index = Math.floor(match.entity - 1);
                            topScore = match.score;
                            topMatch = {
                                score: match.score,
                                index: index,
                                entity: choices[index].value
                            };
                        }
                    }

                    // Recognize index by ordinal
                    if (this.features.recognizeOrdinals) {
                        let match = PromptRecognizers.findTopEntity(PromptRecognizers.recognizeOrdinals(context));
                        if (match && match.score > topScore) {
                            let index = match.entity > 0 ? match.entity - 1 : choices.length + match.entity;
                            if (index >= 0 && index < choices.length) {
                                topScore = match.score;
                                topMatch = {
                                    score: match.score,
                                    index: index,
                                    entity: choices[index].value
                                };
                            } 
                        }
                    }

                    // Return result 
                    if (topScore >= this.features.minScore && topScore > 0) {
                        cb(null, topScore, topMatch);
                    } else {
                        cb(null, 0.0);
                    }
                });
            } else {
                cb(null, 0.0);
            }
        });

        // Default message formatter
        this.onFormatMessage((session, text, speak, callback) => {
            let context = (<IPromptContext>session.dialogData);
            let options = (<IPromptChoiceOptions>context.options);
            this.findChoices(session.toRecognizeContext(), false, (err, choices) => {
                let msg: IMessage;
                if (!err && choices) {
                    // Resolve list style
                    let sendChoices = context.turns === 0 || context.isReprompt;
                    let listStyle = options.listStyle;
                    if (listStyle === undefined || listStyle === null || listStyle === ListStyle.auto) {
                        // Find maximum title length
                        let maxTitleLength = 0;
                        choices.forEach((choice) => {
                            let l = choice.action && choice.action.title ? choice.action.title.length : choice.value.length;
                            if (l > maxTitleLength) {
                                maxTitleLength = l;
                            }
                        });

                        // Determine list style
                        let supportsKeyboards = Channel.supportsKeyboards(session, choices.length);
                        let supportsCardActions = Channel.supportsCardActions(session, choices.length);
                        let maxActionTitleLength = Channel.maxActionTitleLength(session);
                        let hasMessageFeed = Channel.hasMessageFeed(session);
                        if (maxTitleLength <= maxActionTitleLength && 
                            (supportsKeyboards || (!hasMessageFeed && supportsCardActions))) {
                            listStyle = ListStyle.button;
                            sendChoices = true;
                        } else {
                            listStyle = this.features.defaultListStyle;
                            let inlineListCount = this.features.inlineListCount;
                            if (listStyle === ListStyle.list && inlineListCount > 0 && choices.length <= inlineListCount) {
                                listStyle = ListStyle.inline;
                            } 
                        }
                    }

                    // Format message
                    msg = PromptChoice.formatMessage(session, listStyle, text, speak, sendChoices ? choices : null);
                }
                callback(err, msg);
            });
        });
        
        // Add repeat intent handler
        this.matches(consts.Intents.Repeat, (session) => {
            // Set to turn-0 and re-prompt.
            (<IPromptContext>session.dialogData).turns = 0;
            this.sendPrompt(session);
        });
    }

    public findChoices(context: IRecognizeContext, recognizePhrase: boolean, callback: (err: Error, choices: IChoice[]) => void): void {
        let idx = 0;
        const handlers = this._onChoices;
        function next(err: Error, choices?: IChoice[]) {
            if (err || choices) {
                callback(err, choices);
            } else {
                try {
                    if (idx < handlers.length) {
                        handlers[idx++](context, next, recognizePhrase);
                    } else {
                        choices = (<IPromptChoiceOptions>context.dialogData.options).choices || [];
                        callback(null, choices);
                    }
                } catch (e) {
                    callback(e, null);
                }
            }
        }
        next(null, null);
    }

    public onChoices(handler: IOnChoicesHandler): this {
        this._onChoices.unshift(handler);
        return this;
    }

    /** Returns a message containing a list of choices. */
    static formatMessage(session: Session, listStyle: ListStyle, text: string|string[], speak?: string|string[], choices?: IChoice[]): IMessage {
        // Build message
        let options = <IPromptChoiceOptions>session.dialogData.options;
        let locale = session.preferredLocale();
        let namespace = options ? options.libraryNamespace : null;
        choices = choices ? choices : options.choices;
        let msg = new Message(session);
        if (speak) {
            msg.speak(session.localizer.gettext(locale, Message.randomPrompt(speak), namespace));
        }
        let txt = session.localizer.gettext(locale, Message.randomPrompt(text), namespace);
        if (choices && choices.length > 0) {
            // Find list items
            let values: string[] = [];
            let actions: ICardAction[] = [];
            choices.forEach((choice) => {
                if (listStyle == ListStyle.button) {
                    const ca = choice.action || <ICardAction>{};
                    let action: ICardAction = {
                        type: ca.type || 'imBack',
                        title: ca.title || choice.value,
                        value: ca.value || choice.value
                    };
                    if (ca.image) {
                        action.image = ca.image;
                    }
                    actions.push(action);
                } else if (choice.action && choice.action.title) {
                    values.push(choice.action.title);
                } else {
                    values.push(choice.value);
                }
            });

            // Add list to message
            let connector = '';
            switch (listStyle) {
                case ListStyle.button:
                    if (actions.length > 0) {
                        let keyboard = new Keyboard().buttons(actions);
                        msg.addAttachment(keyboard);
                    }
                    break;
                case ListStyle.inline:
                    txt += ' (';
                    values.forEach((v, index) => {
                        txt += connector + (index + 1) + '. ' + v;
                        if (index == (values.length - 2)) {
                            let cid =  index == 0 ? 'list_or' : 'list_or_more';
                            connector = Prompt.gettext(session, cid, consts.Library.system);
                        } else {
                            connector = ', ';
                        }
                    });
                    txt += ')';
                    break;
                case ListStyle.list:
                    txt += '\n\n   ';
                    values.forEach((v, index) => {
                        txt += connector + (index + 1) + '. ' + v;
                        connector = '\n   ';
                    });
                    break;
            }
        }
        return msg.text(txt).toMessage();
    }
}
