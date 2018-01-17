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
Object.defineProperty(exports, "__esModule", { value: true });
var IntentRecognizer = /** @class */ (function () {
    function IntentRecognizer() {
        this._onEnabled = [];
        this._onFilter = [];
    }
    IntentRecognizer.prototype.recognize = function (context, callback) {
        var _this = this;
        this.isEnabled(context, function (err, enabled) {
            if (err) {
                callback(err, null);
            }
            else if (!enabled) {
                callback(null, { score: 0.0, intent: null });
            }
            else {
                _this.onRecognize(context, function (err, result) {
                    if (!err) {
                        _this.filter(context, result, callback);
                    }
                    else {
                        callback(err, result);
                    }
                });
            }
        });
    };
    IntentRecognizer.prototype.onEnabled = function (handler) {
        this._onEnabled.unshift(handler);
        return this;
    };
    IntentRecognizer.prototype.onFilter = function (handler) {
        this._onFilter.push(handler);
        return this;
    };
    IntentRecognizer.prototype.isEnabled = function (context, callback) {
        var index = 0;
        var _that = this;
        function next(err, enabled) {
            if (index < _that._onEnabled.length && !err && enabled) {
                try {
                    _that._onEnabled[index++](context, next);
                }
                catch (e) {
                    callback(e, false);
                }
            }
            else {
                callback(err, enabled);
            }
        }
        next(null, true);
    };
    IntentRecognizer.prototype.filter = function (context, result, callback) {
        var index = 0;
        var _that = this;
        function next(err, r) {
            if (index < _that._onFilter.length && !err) {
                try {
                    _that._onFilter[index++](context, r, next);
                }
                catch (e) {
                    callback(e, null);
                }
            }
            else {
                callback(err, r);
            }
        }
        next(null, result);
    };
    return IntentRecognizer;
}());
exports.IntentRecognizer = IntentRecognizer;
