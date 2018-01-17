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
var Dialog_1 = require("../dialogs/Dialog");
var Library_1 = require("../bots/Library");
var SimpleDialog_1 = require("../dialogs/SimpleDialog");
var consts = require("../consts");
var Middleware = /** @class */ (function () {
    function Middleware() {
    }
    Middleware.dialogVersion = function (options) {
        return {
            botbuilder: function (session, next) {
                var cur = session.sessionState.version || 0.0;
                var curMajor = Math.floor(cur);
                var major = Math.floor(options.version);
                if (session.sessionState.callstack.length && curMajor !== major) {
                    session.endConversation(options.message || "Sorry. The service was upgraded and we need to start over.");
                }
                else if (options.resetCommand && session.message.text && options.resetCommand.test(session.message.text)) {
                    session.endConversation(options.message || "Sorry. The service was upgraded and we need to start over.");
                }
                else {
                    session.sessionState.version = options.version;
                    next();
                }
            }
        };
    };
    Middleware.firstRun = function (options) {
        return {
            botbuilder: function (session, next) {
                if (session.sessionState.callstack.length == 0) {
                    // New conversation so check first run version
                    var cur = session.userData[consts.Data.FirstRunVersion] || 0.0;
                    var curMajor = Math.floor(cur);
                    var major = Math.floor(options.version);
                    if (major > curMajor) {
                        // Run user through full first run experience
                        session.beginDialog(consts.DialogId.FirstRun, {
                            version: options.version,
                            dialogId: options.dialogId,
                            dialogArgs: options.dialogArgs
                        });
                    }
                    else if (options.version > cur && options.upgradeDialogId) {
                        // Run user through upgrade experience
                        session.beginDialog(consts.DialogId.FirstRun, {
                            version: options.version,
                            dialogId: options.upgradeDialogId,
                            dialogArgs: options.upgradeDialogArgs
                        });
                    }
                    else {
                        next();
                    }
                }
                else {
                    next();
                }
            }
        };
    };
    Middleware.sendTyping = function () {
        return {
            botbuilder: function (session, next) {
                session.sendTyping();
                next();
            }
        };
    };
    return Middleware;
}());
exports.Middleware = Middleware;
Library_1.systemLib.dialog(consts.DialogId.FirstRun, new SimpleDialog_1.SimpleDialog(function (session, args) {
    if (args && args.hasOwnProperty('resumed')) {
        // Returning from dialog
        var result = args;
        if (result.resumed == Dialog_1.ResumeReason.completed) {
            // First run successfully completed so update stored version.
            session.userData[consts.Data.FirstRunVersion] = session.dialogData.version;
        }
        session.endDialogWithResult(result);
    }
    else {
        // Save version and launch dialog
        var dialogId = args.dialogId.indexOf(':') >= 0 ? args.dialogId : consts.Library.default + ':' + args.dialogId;
        session.dialogData.version = args.version;
        session.beginDialog(dialogId, args.dialogArgs);
    }
}));
