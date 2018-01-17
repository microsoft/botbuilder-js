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
exports.channels = {
    facebook: 'facebook',
    skype: 'skype',
    msteams: 'msteams',
    telegram: 'telegram',
    kik: 'kik',
    email: 'email',
    slack: 'slack',
    groupme: 'groupme',
    sms: 'sms',
    emulator: 'emulator',
    directline: 'directline',
    webchat: 'webchat',
    console: 'console',
    cortana: 'cortana'
};
function supportsKeyboards(session, buttonCnt) {
    if (buttonCnt === void 0) { buttonCnt = 100; }
    switch (getChannelId(session)) {
        case exports.channels.facebook:
            return (buttonCnt <= 10);
        case exports.channels.kik:
            return (buttonCnt <= 20);
        case exports.channels.msteams:
            return (buttonCnt <= 5);
        case exports.channels.slack:
        case exports.channels.telegram:
            return (buttonCnt <= 100);
        default:
            return false;
    }
}
exports.supportsKeyboards = supportsKeyboards;
function supportsCardActions(session, buttonCnt) {
    if (buttonCnt === void 0) { buttonCnt = 100; }
    switch (getChannelId(session)) {
        case exports.channels.facebook:
        case exports.channels.skype:
        case exports.channels.msteams:
            return (buttonCnt <= 3);
        case exports.channels.slack:
        case exports.channels.emulator:
        case exports.channels.directline:
        case exports.channels.webchat:
        case exports.channels.cortana:
            return (buttonCnt <= 100);
        default:
            return false;
    }
}
exports.supportsCardActions = supportsCardActions;
function hasMessageFeed(session) {
    switch (getChannelId(session)) {
        case exports.channels.cortana:
            return false;
        default:
            return true;
    }
}
exports.hasMessageFeed = hasMessageFeed;
function maxActionTitleLength(session) {
    return 20;
}
exports.maxActionTitleLength = maxActionTitleLength;
function getChannelId(addressable) {
    var channelId;
    if (addressable) {
        if (addressable.hasOwnProperty('message')) {
            channelId = addressable.message.address.channelId;
        }
        else if (addressable.hasOwnProperty('address')) {
            channelId = addressable.address.channelId;
        }
        else if (addressable.hasOwnProperty('channelId')) {
            channelId = addressable.channelId;
        }
    }
    return channelId ? channelId.toLowerCase() : '';
}
exports.getChannelId = getChannelId;
