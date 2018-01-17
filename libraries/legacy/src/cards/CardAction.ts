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

export class CardAction implements IIsCardAction {
    private data = <ICardAction>{};

    constructor(private session?: Session) {
    }

    public type(t: string): this {
        if (t) {
            this.data.type = t;
        }
        return this;
    }

    public title(text: string|string[], ...args: any[]): this {
        if (text) {
            this.data.title = fmtText(this.session, text, args);
        }
        return this;
    }

    public value(v: string): this {
        if (v) {
            this.data.value = v;
        }
        return this;
    }

    public image(url: string): this {
        if (url) {
            this.data.image = url;
        }
        return this;
    }

    public text(text: string|string[], ...args: any[]): this {
        if (text) {
            this.data.text = fmtText(this.session, text, args);
        }
        return this;
    }

    public displayText(text: string|string[], ...args: any[]): this {
        if (text) {
            this.data.displayText = fmtText(this.session, text, args);
        }
        return this;
    }

    public toAction(): ICardAction {
        return this.data;
    }

    static call(session: Session, number: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('call').value(number).title(title || "Click to call");
    }

    static openUrl(session: Session, url: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('openUrl').value(url).title(title || "Click to open website in your browser");
    }

    static openApp(session: Session, url: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('openApp').value(url).title(title || "Click to open website in a webview");
    }

    static imBack(session: Session, msg: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('imBack').value(msg).title(title || "Click to send response to bot");
    }

    static postBack(session: Session, msg: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('postBack').value(msg).title(title || "Click to send response to bot");
    }

    static playAudio(session: Session, url: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('playAudio').value(url).title(title || "Click to play audio file");
    }

    static playVideo(session: Session, url: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('playVideo').value(url).title(title || "Click to play video");
    }

    static showImage(session: Session, url: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('showImage').value(url).title(title || "Click to view image");
    }

    static downloadFile(session: Session, url: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('downloadFile').value(url).title(title || "Click to download file");
    }

    static dialogAction(session: Session, action: string, data?: string, title?: string|string[]): CardAction {
        var value = 'action?' + action;
        if (data) {
            value += '=' + data;
        }
        return new CardAction(session).type('postBack').value(value).title(title || "Click to send response to bot");
    }

    static messageBack(session: Session, msg: string, title?: string|string[]): CardAction {
        return new CardAction(session).type('messageBack').value(msg).title(title || "Click to send response to bot");
    }
}