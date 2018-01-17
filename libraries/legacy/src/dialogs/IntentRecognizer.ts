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

import { SessionLogger } from '../SessionLogger';

export interface IIntentRecognizer {
    recognize(context: IRecognizeContext, done: (err: Error, result: IIntentRecognizerResult) => void): void;
}

export interface IRecognizeContext {
    message: IMessage;
    userData: any;
    conversationData: any;
    privateConversationData: any;
    dialogData: any;
    localizer: ILocalizer;
    logger: SessionLogger;
    preferredLocale(): string;
    gettext(messageid: string, ...args: any[]): string;
    ngettext(messageid: string, messageid_plural: string, count: number): string;
    dialogStack(): IDialogState[];
    intent?: IIntentRecognizerResult;
    libraryName?: string;

    /** deprecated */
    locale: string;     
}

export interface IRecognizeResult {
    score: number;
}

export interface IIntentRecognizerResult extends IRecognizeResult {
    intent: string;
    expression?: RegExp;
    matched?: string[]; 
    intents?: IIntent[];
    entities?: IEntity<any>[];
    compositeEntities?: ICompositeEntity<any>[];
}

export type RecognizerEnabledHandler = (context: IRecognizeContext, callback: (err: Error, enabled: boolean) => void) => void;
export type RecognizerFilterHandler = (context: IRecognizeContext, result: IIntentRecognizerResult, callback: (err: Error, result: IIntentRecognizerResult) => void) => void;

export abstract class IntentRecognizer implements IIntentRecognizer {
    private _onEnabled: RecognizerEnabledHandler[] = [];
    private _onFilter: RecognizerFilterHandler[] = [];

    abstract onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;

    public recognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void {
        this.isEnabled(context, (err, enabled) => {
            if (err) {
                callback(err, null);
            } else if (!enabled) {
                callback(null, { score: 0.0, intent: null });
            } else {
                this.onRecognize(context, (err, result) => {
                    if (!err) {
                        this.filter(context, result, callback);
                    } else {
                        callback(err, result);
                    }
                });
            }
        });
    }

    public onEnabled(handler: RecognizerEnabledHandler): this {
        this._onEnabled.unshift(handler);
        return this;
    }

    public onFilter(handler: RecognizerFilterHandler): this {
        this._onFilter.push(handler);
        return this;
    }

    private isEnabled(context: IRecognizeContext, callback: (err: Error, enabled: boolean) => void): void {
        let index = 0;
        let _that = this;
        function next(err: Error, enabled: boolean) {
            if (index < _that._onEnabled.length && !err && enabled) {
                try {
                    _that._onEnabled[index++](context, next);
                } catch (e) {
                    callback(e, false);
                }
            } else {
                callback(err, enabled);
            }
        }
        next(null, true);
    }

    private filter(context: IRecognizeContext, result: IIntentRecognizerResult, callback: (err: Error, result: IIntentRecognizerResult) => void): void {
        let index = 0;
        let _that = this;
        function next(err: Error, r: IIntentRecognizerResult) {
            if (index < _that._onFilter.length && !err) {
                try {
                    _that._onFilter[index++](context, r, next);
                } catch (e) {
                    callback(e, null);
                }
            } else {
                callback(err, r);
            }
        }
        next(null, result);
    }
}

