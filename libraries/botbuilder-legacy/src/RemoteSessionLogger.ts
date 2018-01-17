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

import {SessionLogger} from './SessionLogger';
import {IConnector} from './Session';

export interface IDebugEvent extends IEvent {
    name: string;
    value: IDebugItem[];
    relatesTo?: IAddress;
    text?: string;  // <-- Fixes a display bug in the emulator.
}

export interface IDebugItem {
    type: string;
    timestamp: number;
}

export interface IDebugLogEntry extends IDebugItem {
    level: string;
    msg: string;
    args?: any[]
}

export interface IDebugVariable extends IDebugItem {
    name: string;
    value: any;
}

export class RemoteSessionLogger extends SessionLogger {
    private event: IDebugEvent;

    constructor(private connector: IConnector, private address: IAddress, private relatesTo: IAddress) {
        super();
        this.isEnabled = true;
        this.event = this.createEvent();
    }

    /** Dumps a variable to the output. */
    public dump(name: string, value: any): void {
        super.dump(name, value);
        this.event.value.push(<IDebugVariable>{
            type: 'variable',
            timestamp: new Date().getTime(),
            name: name,
            value: value
        });
    }

    /** Logs a message to the output. */
    public log(dialogStack: IDialogState[], msg: string, ...args: any[]): void {
        super.log.apply(this, [dialogStack, msg].concat(args));
        this.event.value.push(<IDebugLogEntry>{
            type: 'log',
            timestamp: new Date().getTime(),
            level: 'info',
            msg: msg,
            args: args
        });
    }

    /** Writes a warning to the output. */
    public warn(dialogStack: IDialogState[], msg: string, ...args: any[]): void {
        super.warn.apply(this, [dialogStack, msg].concat(args));
        this.event.value.push(<IDebugLogEntry>{
            type: 'log',
            timestamp: new Date().getTime(),
            level: 'warn',
            msg: msg,
            args: args
        });
    }

    /** Writes an error to the output. */
    public error(dialogStack: IDialogState[], err: Error): void {
        super.error(dialogStack, err);
        this.event.value.push(<IDebugLogEntry>{
            type: 'log',
            timestamp: new Date().getTime(),
            level: 'info',
            msg: err.stack
        });
    }

    /** Flushes any buffered output. */
    public flush(callback: (err: Error) => void): void {
        var ev = this.event;
        this.event = this.createEvent();
        this.connector.send(<any>[ev], callback);
    }

    /** Creates a new debug event. */
    private createEvent(): IDebugEvent {
        return {
            type: 'event',
            address: this.address,
            name: 'debug',
            value: [],
            relatesTo: this.relatesTo,
            text: "Debug Event"
        };
    }
}