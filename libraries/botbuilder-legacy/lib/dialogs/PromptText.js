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
var Prompt_1 = require("./Prompt");
var consts = require("../consts");
var PromptText = /** @class */ (function (_super) {
    __extends(PromptText, _super);
    function PromptText(features) {
        var _this = _super.call(this, {
            defaultRetryPrompt: 'default_text',
            defaultRetryNamespace: consts.Library.system,
            recognizeScore: 0.5
        }) || this;
        _this.updateFeatures(features);
        // Default recognizer logic
        _this.onRecognize(function (context, cb) {
            var text = context.message.text;
            if (text && !_this.features.disableRecognizer) {
                var options = context.dialogData.options;
                if ((options.minLength && text.length < Number(options.minLength)) ||
                    (options.maxLength && text.length > Number(options.maxLength))) {
                    cb(null, 0.0);
                }
                else {
                    cb(null, _this.features.recognizeScore, text);
                }
            }
            else {
                cb(null, 0.0);
            }
        });
        _this.onFormatMessage(function (session, text, speak, callback) {
            var context = session.dialogData;
            var options = context.options;
            var turnZero = context.turns === 0 || context.isReprompt;
            var message = session.message.text;
            if (!turnZero && (options.minLength || options.maxLength)) {
                var errorPrompt;
                if (options.minLength && message.length < Number(options.minLength)) {
                    errorPrompt = 'text_minLength_error';
                }
                else if (options.maxLength && message.length > Number(options.maxLength)) {
                    errorPrompt = 'text_maxLength_error';
                }
                if (errorPrompt) {
                    var text_1 = Prompt_1.Prompt.gettext(session, errorPrompt, consts.Library.system);
                    var msg = { text: session.gettext(text_1, options) };
                    callback(null, msg);
                }
                else {
                    callback(null, null);
                }
            }
            else {
                callback(null, null);
            }
        });
        // Add repeat intent handler
        _this.matches(consts.Intents.Repeat, function (session) {
            // Set to turn-0 and re-prompt.
            session.dialogData.turns = 0;
            _this.sendPrompt(session);
        });
        return _this;
    }
    return PromptText;
}(Prompt_1.Prompt));
exports.PromptText = PromptText;
