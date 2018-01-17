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

import { IntentRecognizer, IRecognizeContext, IIntentRecognizerResult } from './IntentRecognizer';
import * as utils from '../utils';
import * as request from 'request';
import * as url from 'url';

export interface ILuisModelMap {
    [local: string]: string;
}

export class LuisRecognizer extends IntentRecognizer {
    private models: ILuisModelMap;

    constructor(models: string|ILuisModelMap) {
        super();
        if (typeof models == 'string') {
            this.models = { '*': <string>models };
        } else {
            this.models = <ILuisModelMap>(models || {});
        }
    }

    public onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void {
        let result: IIntentRecognizerResult = { score: 0.0, intent: null };
        if (context && context.message && context.message.text) {
            // Find model
            const locale = context.locale || '*';
            const dashPos = locale.indexOf('-');
            const parentLocale = dashPos > 0 ? locale.substr(0, dashPos) : '*';
            const model = this.models[locale] || this.models[parentLocale] || this.models['*'];
            if (model) {
                const utterance = context.message.text;
                LuisRecognizer.recognize(utterance, model, (err, intents, entities, compositeEntities) => {
                    if (!err) {
                        result.intents = intents;
                        result.entities = entities;
                        result.compositeEntities = compositeEntities;
                        // Return top intent
                        var top: IIntent;
                        intents.forEach((intent) => {
                            if (top) {
                                if (intent.score > top.score) {
                                    top = intent;
                                }
                            } else {
                                top = intent;
                            }
                        });
                        if (top) {
                            result.score = top.score;
                            result.intent = top.intent;

                            // Correct score for 'none' intent
                            // - The 'none' intent often has a score of 1.0 which
                            //   causes issues when trying to recognize over multiple
                            //   models. Setting to 0.1 lets the intent still be 
                            //   triggered but keeps it from stomping on other models.
                            switch (top.intent.toLowerCase()) {
                                case 'builtin.intent.none':
                                case 'none':
                                    result.score = 0.1;
                                    break;
                            }
                        }
                        callback(null, result);
                    } else {
                        callback(err, null);
                    }
                });
            } else {
                callback(new Error("LUIS model not found for locale '" + locale + "'."), null);
            }
        } else {
            callback(null, result);
        }
    }

    static recognize(utterance: string, modelUrl: string, callback: (err: Error, intents?: IIntent[], entities?: IEntity<any>[], compositeEntities?: ICompositeEntity<any>[]) => void): void {
        try {
            // Format url
            var uri = url.parse(modelUrl, true);
            (uri.query as any)['q'] = utterance || '';
            if (uri.search) {
                delete uri.search;
            }

            // Call model
            request.get(url.format(uri), (err: Error, res: any, body: string) => {
                // Parse results
                var result: ILuisResults;
                try {
                    if (res && res.statusCode === 200) {
                        result = JSON.parse(body);
                        result.intents = result.intents || [];
                        result.entities = result.entities || [];
                        result.compositeEntities = result.compositeEntities || [];
                        if (result.topScoringIntent && result.intents.length == 0) {
                            result.intents.push(result.topScoringIntent);
                        }
                        if (result.intents.length == 1 && typeof result.intents[0].score !== 'number') {
                            // Intents for the builtin Cortana app don't return a score.
                            result.intents[0].score = 1.0;
                        }
                    } else {
                        err = new Error(body);
                    }
                } catch (e) {
                    err = e;
                }

                // Return result
                try {
                    if (!err) {
                        callback(null, result.intents, result.entities, result.compositeEntities);
                    } else {
                        var m = err.toString();
                        callback(err instanceof Error ? err : new Error(m));
                    }
                } catch (e) {
                    console.error(e.toString());
                }
            });
        } catch (err) {
            callback(err instanceof Error ? err : new Error(err.toString()));
        }
    }
}

interface ILuisResults {
    query: string;
    topScoringIntent: IIntent;
    intents: IIntent[];
    entities: IEntity<string>[];
    compositeEntities?: ICompositeEntity<any>[];
}
