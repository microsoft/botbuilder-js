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
var RegExpRecognizer_1 = require("./RegExpRecognizer");
var LocalizedRegExpRecognizer = /** @class */ (function (_super) {
    __extends(LocalizedRegExpRecognizer, _super);
    function LocalizedRegExpRecognizer(intent, key, namespace) {
        var _this = _super.call(this) || this;
        _this.intent = intent;
        _this.key = key;
        _this.namespace = namespace;
        _this.recognizers = {};
        return _this;
    }
    LocalizedRegExpRecognizer.prototype.onRecognize = function (context, callback) {
        // Create recognizer for locale on first message
        var locale = context.preferredLocale();
        var recognizer = this.recognizers[locale];
        if (!recognizer) {
            var pattern = context.localizer.trygettext(locale, this.key, this.namespace);
            if (pattern) {
                var exp = new RegExp(pattern, 'i');
                this.recognizers[locale] = recognizer = new RegExpRecognizer_1.RegExpRecognizer(this.intent, exp);
            }
        }
        // Recognize utterance
        if (recognizer) {
            recognizer.recognize(context, callback);
        }
        else {
            callback(null, { score: 0.0, intent: null });
        }
    };
    return LocalizedRegExpRecognizer;
}(IntentRecognizer_1.IntentRecognizer));
exports.LocalizedRegExpRecognizer = LocalizedRegExpRecognizer;
