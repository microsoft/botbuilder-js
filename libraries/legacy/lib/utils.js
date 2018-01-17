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
var sprintf = require("sprintf-js");
function clone(obj) {
    var cpy = {};
    if (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                cpy[key] = obj[key];
            }
        }
    }
    return cpy;
}
exports.clone = clone;
function copyTo(frm, to) {
    if (frm) {
        for (var key in frm) {
            if (frm.hasOwnProperty(key)) {
                if (typeof to[key] === 'function') {
                    to[key](frm[key]);
                }
                else {
                    to[key] = frm[key];
                }
            }
        }
    }
}
exports.copyTo = copyTo;
function copyFieldsTo(frm, to, fields) {
    if (frm && to) {
        fields.split('|').forEach(function (f) {
            if (frm.hasOwnProperty(f)) {
                if (typeof to[f] === 'function') {
                    to[f](frm[f]);
                }
                else {
                    to[f] = frm[f];
                }
            }
        });
    }
}
exports.copyFieldsTo = copyFieldsTo;
function moveFieldsTo(frm, to, fields) {
    if (frm && to) {
        for (var f in fields) {
            if (frm.hasOwnProperty(f)) {
                if (typeof to[f] === 'function') {
                    to[fields[f]](frm[f]);
                }
                else {
                    to[fields[f]] = frm[f];
                }
                delete frm[f];
            }
        }
    }
}
exports.moveFieldsTo = moveFieldsTo;
function toDate8601(date) {
    return sprintf.sprintf('%04d-%02d-%02d', date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}
exports.toDate8601 = toDate8601;
