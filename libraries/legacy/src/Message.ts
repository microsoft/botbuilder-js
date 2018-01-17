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
import { HeroCard } from './cards/HeroCard';
import { CardImage } from './cards/CardImage';
import { CardAction } from './cards/CardAction';
import * as utils from './utils';
import * as consts from './consts';
import * as sprintf from 'sprintf-js';

export interface ISourceEventMap {
    [source: string]: any;
}

export var TextFormat = {
    plain: 'plain',
    markdown: 'markdown',
    xml: 'xml'
};

export var AttachmentLayout = {
    list: 'list',
    carousel: 'carousel'
};

export var InputHint = {
    acceptingInput: 'acceptingInput',
    ignoringInput: 'ignoringInput',
    expectingInput: 'expectingInput' 
};

export class Message implements IIsMessage {
    protected data = <IMessage>{};
    
    constructor(private session?: Session) {
        this.data.type = consts.messageType;
        this.data.agent = consts.agent;
        if (this.session) {
            var m = this.session.message;
            if (m.source) {
                this.data.source = m.source;
            }
            if (m.textLocale) {
                this.data.textLocale = m.textLocale;
            }
            if (m.address) {
                this.data.address = m.address;
            }
        }
    }

    public inputHint(hint: string): this {
        this.data.inputHint = hint;
        return this;
    }

    public speak(ssml: string|string[], ...args: any[]): this {
        if (ssml) {
            this.data.speak = fmtText(this.session, ssml, args);
        }
        return this; 
    }

    public nspeak(ssml: string|string[], ssml_plural: string|string[], count: number): this {
        var fmt = count == 1 ? Message.randomPrompt(ssml) : Message.randomPrompt(ssml_plural);
        if (this.session) {
            // Run prompt through localizer
            fmt = this.session.gettext(fmt);
        }
        this.data.speak = sprintf.sprintf(fmt, count);
        return this;
    }
    
    public textLocale(locale: string): this {
        this.data.textLocale = locale;
        return this;
    }

    public textFormat(style: string): this {
        this.data.textFormat = style;
        return this;
    }
    
    public text(text: string|string[], ...args: any[]): this {
        if (text) {
            this.data.text = text ? fmtText(this.session, text, args) : '';
        }
        return this; 
    }

    public ntext(msg: string|string[], msg_plural: string|string[], count: number): this {
        var fmt = count == 1 ? Message.randomPrompt(msg) : Message.randomPrompt(msg_plural);
        if (this.session) {
            // Run prompt through localizer
            fmt = this.session.gettext(fmt);
        }
        this.data.text = sprintf.sprintf(fmt, count);
        return this;
    }

    public compose(prompts: string[][], ...args: any[]): this {
        if (prompts) {
            this.data.text = Message.composePrompt(this.session, prompts, args);
        }
        return this;
    }

    public summary(text: string|string[], ...args: any[]): this {
        this.data.summary = text ? fmtText(this.session, text, args) : '';
        return this; 
    }

    public attachmentLayout(style: string): this {
        this.data.attachmentLayout = style;
        return this;
    }
    
    public attachments(list: IAttachment[]|IIsAttachment[]): this {
        this.data.attachments = [];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                this.addAttachment(list[i]);
            }
        }
        return this;
    }
       
    public addAttachment(attachment: IAttachment|IIsAttachment): this {
        if (attachment) {
            // Upgrade attachment if specified using old schema
            var a: IAttachment = (<IIsAttachment>attachment).toAttachment ? (<IIsAttachment>attachment).toAttachment() : <IAttachment>attachment;
            a = this.upgradeAttachment(a);
            if (!this.data.attachments) {
                this.data.attachments = [a];
            } else {
                this.data.attachments.push(a);
            }
        }
        return this;
    }

    public suggestedActions(suggestedActions: ISuggestedActions|IIsSuggestedActions): this {

        if (suggestedActions) {
            let actions: ISuggestedActions = 
                (<IIsSuggestedActions>suggestedActions).toSuggestedActions 
                ? (<IIsSuggestedActions>suggestedActions).toSuggestedActions() 
                : <ISuggestedActions>suggestedActions;
            this.data.suggestedActions = actions;
        }
        return this;
    }
    
    public entities(list: Object[]): this {
        this.data.entities = list || [];
        return this;
    }
    
    public addEntity(obj: Object): this {
        if (obj) {
            if (!this.data.entities) {
                this.data.entities = [obj];
            } else {
                this.data.entities.push(obj);
            }
        }
        return this;
    }
    
    public address(adr: IAddress): this {
        if (adr) {
            this.data.address = adr;
            this.data.source = adr.channelId;
        }
        return this;
    }
    
    public timestamp(time?: string): this {
        if (this.session) {
            this.session.logger.warn(this.session.dialogStack(), "Message.timestamp() should be set by the connectors service. Use Message.localTimestamp() instead.");
        }
        this.data.timestamp = time || new Date().toISOString();
        return this;
    }

    public localTimestamp(time?: string): this {
        this.data.localTimestamp = time || new Date().toISOString();
        return this;
    }

    public sourceEvent(map: ISourceEventMap): this {
        if (map) {
            var channelId = this.data.address ? this.data.address.channelId : '*';
            if (map.hasOwnProperty(channelId)) {
                this.data.sourceEvent = map[channelId];
            } else if (map.hasOwnProperty('*')) {
                this.data.sourceEvent = map['*'];
            }
        }
        return this;
    }

    public value(param: any): this {
        this.data.value = param;
        return this;
    }

    public name(name: string): this {
        this.data.name = name;
        return this;
    }

    public relatesTo(adr: IAddress): this {
        if (adr) {
            this.data.relatesTo = adr;
        }
        return this;
    }

    public code(value: string): this {
        this.data.code = value;
        return this;
    }
    
    public toMessage(): IMessage {
        // Return cloned message
        return utils.clone(this.data);
    }

    private upgradeAttachment(a: IAttachment): IAttachment {
        var isOldSchema = false;
        for (var prop in a) {
            switch (prop) {
                case 'actions':
                case 'fallbackText':
                case 'title':
                case 'titleLink':
                case 'text':
                case 'thumbnailUrl':
                    isOldSchema = true;
                    break;
            }
        }
        if (isOldSchema) {
            console.warn('Using old attachment schema. Upgrade to new card schema.');
            var v2 = <IAttachmentV2>a;
            var card = new HeroCard();
            if (v2.title) {
                card.title(v2.title);
            }
            if (v2.text) {
                card.text(v2.text);
            }
            if (v2.thumbnailUrl) {
                card.images([new CardImage().url(v2.thumbnailUrl)]);
            }
            if (v2.titleLink) {
                card.tap(CardAction.openUrl(null, v2.titleLink));
            }
            if (v2.actions) {
                var list: CardAction[] = [];
                for (var i = 0; i < v2.actions.length; i++) {
                    var old = v2.actions[i];
                    var btn = old.message ? 
                        CardAction.imBack(null, old.message, old.title) : 
                        CardAction.openUrl(null, old.url, old.title);
                    if (old.image) {
                        btn.image(old.image);
                    }
                    list.push(btn);
                }
                card.buttons(list);
            }
            return card.toAttachment();
        } else {
            return a;
        }
    }

    static randomPrompt(prompts: string|string[]): string {
        if (Array.isArray(prompts)) {
            var i = Math.floor(Math.random() * prompts.length);
            return prompts[i];
        } else {
            return prompts;
        }
    }
    
    static composePrompt(session: Session, prompts: string[][], args?: any[]): string {
        var connector = '';
        var prompt = '';
        for (var i = 0; i < prompts.length; i++) {
            var txt = Message.randomPrompt(prompts[i]);
            prompt += connector + (session ? session.gettext(txt) : txt);
            connector = ' ';
        }
        return args && args.length > 0 ? sprintf.vsprintf(prompt, args) : prompt;
    }

    //-------------------
    // DEPRECATED METHODS
    //-------------------
    
    public setLanguage(local: string): this {
        console.warn("Message.setLanguage() is deprecated. Use Message.textLocal() instead.");
        return this.textLocale(local);
    }
    
    public setText(session: Session, prompts: string|string[], ...args: any[]): this {
        console.warn("Message.setText() is deprecated. Use Message.text() instead.");
        if (session && !this.session) {
            this.session = session;
        }
        args.unshift(prompts);
        return Message.prototype.text.apply(this, args);
    }

    public setNText(session: Session, msg: string, msg_plural: string, count: number): this {
        console.warn("Message.setNText() is deprecated. Use Message.ntext() instead.");
        if (session && !this.session) {
            this.session = session;
        }
        return this.ntext(msg, msg_plural, count);
    }
    
    public composePrompt(session: Session, prompts: string[][], ...args: any[]): this {
        console.warn("Message.composePrompt() is deprecated. Use Message.compose() instead.");
        if (session && !this.session) {
            this.session = session;
        }
        args.unshift(prompts);
        return Message.prototype.compose.apply(this, args);
    }

    public setChannelData(data: any): this {
        console.warn("Message.setChannelData() is deprecated. Use Message.sourceEvent() instead.");
        return this.sourceEvent({ '*': data });
    }
}

export function fmtText(session: Session, prompts: string|string[], args?: any[]): string {
    var fmt = Message.randomPrompt(prompts);
    if (session) {
        // Run prompt through localizer
        fmt = session.gettext(fmt);
    }
    return args && args.length > 0 ? sprintf.vsprintf(fmt, args) : fmt; 
}

interface IAttachmentV2 {
    actions?: IActionV2[];
    contentType?: string;
    contentUrl?: string;
    fallbackText?: string;
    title?: string;
    titleLink?: string;
    text?: string;
    thumbnailUrl?: string;
}

interface IActionV2 {
    title?: string;
    message?: string;
    url?: string;
    image?: string;    
}
