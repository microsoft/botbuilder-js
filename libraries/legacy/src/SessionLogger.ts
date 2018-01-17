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

import * as logger from './logger';

export class SessionLogger {
    public isEnabled = new RegExp('\\bbotbuilder\\b', 'i').test(process.env.NODE_DEBUG || '');

    /** Dumps a variable to the output. */
    public dump(name: string, value: any): void {
        if (this.isEnabled && name) {
            if (Array.isArray(value) || typeof value == 'object') {
                try {
                    var v = JSON.stringify(value);
                    console.log(name + ': ' + v);
                } catch (e) {
                    console.error(name + ': {STRINGIFY ERROR}');
                }
            } else {
                console.log(name + ': ' + value);
            }
        }
    }
    
    /** Logs a message to the output. */
    public log(dialogStack: IDialogState[], msg: string, ...args: any[]): void {
        if (this.isEnabled && msg) {
            var prefix = logger.getPrefix(dialogStack);
            args.unshift(prefix + msg);
            console.log.apply(console, args);
        }
    }

    /** Writes a warning to the output. */
    public warn(dialogStack: IDialogState[], msg: string, ...args: any[]): void {
        if (this.isEnabled && msg) {
            var prefix = logger.getPrefix(dialogStack);
            args.unshift(prefix + 'WARN: ' + msg);
            console.warn.apply(console, args);
        }
    }

    /** Writes an error to the output. */
    public error(dialogStack: IDialogState[], err: Error): void {
        if (this.isEnabled && err) {
            var prefix = logger.getPrefix(dialogStack);
            console.error(prefix + 'ERROR: ' + err.message);
        }
    }
    
    /** Flushes any buffered output. */
    public flush(callback: (err: Error) => void): void {
        callback(null);
    }
}