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
var Library_1 = require("../bots/Library");
var Dialog_1 = require("../dialogs/Dialog");
var Prompt_1 = require("../dialogs/Prompt");
var EntityRecognizer_1 = require("../dialogs/EntityRecognizer");
var CardAction_1 = require("../cards/CardAction");
var Keyboard_1 = require("../cards/Keyboard");
var Message_1 = require("../Message");
var consts = require("../consts");
var Channel = require("../Channel");
var SimplePromptRecognizer = /** @class */ (function () {
    function SimplePromptRecognizer() {
    }
    SimplePromptRecognizer.prototype.recognize = function (args, callback, session) {
        function findChoice(args, text) {
            var best = EntityRecognizer_1.EntityRecognizer.findBestMatch(args.enumValues, text);
            if (!best) {
                var n = EntityRecognizer_1.EntityRecognizer.parseNumber(text);
                if (!isNaN(n) && n > 0 && n <= args.enumValues.length) {
                    best = { index: n - 1, entity: args.enumValues[n - 1], score: 1.0 };
                }
            }
            return best;
        }
        // Recognize value
        var score = 0.0;
        var response;
        var text = args.utterance.trim();
        switch (args.promptType) {
            default:
            case Prompt_1.PromptType.text:
                // This is an open ended question so it's a little tricky to know what to pass as a confidence
                // score. Currently we're saying that we have 0.1 confidence that we understand the users intent
                // which will give all of the prompts parents a chance to capture the utterance. If no one 
                // captures the utterance we'll return the full text of the utterance as the result.
                score = 0.5;
                response = text;
                break;
            case Prompt_1.PromptType.number:
                var n = EntityRecognizer_1.EntityRecognizer.parseNumber(text);
                if (!isNaN(n)) {
                    var score = n.toString().length / text.length;
                    response = n;
                }
                break;
            case Prompt_1.PromptType.confirm:
                var b = EntityRecognizer_1.EntityRecognizer.parseBoolean(text);
                if (typeof b !== 'boolean') {
                    var best = findChoice(args, text);
                    if (best) {
                        b = (best.index === 0); // enumValues == ['yes', 'no']
                    }
                }
                if (typeof b == 'boolean') {
                    score = 1.0;
                    response = b;
                }
                break;
            case Prompt_1.PromptType.time:
                var entity = EntityRecognizer_1.EntityRecognizer.recognizeTime(text, args.refDate ? new Date(args.refDate) : null);
                if (entity) {
                    score = entity.entity.length / text.length;
                    response = entity;
                }
                break;
            case Prompt_1.PromptType.choice:
                var best = findChoice(args, text);
                if (best) {
                    score = best.score;
                    response = best;
                }
                break;
            case Prompt_1.PromptType.attachment:
                if (args.attachments && args.attachments.length > 0) {
                    score = 1.0;
                    response = args.attachments;
                }
                break;
        }
        // Return results
        if (score > 0) {
            callback({ score: score, resumed: Dialog_1.ResumeReason.completed, promptType: args.promptType, response: response });
        }
        else {
            callback({ score: score, resumed: Dialog_1.ResumeReason.notCompleted, promptType: args.promptType });
        }
    };
    return SimplePromptRecognizer;
}());
exports.SimplePromptRecognizer = SimplePromptRecognizer;
var LegacyPrompts = /** @class */ (function (_super) {
    __extends(LegacyPrompts, _super);
    function LegacyPrompts() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LegacyPrompts.prototype.begin = function (session, args) {
        args = args || {};
        args.promptAfterAction = args.hasOwnProperty('promptAfterAction') ? args.promptAfterAction : LegacyPrompts.options.promptAfterAction;
        args.retryCnt = 0;
        for (var key in args) {
            if (args.hasOwnProperty(key)) {
                session.dialogData[key] = args[key];
            }
        }
        this.sendPrompt(session, args);
    };
    LegacyPrompts.prototype.replyReceived = function (session, result) {
        var args = session.dialogData;
        if (result.error || result.resumed == Dialog_1.ResumeReason.completed) {
            result.promptType = args.promptType;
            session.endDialogWithResult(result);
        }
        else if (typeof args.maxRetries === 'number' && args.retryCnt >= args.maxRetries) {
            result.promptType = args.promptType;
            result.resumed = Dialog_1.ResumeReason.notCompleted;
            session.endDialogWithResult(result);
        }
        else {
            args.retryCnt++;
            this.sendPrompt(session, args, true);
        }
    };
    LegacyPrompts.prototype.dialogResumed = function (session, result) {
        // Comming back from an action so re-prompt the user.
        var args = session.dialogData;
        if (args.promptAfterAction) {
            this.sendPrompt(session, args);
        }
    };
    LegacyPrompts.prototype.recognize = function (context, cb) {
        var args = context.dialogData;
        LegacyPrompts.options.recognizer.recognize({
            promptType: args.promptType,
            utterance: context.message.text,
            locale: context.message.textLocale,
            attachments: context.message.attachments,
            enumValues: args.enumValues,
            refDate: args.refDate
        }, function (result) {
            if (result.error) {
                cb(result.error, null);
            }
            else {
                cb(null, result);
            }
        });
    };
    LegacyPrompts.prototype.sendPrompt = function (session, args, retry) {
        if (retry === void 0) { retry = false; }
        // Find message to deliver
        var msg;
        if (retry && typeof args.retryPrompt === 'object' && !Array.isArray(args.retryPrompt)) {
            msg = args.retryPrompt;
        }
        else if (typeof args.prompt === 'object' && !Array.isArray(args.prompt)) {
            msg = args.prompt;
        }
        else {
            msg = this.createPrompt(session, args, retry);
        }
        // Send message
        session.send(msg);
        // Commit batch
        session.sendBatch();
    };
    LegacyPrompts.prototype.createPrompt = function (session, args, retry) {
        var msg = new Message_1.Message(session);
        var locale = session.preferredLocale();
        var localizationNamespace = args.localizationNamespace;
        // Calculate list style.
        var style = Prompt_1.ListStyle.none;
        if (args.promptType == Prompt_1.PromptType.choice || args.promptType == Prompt_1.PromptType.confirm) {
            style = args.listStyle;
            if (style == Prompt_1.ListStyle.auto) {
                if (Channel.supportsKeyboards(session, args.enumValues.length)) {
                    style = Prompt_1.ListStyle.button;
                }
                else if (!retry && args.promptType == Prompt_1.PromptType.choice) {
                    style = args.enumValues.length < 3 ? Prompt_1.ListStyle.inline : Prompt_1.ListStyle.list;
                }
                else {
                    style = Prompt_1.ListStyle.none;
                }
            }
        }
        // Get localized text of the prompt
        var prompt;
        if (retry) {
            if (args.retryPrompt) {
                prompt = Message_1.Message.randomPrompt(args.retryPrompt);
            }
            else {
                // Use default system retry prompt
                var type = Prompt_1.PromptType[args.promptType];
                prompt = LegacyPrompts.defaultRetryPrompt[type];
                localizationNamespace = consts.Library.system;
            }
        }
        else {
            prompt = Message_1.Message.randomPrompt(args.prompt);
        }
        var text = session.localizer.gettext(locale, prompt, localizationNamespace);
        // Populate message
        var connector = '';
        var list;
        switch (style) {
            case Prompt_1.ListStyle.button:
                var buttons = [];
                for (var i = 0; i < session.dialogData.enumValues.length; i++) {
                    var option = session.dialogData.enumValues[i];
                    buttons.push(CardAction_1.CardAction.imBack(session, option, option));
                }
                msg.text(text)
                    .attachments([new Keyboard_1.Keyboard(session).buttons(buttons)]);
                break;
            case Prompt_1.ListStyle.inline:
                list = ' (';
                args.enumValues.forEach(function (v, index) {
                    var value = v.toString();
                    list += connector + (index + 1) + '. ' + session.localizer.gettext(locale, value, consts.Library.system);
                    if (index == args.enumValues.length - 2) {
                        connector = index == 0 ? session.localizer.gettext(locale, "list_or", consts.Library.system) : session.localizer.gettext(locale, "list_or_more", consts.Library.system);
                    }
                    else {
                        connector = ', ';
                    }
                });
                list += ')';
                msg.text(text + '%s', list);
                break;
            case Prompt_1.ListStyle.list:
                list = '\n   ';
                args.enumValues.forEach(function (v, index) {
                    var value = v.toString();
                    list += connector + (index + 1) + '. ' + session.localizer.gettext(locale, value, args.localizationNamespace);
                    connector = '\n   ';
                });
                msg.text(text + '%s', list);
                break;
            default:
                msg.text(text);
                break;
        }
        return msg;
    };
    LegacyPrompts.configure = function (options) {
        if (options) {
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    LegacyPrompts.options[key] = options[key];
                }
            }
        }
    };
    LegacyPrompts.options = {
        recognizer: new SimplePromptRecognizer(),
        promptAfterAction: true
    };
    LegacyPrompts.defaultRetryPrompt = {
        text: "default_text",
        number: "default_number",
        confirm: "default_confirm",
        choice: "default_choice",
        time: "default_time",
        attachment: "default_file"
    };
    return LegacyPrompts;
}(Dialog_1.Dialog));
exports.LegacyPrompts = LegacyPrompts;
Library_1.systemLib.dialog('BotBuilder:Prompts', new LegacyPrompts());
