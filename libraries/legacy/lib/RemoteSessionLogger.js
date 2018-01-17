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
var SessionLogger_1 = require("./SessionLogger");
var RemoteSessionLogger = /** @class */ (function (_super) {
    __extends(RemoteSessionLogger, _super);
    function RemoteSessionLogger(connector, address, relatesTo) {
        var _this = _super.call(this) || this;
        _this.connector = connector;
        _this.address = address;
        _this.relatesTo = relatesTo;
        _this.isEnabled = true;
        _this.event = _this.createEvent();
        return _this;
    }
    /** Dumps a variable to the output. */
    RemoteSessionLogger.prototype.dump = function (name, value) {
        _super.prototype.dump.call(this, name, value);
        this.event.value.push({
            type: 'variable',
            timestamp: new Date().getTime(),
            name: name,
            value: value
        });
    };
    /** Logs a message to the output. */
    RemoteSessionLogger.prototype.log = function (dialogStack, msg) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        _super.prototype.log.apply(this, [dialogStack, msg].concat(args));
        this.event.value.push({
            type: 'log',
            timestamp: new Date().getTime(),
            level: 'info',
            msg: msg,
            args: args
        });
    };
    /** Writes a warning to the output. */
    RemoteSessionLogger.prototype.warn = function (dialogStack, msg) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        _super.prototype.warn.apply(this, [dialogStack, msg].concat(args));
        this.event.value.push({
            type: 'log',
            timestamp: new Date().getTime(),
            level: 'warn',
            msg: msg,
            args: args
        });
    };
    /** Writes an error to the output. */
    RemoteSessionLogger.prototype.error = function (dialogStack, err) {
        _super.prototype.error.call(this, dialogStack, err);
        this.event.value.push({
            type: 'log',
            timestamp: new Date().getTime(),
            level: 'info',
            msg: err.stack
        });
    };
    /** Flushes any buffered output. */
    RemoteSessionLogger.prototype.flush = function (callback) {
        var ev = this.event;
        this.event = this.createEvent();
        this.connector.send([ev], callback);
    };
    /** Creates a new debug event. */
    RemoteSessionLogger.prototype.createEvent = function () {
        return {
            type: 'event',
            address: this.address,
            name: 'debug',
            value: [],
            relatesTo: this.relatesTo,
            text: "Debug Event"
        };
    };
    return RemoteSessionLogger;
}(SessionLogger_1.SessionLogger));
exports.RemoteSessionLogger = RemoteSessionLogger;
