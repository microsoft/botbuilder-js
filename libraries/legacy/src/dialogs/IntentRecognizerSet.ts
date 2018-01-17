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

import { IntentRecognizer, IIntentRecognizer, IRecognizeContext, IIntentRecognizerResult } from './IntentRecognizer'; 
import * as utils from '../utils';
import * as async from 'async';

export enum RecognizeOrder { parallel, series }


export interface IIntentRecognizerSetOptions {
    intentThreshold?: number;
    recognizeOrder?: RecognizeOrder;
    recognizers?: IIntentRecognizer[];
    processLimit?: number;
    stopIfExactMatch?: boolean;
} 

export class IntentRecognizerSet extends IntentRecognizer {
    public length: number;

    constructor(private options: IIntentRecognizerSetOptions = {}) {
        super();
        if (typeof this.options.intentThreshold !== 'number') {
            this.options.intentThreshold = 0.1;
        }
        if (!this.options.hasOwnProperty('recognizeOrder')) {
            this.options.recognizeOrder = RecognizeOrder.parallel;
        }
        if (!this.options.recognizers) {
            this.options.recognizers = [];
        }
        if (!this.options.processLimit) {
            this.options.processLimit = 4;
        }
        if (!this.options.hasOwnProperty('stopIfExactMatch')) {
            this.options.stopIfExactMatch = true;
        }
        this.length = this.options.recognizers.length;
    }

    public clone(copyTo?: IntentRecognizerSet): IntentRecognizerSet {
        var obj = copyTo || new IntentRecognizerSet(utils.clone(this.options));
        obj.options.recognizers = this.options.recognizers.slice(0);
        return obj;
    }

    public onRecognize(context: IRecognizeContext, done: (err: Error, result: IIntentRecognizerResult) => void): void {
        if (this.options.recognizeOrder == RecognizeOrder.parallel) {
            this.recognizeInParallel(context, done);
        } else {
            this.recognizeInSeries(context, done);
        }
    }

    public recognizer(plugin: IIntentRecognizer): this {
        // Append recognizer
        this.options.recognizers.push(plugin);
        this.length++;
        return this;
    }

    private recognizeInParallel(context: IRecognizeContext, done: (err: Error, result: IIntentRecognizerResult) => void): void {
        var result: IIntentRecognizerResult = { score: 0.0, intent: null };
        async.eachLimit(this.options.recognizers, this.options.processLimit, (recognizer, cb) => {
            try {
                recognizer.recognize(context, (err, r) => {
                    if (!err && r && r.score > result.score && r.score >= this.options.intentThreshold) {
                        result = r;
                    }
                    cb(err);
                });
            } catch (e) {
                cb(e);
            }
        }, (err) => {
            if (!err) {
                done(null, result);
            } else {
                var msg = err.toString();
                done(err instanceof Error ? err : new Error(msg), null);
            }
        });
    }

    private recognizeInSeries(context: IRecognizeContext, done: (err: Error, result: IIntentRecognizerResult) => void): void {
        var i = 0;
        var result: IIntentRecognizerResult = { score: 0.0, intent: null };
        async.whilst(() => {
            return (i < this.options.recognizers.length && (result.score < 1.0 || !this.options.stopIfExactMatch));
        }, (cb) => {
            try {
                var recognizer = this.options.recognizers[i++];
                recognizer.recognize(context, (err, r) => {
                    if (!err && r && r.score > result.score && r.score >= this.options.intentThreshold) {
                        result = r;
                    }
                    cb(err);
                });
            } catch (e) {
                cb(e);
            }
        }, (err) => {
            if (!err) {
                done(null, result);
            } else {
                done(err instanceof Error ? err : new Error(err.toString()), null);
            }
        });
    }
}