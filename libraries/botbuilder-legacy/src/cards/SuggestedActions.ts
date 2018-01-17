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

import { Session } from '../Session';
import { fmtText } from '../Message';

export class SuggestedActions implements IIsSuggestedActions {
    private data = <ISuggestedActions>{};
    
    constructor(private session?: Session) {
    }
    
    public to(to: string|string[]): this {
        
        this.data.to = []

        if(to) {
            if (Array.isArray(to)) {
                for (let i = 0; i < to.length; i++) {
                    this.data.to.push(to[i]);
                }
            } else {
                this.data.to.push(to);
            }
        }
        
        return this;
    }

    public actions(list: ICardAction[]|IIsCardAction[]): this {
        this.data.actions = [];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                this.addAction(list[i]);
            }
        }
        return this;
    }

    public addAction(action: ICardAction|IIsCardAction): this {
        if (action) {
            var cardAction: ICardAction = (<IIsCardAction>action).toAction ? (<IIsCardAction>action).toAction() : <ICardAction>action;
            if (!this.data.actions) {
                this.data.actions = [cardAction];
            } else {
                this.data.actions.push(cardAction);
            }
        }
        return this;
    }

    public toSuggestedActions(): ISuggestedActions {
        return this.data;
    }

    public static create(session: Session, actions: ICardAction[]|IIsCardAction[], to?: string|string[]): SuggestedActions {
        return new SuggestedActions(session)
            .to(to)
            .actions(actions);
    } 
}