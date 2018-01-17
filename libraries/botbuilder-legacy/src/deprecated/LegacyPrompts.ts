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
import { systemLib } from '../bots/Library';
import { Dialog, ResumeReason, IDialogResult, IRecognizeDialogContext } from '../dialogs/Dialog'
import { PromptType, IPromptOptions, ListStyle } from '../dialogs/Prompt';
import { EntityRecognizer } from '../dialogs/EntityRecognizer';
import { IRecognizeResult } from '../dialogs/IntentRecognizer';
import { CardAction } from '../cards/CardAction';
import { Keyboard } from '../cards/Keyboard';
import { Message } from '../Message';
import * as consts from '../consts';
import * as Channel from '../Channel';

export interface IPromptResult<T> extends IDialogResult<T> {
    score: number;
    promptType?: PromptType;
}

export interface IPromptsOptions {
    recognizer?: IPromptRecognizer;
    promptAfterAction?: boolean;
}

export interface IPromptRecognizer {
    recognize<T>(args: IPromptRecognizerArgs, callback: (result: IPromptResult<any>) => void, session?: Session): void;
}

export interface IPromptRecognizerArgs {
    promptType: PromptType;
    locale: string;
    utterance: string;
    attachments: IAttachment[];
    enumValues?: string[];
    refDate?: number;
}

export interface IPromptArgs extends IPromptOptions {
    retryCnt?: number;
    enumValues?: string[];
    promptType?: PromptType;
}

export class SimplePromptRecognizer implements IPromptRecognizer {
    public recognize(args: IPromptRecognizerArgs, callback: (result: IPromptResult<any>) => void, session?: Session): void {
        function findChoice(args: IPromptRecognizerArgs, text: string) {
            var best = EntityRecognizer.findBestMatch(args.enumValues, text);
            if (!best) {
                var n = EntityRecognizer.parseNumber(text);
                if (!isNaN(n) && n > 0 && n <= args.enumValues.length) {
                    best = { index: n - 1, entity: args.enumValues[n - 1], score: 1.0 };
                }
            }
            return best;
        }

        // Recognize value
        var score = 0.0;
        var response: any;
        var text = args.utterance.trim();
        switch (args.promptType) {
            default:
            case PromptType.text:
                // This is an open ended question so it's a little tricky to know what to pass as a confidence
                // score. Currently we're saying that we have 0.1 confidence that we understand the users intent
                // which will give all of the prompts parents a chance to capture the utterance. If no one 
                // captures the utterance we'll return the full text of the utterance as the result.
                score = 0.5;
                response = text;
                break;
            case PromptType.number:
                var n = EntityRecognizer.parseNumber(text);
                if (!isNaN(n)) {
                    var score = n.toString().length / text.length;
                    response = n;
                }
                break;
            case PromptType.confirm:
                var b = EntityRecognizer.parseBoolean(text);
                if (typeof b !== 'boolean') {
                    var best = findChoice(args, text);
                    if (best) {
                        b = (best.index === 0); // enumValues == ['yes', 'no']
                    }
                }
                if (typeof b == 'boolean') {
                    score = 1.0;
                    response = b;
                }
                break;
            case PromptType.time:
                var entity = EntityRecognizer.recognizeTime(text, args.refDate ? new Date(args.refDate) : null);
                if (entity) {
                    score = entity.entity.length / text.length;
                    response = entity;
                } 
                break;
            case PromptType.choice:
                var best = findChoice(args, text);
                if (best) {
                    score = best.score;
                    response = best;
                }
                break;
            case PromptType.attachment:
                if (args.attachments && args.attachments.length > 0) {
                    score = 1.0;
                    response = args.attachments;
                }
                break;
        }

        // Return results
        if (score > 0) {
            callback({ score: score, resumed: ResumeReason.completed, promptType: args.promptType, response: response });
        } else {
            callback({ score: score, resumed: ResumeReason.notCompleted, promptType: args.promptType });
        }
    }
} 

export class LegacyPrompts extends Dialog {
    private static options: IPromptsOptions = {
        recognizer: new SimplePromptRecognizer(),
        promptAfterAction: true
    };
    
    private static defaultRetryPrompt = {
        text: "default_text",
        number: "default_number",
        confirm: "default_confirm",
        choice: "default_choice", 
        time: "default_time", 
        attachment: "default_file"  
    };

    public begin(session: Session, args: IPromptArgs): void {
        args = <any>args || {};
        args.promptAfterAction = args.hasOwnProperty('promptAfterAction') ? args.promptAfterAction : LegacyPrompts.options.promptAfterAction;
        args.retryCnt = 0;
        for (var key in args) {
            if (args.hasOwnProperty(key)) {
                session.dialogData[key] = (<any>args)[key];
            }
        }
        this.sendPrompt(session, args);
    }

    public replyReceived(session: Session, result?: IPromptResult<any>): void {
        var args: IPromptArgs = session.dialogData;
        if (result.error || result.resumed == ResumeReason.completed) {
            result.promptType = args.promptType;
            session.endDialogWithResult(result);
        } else if (typeof args.maxRetries === 'number' && args.retryCnt >= args.maxRetries) {
            result.promptType = args.promptType;
            result.resumed = ResumeReason.notCompleted;
            session.endDialogWithResult(result);
        } else {
            args.retryCnt++;
            this.sendPrompt(session, args, true);
        }
    }
    public dialogResumed<T>(session: Session, result: IDialogResult<any>): void {
        // Comming back from an action so re-prompt the user.
        var args: IPromptArgs = session.dialogData;
        if (args.promptAfterAction) {
            this.sendPrompt(session, args);
        }
    }

    public recognize(context: IRecognizeDialogContext, cb: (err: Error, result: IRecognizeResult) => void): void {
        var args: IPromptArgs = context.dialogData;
        LegacyPrompts.options.recognizer.recognize({
            promptType: args.promptType,
            utterance: context.message.text,
            locale: context.message.textLocale,
            attachments: context.message.attachments,
            enumValues: args.enumValues,
            refDate: args.refDate
        }, (result) => {
            if (result.error) {
                cb(result.error, null);
            } else {
                cb(null, result);
            }
        });
    }

    private sendPrompt(session: Session, args: IPromptArgs, retry = false): void {
        // Find message to deliver
        var msg: IMessage|IIsMessage;
        if (retry && typeof args.retryPrompt === 'object' && !Array.isArray(args.retryPrompt)) {
            msg = args.retryPrompt;
        } else if (typeof args.prompt === 'object' && !Array.isArray(args.prompt)) {
            msg = args.prompt;
        } else {
            msg = this.createPrompt(session, args, retry);
        }

        // Send message
        session.send(msg);

        // Commit batch
        session.sendBatch();
    }

    private createPrompt(session: Session, args: IPromptArgs, retry: boolean): IMessage|IIsMessage {
        var msg = new Message(session);
        var locale = session.preferredLocale();
        var localizationNamespace = args.localizationNamespace;

        // Calculate list style.
        var style = ListStyle.none;
        if (args.promptType == PromptType.choice || args.promptType == PromptType.confirm) {
            style = args.listStyle;
            if (style == ListStyle.auto) {
                if (Channel.supportsKeyboards(session, args.enumValues.length)) {
                    style = ListStyle.button;
                } else if (!retry && args.promptType == PromptType.choice) {
                    style = args.enumValues.length < 3 ? ListStyle.inline : ListStyle.list;
                } else {
                    style = ListStyle.none;
                }
            }
        }
        
        // Get localized text of the prompt
        var prompt: string;
        if (retry) {
            if (args.retryPrompt) {
                prompt = Message.randomPrompt(<any>args.retryPrompt);
            } else {
                // Use default system retry prompt
                var type = PromptType[args.promptType];
                prompt = (<any>LegacyPrompts.defaultRetryPrompt)[type];
                localizationNamespace = consts.Library.system;
            }
        } else {
            prompt = Message.randomPrompt(<any>args.prompt);
        }
        var text = session.localizer.gettext(locale, prompt, localizationNamespace);
                    
        // Populate message
        var connector = '';
        var list: string;
        switch (style) {
            case ListStyle.button:
                var buttons: CardAction[] = [];
                for (var i = 0; i < session.dialogData.enumValues.length; i++) {
                    var option = session.dialogData.enumValues[i];
                    buttons.push(CardAction.imBack(session, option, option));
                }
                msg.text(text)
                    .attachments([new Keyboard(session).buttons(buttons)]);
                break;
            case ListStyle.inline:
                list = ' (';
                args.enumValues.forEach((v, index) => {
                    var value = v.toString();
                    list += connector + (index + 1) + '. ' + session.localizer.gettext(locale, value, consts.Library.system);
                    if (index == args.enumValues.length - 2) {
                        connector = index == 0 ? session.localizer.gettext(locale, "list_or", consts.Library.system) : session.localizer.gettext(locale, "list_or_more", consts.Library.system);
                    } else {
                        connector = ', ';
                    } 
                });
                list += ')';
                msg.text(text + '%s', list);
                break;
            case ListStyle.list:
                list = '\n   ';
                args.enumValues.forEach((v, index) => {
                    var value = v.toString();
                    list += connector + (index + 1) + '. ' + session.localizer.gettext(locale, value, args.localizationNamespace);
                    connector = '\n   ';
                });
                msg.text(text + '%s', list);
                break;
            default:
                msg.text(text);
                break;
        }
        return msg;
    }

    static configure(options: IPromptsOptions): void {
        if (options) {
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    (<any>LegacyPrompts.options)[key] = (<any>options)[key];
                }
            }
        }
    }
}
systemLib.dialog('BotBuilder:Prompts', new LegacyPrompts());
