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
var SuggestedActions = /** @class */ (function () {
    function SuggestedActions(session) {
        this.session = session;
        this.data = {};
    }
    SuggestedActions.prototype.to = function (to) {
        this.data.to = [];
        if (to) {
            if (Array.isArray(to)) {
                for (var i = 0; i < to.length; i++) {
                    this.data.to.push(to[i]);
                }
            }
            else {
                this.data.to.push(to);
            }
        }
        return this;
    };
    SuggestedActions.prototype.actions = function (list) {
        this.data.actions = [];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                this.addAction(list[i]);
            }
        }
        return this;
    };
    SuggestedActions.prototype.addAction = function (action) {
        if (action) {
            var cardAction = action.toAction ? action.toAction() : action;
            if (!this.data.actions) {
                this.data.actions = [cardAction];
            }
            else {
                this.data.actions.push(cardAction);
            }
        }
        return this;
    };
    SuggestedActions.prototype.toSuggestedActions = function () {
        return this.data;
    };
    SuggestedActions.create = function (session, actions, to) {
        return new SuggestedActions(session)
            .to(to)
            .actions(actions);
    };
    return SuggestedActions;
}());
exports.SuggestedActions = SuggestedActions;
