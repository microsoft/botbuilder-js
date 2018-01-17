"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var IntentRecognizer_1 = require("./IntentRecognizer");
var request = require("request");
var url = require("url");
var LuisRecognizer = /** @class */ (function (_super) {
    __extends(LuisRecognizer, _super);
    function LuisRecognizer(models) {
        var _this = _super.call(this) || this;
        if (typeof models == 'string') {
            _this.models = { '*': models };
        }
        else {
            _this.models = (models || {});
        }
        return _this;
    }
    LuisRecognizer.prototype.onRecognize = function (context, callback) {
        var result = { score: 0.0, intent: null };
        if (context && context.message && context.message.text) {
            // Find model
            var locale = context.locale || '*';
            var dashPos = locale.indexOf('-');
            var parentLocale = dashPos > 0 ? locale.substr(0, dashPos) : '*';
            var model = this.models[locale] || this.models[parentLocale] || this.models['*'];
            if (model) {
                var utterance = context.message.text;
                LuisRecognizer.recognize(utterance, model, function (err, intents, entities, compositeEntities) {
                    if (!err) {
                        result.intents = intents;
                        result.entities = entities;
                        result.compositeEntities = compositeEntities;
                        // Return top intent
                        var top;
                        intents.forEach(function (intent) {
                            if (top) {
                                if (intent.score > top.score) {
                                    top = intent;
                                }
                            }
                            else {
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
                    }
                    else {
                        callback(err, null);
                    }
                });
            }
            else {
                callback(new Error("LUIS model not found for locale '" + locale + "'."), null);
            }
        }
        else {
            callback(null, result);
        }
    };
    LuisRecognizer.recognize = function (utterance, modelUrl, callback) {
        try {
            // Format url
            var uri = url.parse(modelUrl, true);
            uri.query['q'] = utterance || '';
            if (uri.search) {
                delete uri.search;
            }
            // Call model
            request.get(url.format(uri), function (err, res, body) {
                // Parse results
                var result;
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
                    }
                    else {
                        err = new Error(body);
                    }
                }
                catch (e) {
                    err = e;
                }
                // Return result
                try {
                    if (!err) {
                        callback(null, result.intents, result.entities, result.compositeEntities);
                    }
                    else {
                        var m = err.toString();
                        callback(err instanceof Error ? err : new Error(m));
                    }
                }
                catch (e) {
                    console.error(e.toString());
                }
            });
        }
        catch (err) {
            callback(err instanceof Error ? err : new Error(err.toString()));
        }
    };
    return LuisRecognizer;
}(IntentRecognizer_1.IntentRecognizer));
exports.LuisRecognizer = LuisRecognizer;
