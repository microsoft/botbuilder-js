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
exports.agent = 'botbuilder';
exports.messageType = 'message';
exports.invokeType = 'invoke';
exports.defaultConnector = '*';
exports.defaultLocale = '*';
exports.emulatorChannel = 'emulator';
exports.intentEntityType = 'intent';
exports.Errors = {
    EMSGSIZE: 'EMSGSIZE',
    EBADMSG: 'EBADMSG'
};
exports.Library = {
    system: 'BotBuilder',
    default: '*'
};
exports.Data = {
    SessionState: 'BotBuilder.Data.SessionState',
    SessionId: 'BotBuilder.Data.SessionId',
    Handler: 'BotBuilder.Data.Handler',
    Group: 'BotBuilder.Data.Group',
    Intent: 'BotBuilder.Data.Intent',
    WaterfallStep: 'BotBuilder.Data.WaterfallStep',
    Form: 'BotBuilder.Data.Form',
    Field: 'BotBuilder.Data.Field',
    FirstRunVersion: 'BotBuilder.Data.FirstRunVersion',
    PreferredLocale: 'BotBuilder.Data.PreferredLocale',
    DebugAddress: 'BotBuilder.Data.DebugAddress',
    DebugWatches: 'BotBuilder.Data.DebugWatches'
};
exports.DialogId = {
    FirstRun: 'BotBuilder:FirstRun',
    ConfirmCancel: 'BotBuilder:ConfirmCancel',
    ConfirmInterruption: 'BotBuilder:ConfirmInterruption',
    Interruption: 'BotBuilder:Interruption',
    Disambiguate: 'BotBuilder:Disambiguate'
};
exports.Id = {
    DefaultGroup: 'BotBuilder.Id.DefaultGroup'
};
exports.Intents = {
    Default: 'BotBuilder.DefaultIntent',
    Response: 'BotBuilder.ResponseIntent',
    Repeat: 'BotBuilder.RepeatIntent'
};
exports.Entities = {
    Response: 'BotBuilder.Entities.Response',
    Number: 'number',
    String: 'string',
    Date: 'date',
    Boolean: 'boolean',
    Match: 'match'
};
