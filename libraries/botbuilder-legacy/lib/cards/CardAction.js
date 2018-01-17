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
var Message_1 = require("../Message");
var CardAction = /** @class */ (function () {
    function CardAction(session) {
        this.session = session;
        this.data = {};
    }
    CardAction.prototype.type = function (t) {
        if (t) {
            this.data.type = t;
        }
        return this;
    };
    CardAction.prototype.title = function (text) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (text) {
            this.data.title = Message_1.fmtText(this.session, text, args);
        }
        return this;
    };
    CardAction.prototype.value = function (v) {
        if (v) {
            this.data.value = v;
        }
        return this;
    };
    CardAction.prototype.image = function (url) {
        if (url) {
            this.data.image = url;
        }
        return this;
    };
    CardAction.prototype.text = function (text) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (text) {
            this.data.text = Message_1.fmtText(this.session, text, args);
        }
        return this;
    };
    CardAction.prototype.displayText = function (text) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (text) {
            this.data.displayText = Message_1.fmtText(this.session, text, args);
        }
        return this;
    };
    CardAction.prototype.toAction = function () {
        return this.data;
    };
    CardAction.call = function (session, number, title) {
        return new CardAction(session).type('call').value(number).title(title || "Click to call");
    };
    CardAction.openUrl = function (session, url, title) {
        return new CardAction(session).type('openUrl').value(url).title(title || "Click to open website in your browser");
    };
    CardAction.openApp = function (session, url, title) {
        return new CardAction(session).type('openApp').value(url).title(title || "Click to open website in a webview");
    };
    CardAction.imBack = function (session, msg, title) {
        return new CardAction(session).type('imBack').value(msg).title(title || "Click to send response to bot");
    };
    CardAction.postBack = function (session, msg, title) {
        return new CardAction(session).type('postBack').value(msg).title(title || "Click to send response to bot");
    };
    CardAction.playAudio = function (session, url, title) {
        return new CardAction(session).type('playAudio').value(url).title(title || "Click to play audio file");
    };
    CardAction.playVideo = function (session, url, title) {
        return new CardAction(session).type('playVideo').value(url).title(title || "Click to play video");
    };
    CardAction.showImage = function (session, url, title) {
        return new CardAction(session).type('showImage').value(url).title(title || "Click to view image");
    };
    CardAction.downloadFile = function (session, url, title) {
        return new CardAction(session).type('downloadFile').value(url).title(title || "Click to download file");
    };
    CardAction.dialogAction = function (session, action, data, title) {
        var value = 'action?' + action;
        if (data) {
            value += '=' + data;
        }
        return new CardAction(session).type('postBack').value(value).title(title || "Click to send response to bot");
    };
    CardAction.messageBack = function (session, msg, title) {
        return new CardAction(session).type('messageBack').value(msg).title(title || "Click to send response to bot");
    };
    return CardAction;
}());
exports.CardAction = CardAction;
