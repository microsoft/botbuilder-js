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

import { Session } from './Session';
import { IRecognizeContext } from './dialogs/IntentRecognizer'
import { PromptType, IPromptOptions } from './dialogs/Prompt';
import { IPromptArgs } from './deprecated/LegacyPrompts';
import * as Channel from './Channel';
import * as consts from './consts';
import * as sprintf from 'sprintf-js';

const debugLoggingEnabled = new RegExp('\\bbotbuilder\\b', 'i').test(process.env.NODE_DEBUG || '');

export function error(fmt: string, ...args: any[]): void {
    var msg = args.length > 0 ? sprintf.vsprintf(fmt, args) : fmt;
    console.error('ERROR: ' + msg);
}

export function warn(addressable: Session|IRecognizeContext|IMessage|IAddress, fmt: string, ...args: any[]): void {
    var prefix = getPrefix(<Session>addressable);
    var msg = args.length > 0 ? sprintf.vsprintf(fmt, args) : fmt;
    console.warn(prefix + 'WARN: ' + msg);
}

export function info(addressable: Session|IRecognizeContext|IMessage|IAddress, fmt: string, ...args: any[]): void {
    var channelId = Channel.getChannelId(addressable);
    if (channelId === Channel.channels.emulator || debugLoggingEnabled){
        var prefix = getPrefix(<Session>addressable);
        var msg = args.length > 0 ? sprintf.vsprintf(fmt, args) : fmt;
        console.info(prefix + msg);
    }
}

export function debug(fmt: string, ...args: any[]): void {
    debugLog(false, fmt, args);
}

export function trace(fmt: string, ...args: any[]): void {
    debugLog(true, fmt, args);    
}

function debugLog(trace:boolean, fmt: string, args: any[]): void {
    if (!debugLoggingEnabled) {
        return;
    }

    var msg = args.length > 0 ? sprintf.vsprintf(fmt, args) : fmt;
    if (trace) {
        console.trace(msg);    
    } else {
        console.log(msg);            
    }        
}


export function getPrefix(addressable: Session|IDialogState[]): string {
    var prefix = '';
    var callstack: IDialogState[];
    if (Array.isArray(addressable)) {
        callstack = addressable;
    } else {
        callstack = addressable && addressable.sessionState && addressable.sessionState.callstack ? addressable.sessionState.callstack : [];
    }
    for (var i = 0; i < callstack.length; i++) {
        if (i == callstack.length - 1) {
            var cur = callstack[i];
            switch (cur.id) {
                case 'BotBuilder:Prompts':
                    var promptType = PromptType[(<IPromptArgs>cur.state).promptType];
                    prefix += 'Prompts.' + promptType + ' - ';
                    break;
                case consts.DialogId.FirstRun:
                    prefix += 'Middleware.firstRun - '; 
                    break;
                default:
                    if (cur.id.indexOf('*:') == 0) {
                        prefix += cur.id.substr(2) + ' - ';
                    } else {
                        prefix += cur.id + ' - ';
                    }
                    break;
            }
        } else {
            prefix += '.';
        }
    }
    return prefix;
}