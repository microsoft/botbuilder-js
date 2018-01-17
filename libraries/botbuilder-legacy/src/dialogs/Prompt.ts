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
import { IDialogWaterfallStep, WaterfallDialog } from './WaterfallDialog';
import { DialogAction, IDialogHandler } from './DialogAction';
import { Dialog, IRecognizeDialogContext, IDialogResult, ResumeReason } from './Dialog';
import { IntentRecognizerSet, IIntentRecognizerSetOptions } from './IntentRecognizerSet';
import { IIntentRecognizer, IIntentRecognizerResult, IRecognizeContext } from './IntentRecognizer';
import { RegExpRecognizer } from './RegExpRecognizer';
import { Message, InputHint } from '../Message';
import * as consts from '../consts';
import * as async from 'async';
import * as utils from '../utils';

export enum PromptType { text, number, confirm, choice, time, attachment }

export enum ListStyle { none, inline, list, button, auto }

export interface IPromptOptions extends IMessageOptions {
    prompt?: TextOrMessageType;
    speak?: TextType;
    retryPrompt?: TextOrMessageType;
    retrySpeak?: TextType;
    maxRetries?: number;
    promptAfterAction?: boolean;
    listStyle?: ListStyle;
    refDate?: number;
    libraryNamespace?: string;

    /** deprecated */
    localizationNamespace?: string;
}

export interface IPromptContext {
    options: IPromptOptions;
    turns: number;
    lastTurn: number;
    isReprompt: boolean;
    activeIntent: string;
}

export type PromptHandler = (session: Session, next: Function) => void;
export type PromptFormatMessageHandler = (session: Session, text: TextType, speak: TextType, callback: (err: Error, message?: IMessage) => void) => void;
export type PromptRecognizeHandler = (context: IRecognizeDialogContext, callback: (err: Error, score: number, response?: any) => void) => void;

export interface IPromptFeatures {
    /** If true, then the prompt should not execute it's own recognition logic. The default is "false". */
    disableRecognizer?: boolean;

    /** The default retryPrompt to send should the caller not provide one. */
    defaultRetryPrompt?: TextOrMessageType;

    /** The library namespace to use for the `defaultRetryPrompt`. If not specified then the bots default namespace of "*" will be used. */
    defaultRetryNamespace?: string;
}

export class Prompt<T extends IPromptFeatures>  extends Dialog {
    private recognizers: IntentRecognizerSet = new IntentRecognizerSet();
    private handlers = <IIntentHandlerMap>{};
    private _onPrompt: PromptHandler[] = [];
    private _onFormatMessage: PromptFormatMessageHandler[] = [];
    private _onRecognize: PromptRecognizeHandler[] = [];

    constructor(public features?: T) {
        super();
        if (!this.features) {
            this.features = <T>{};
        }
    }

    /** Dialog has been navigated to. */
    public begin<T>(session: Session, options: IPromptOptions): void {
        let dc = <IPromptContext>session.dialogData;
        dc.options = options || <IPromptOptions>{};
        dc.turns = 0;
        dc.lastTurn = new Date().getTime();
        dc.isReprompt = false;
        if (!options.hasOwnProperty('promptAfterAction')) {
            options.promptAfterAction = true;
        }

        // Resolve prompts. We don't want to persist an IIsMessage to storage.
        function resolvePrompt(prompt: string|string[]|IMessage|IIsMessage): string|string[]|IMessage|IIsMessage {
            if (typeof prompt == 'object' && (<IIsMessage>prompt).toMessage) {
                return (<IIsMessage>prompt).toMessage();
            }
            return prompt;
        }
        options.prompt = resolvePrompt(options.prompt);
        options.retryPrompt = resolvePrompt(options.retryPrompt);

        // Determine library namespace to use
        if (!options.libraryNamespace) {
            if (options.localizationNamespace) {
                // Legacy name used
                options.libraryNamespace = options.localizationNamespace;
            } else {
                const stack = session.dialogStack()
                if (stack.length >= 2) {
                    // Use callers namespace
                    options.libraryNamespace = stack[stack.length - 2].id.split(':')[0];
                } else {
                    // Use default bot namespace
                    options.libraryNamespace = consts.Library.default;
                }
            }

        }

        // Resolve attachments. We don't want to persist an IIsAttachment to storage.
        let attachments = options.attachments || [];
        for (let i = 0; i < attachments.length; i++) {
            if ((<IIsAttachment>attachments[i]).toAttachment) {
                attachments[i] = (<IIsAttachment>attachments[i]).toAttachment();
            }
        }

        // Send prompt for turn 0.
        this.sendPrompt(session);
    }

    /** Dialog is active and being asked to recognize users utterance. */
    public recognize(context: IRecognizeDialogContext, cb: (err: Error, result: IIntentRecognizerResult) => void): void {
        let dc = <IPromptContext>context.dialogData;
        dc.turns++;
        dc.lastTurn = new Date().getTime();
        dc.isReprompt = false;
        dc.activeIntent = null;

        let recognizers = this.recognizers;
        function finalRecognize() {
            recognizers.recognize(context, (err, r) => {
                if (!err && r.score > result.score) {
                    result = r;
                }
                cb(err, result);
            });
        }

        let idx = 0;
        const handlers = this._onRecognize;
        let result: IIntentRecognizerResult = { score: 0.0, intent: null };
        function next() {
            try {
                if (idx < handlers.length) {
                    handlers[idx++](context, (err, score, response) => {
                        if (err) {
                            return cb(err, null);
                        }
                        let r: IIntentRecognizerResult = {
                            score: score,
                            intent: consts.Intents.Response,
                            entities: [{
                                type: consts.Entities.Response,
                                entity: response
                            }]
                        };
                        if (r.score > result.score) {
                            result = r;
                        }
                        if (result.score >= 1.0) {
                            cb(null, result);
                        } else {
                            next();
                        }
                    });
                } else {
                    finalRecognize();
                }
            } catch (e) {
                cb(e, null);
            }
        }
        next();
    }

    /** Dialog is active and has been selected to process the message. */
    public replyReceived(session: Session, recognizeResult?: IIntentRecognizerResult): void {
        if (recognizeResult && recognizeResult.score > 0.0) {
            this.invokeIntent(session, <IIntentRecognizerResult>recognizeResult);
        } else {
            this.sendPrompt(session);
        }
    }

    /** Dialog is being returned to from another dialog. */
    public dialogResumed(session: Session, result: IDialogResult<any>): void {
        let dc = <IPromptContext>session.dialogData;
        if (dc.activeIntent && this.handlers.hasOwnProperty(dc.activeIntent)) {
            try {
                this.handlers[dc.activeIntent](session, result);
            } catch (e) {
                session.error(e);
            }
        } else if (dc.options.promptAfterAction) {
            dc.isReprompt = (result.resumed === ResumeReason.reprompt);
            this.sendPrompt(session);
        }
    }

    public sendPrompt(session: Session): void {
        const _that = this;
        function defaultSend() {
            if (typeof options.maxRetries === 'number' && context.turns > options.maxRetries) {
                session.endDialogWithResult({ resumed: ResumeReason.notCompleted });
            } else {
                let prompt = !turnZero ? _that.getRetryPrompt(session) : options.prompt;
                if (Array.isArray(prompt) || typeof prompt === 'string') {
                    let speak = !turnZero ? options.retrySpeak : options.speak;
                    _that.formatMessage(session, prompt, speak, (err, msg) => {
                        if (!err) {
                            sendMsg(msg);
                        } else {
                            session.error(err);
                        }
                    });
                } else {
                    sendMsg(<IMessage>prompt);
                }
            }
        }

        function sendMsg(msg: IMessage) {
            // Apply additional fields
            if (turnZero) {
                if (options.attachments) {
                    if (!msg.attachments) {
                        msg.attachments = [];
                    }
                    options.attachments.forEach((value) => {
                        if ((<IIsAttachment>value).toAttachment) {
                            msg.attachments.push((<IIsAttachment>value).toAttachment());
                        } else {
                            msg.attachments.push(<IAttachment>value);
                        }
                    });
                }
                ['attachmentLayout', 'entities', 'textFormat', 'inputHint'].forEach((key) => {
                    if (!msg.hasOwnProperty(key)) {
                        (<any>msg)[key] = (<any>options)[key];
                    }
                });
            }

            // Ensure input hint set
            if (!msg.inputHint) {
                msg.inputHint = InputHint.expectingInput;
            }
            session.send(msg);
        }

        let idx = 0;
        const handlers = this._onPrompt;
        const context = <IPromptContext>session.dialogData;
        const options = context.options;
        const turnZero = context.turns === 0 || context.isReprompt; 
        function next() {
            try {
                if (idx < handlers.length) {
                    handlers[idx++](session, next);
                } else {
                    defaultSend();
                }
            } catch (e) {
                session.error(e);
            }
        }
        next();
    }

    public formatMessage(session: Session, text: TextType, speak: TextType, callback: (err: Error, msg: IMessage) => void): void {
        let idx = 0;
        const handlers = this._onFormatMessage;
        function next(err: Error, msg: IMessage) {
            if (err || msg) {
                callback(err, msg);
            } else {
                try {
                    if (idx < handlers.length) {
                        handlers[idx++](session, text, speak, next);
                    } else {
                        msg = <IMessage>{ text: Prompt.gettext(session, text) };
                        if (speak) {
                            msg.speak = Prompt.gettext(session, speak);
                        }
                        callback(null, msg);
                    }
                } catch (e) {
                    callback(e, null);
                }
            }
        }
        next(null, null);
    }

    public onPrompt(handler: PromptHandler): this {
        this._onPrompt.unshift(handler);
        return this;
    }

    public onFormatMessage(handler: PromptFormatMessageHandler): this {
        this._onFormatMessage.unshift(handler);
        return this;
    }

    public onRecognize(handler: PromptRecognizeHandler): this {
        this._onRecognize.unshift(handler);
        return this;
    }

    public matches(intent: string|RegExp, dialogId: string|IDialogWaterfallStep[]|IDialogWaterfallStep, dialogArgs?: any): this {
        // Find ID and verify unique
        let id: string;
        if (intent) {
            if (typeof intent === 'string') {
                id = intent;
            } else {
                id = (<RegExp>intent).toString();
                this.recognizers.recognizer(new RegExpRecognizer(id, <RegExp>intent));
            }
        }

        // Register handler
        if (Array.isArray(dialogId)) {
            this.handlers[id] = WaterfallDialog.createHandler(dialogId);
        } else if (typeof dialogId === 'string') {
            this.handlers[id] = DialogAction.beginDialog(<string>dialogId, dialogArgs);
        } else {
            this.handlers[id] = WaterfallDialog.createHandler([<IDialogWaterfallStep>dialogId]);
        }
        return this;
    }

    public matchesAny(intents: string[]|RegExp[], dialogId: string|IDialogWaterfallStep[]|IDialogWaterfallStep, dialogArgs?: any): this {
        for (let i = 0; i < intents.length; i++) {
            this.matches(intents[i], dialogId, dialogArgs);
        }
        return this;
    }

    public recognizer(plugin: IIntentRecognizer): this {
        // Append recognizer
        this.recognizers.recognizer(plugin);
        return this;
    }

    protected updateFeatures(features: T): this {
        if (features) {
            for (let key in features) {
                if (features.hasOwnProperty(key)) {
                    this.features[key] = features[key];
                }
            }
        }
        return this;
    }

    static gettext(session: Session, text: string|string[], namespace?: string): string {
        let locale = session.preferredLocale();
        let options = <IPromptOptions>session.dialogData.options;
        if (!namespace && options && options.libraryNamespace) {
            namespace = options.libraryNamespace;
        }
        return session.localizer.gettext(locale, Message.randomPrompt(text), namespace);
    }

    private invokeIntent(session: Session, recognizeResult: IIntentRecognizerResult): void {
        if (recognizeResult.intent === consts.Intents.Response) {
            // Return response to caller
            let response = recognizeResult.entities && recognizeResult.entities.length == 1 ? recognizeResult.entities[0].entity : null;
            session.logger.log(session.dialogStack(), 'Prompt.returning(' + response + ')');
            session.endDialogWithResult({ resumed: ResumeReason.completed, response: response });
        } else if (this.handlers.hasOwnProperty(recognizeResult.intent)) {
            try {
                session.logger.log(session.dialogStack(), 'Prompt.matches(' + recognizeResult.intent + ')');
                let dc = <IPromptContext>session.dialogData;
                dc.activeIntent = recognizeResult.intent;
                this.handlers[dc.activeIntent](session, recognizeResult);
            } catch (e) {
                session.error(e);
            }
        } else {
            session.logger.warn(session.dialogStack(), 'Prompt - no intent handler found for ' + recognizeResult.intent);
            this.sendPrompt(session);
        }
    }

    private getRetryPrompt(session: Session): string|string[]|IMessage|IIsMessage {
        let options = <IPromptOptions>session.dialogData.options;
        if (options.retryPrompt) {
            return options.retryPrompt;
        } else if (this.features.defaultRetryPrompt) {
            let prompt = this.features.defaultRetryPrompt;
            if (Array.isArray(prompt) || typeof prompt === 'string') {
                // Return localized prompt
                let locale = session.preferredLocale();
                return session.localizer.gettext(locale, Message.randomPrompt(prompt), this.features.defaultRetryNamespace || consts.Library.default);
            } else {
                return prompt;
            }
        } else {
            return options.prompt;
        }
    }
}

interface IIntentHandlerMap {
    [id: string]: IDialogHandler<any>;
}

var prompt = new Prompt({});
