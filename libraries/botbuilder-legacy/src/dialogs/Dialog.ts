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
import { IRecognizeContext, IRecognizeResult, IIntentRecognizerResult } from './IntentRecognizer';
import { ActionSet } from './ActionSet';

export enum ResumeReason { completed, notCompleted, canceled, back, forward, reprompt }

export interface IDialogResult<T> {
    resumed: ResumeReason;
    childId?: string;
    error?: Error;
    response?: T;
}

export interface IRecognizeDialogContext extends IRecognizeContext {
    activeDialog: boolean;
    intent?: IIntentRecognizerResult;
}

export abstract class Dialog extends ActionSet {
    public begin<T>(session: Session, args?: T): void {
        this.replyReceived(session);
    }

    abstract replyReceived(session: Session, recognizeResult?: IRecognizeResult): void;

    public dialogResumed<T>(session: Session, result: IDialogResult<T>): void {
        if (result.error) {
            session.error(result.error);
        } 
    }

    public recognize(context: IRecognizeDialogContext, cb: (err: Error, result: IRecognizeResult) => void): void {
        cb(null, { score: 0.1 });
    }
}
