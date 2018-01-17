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

export class ReceiptCard implements IIsAttachment {
    protected data = {
        contentType: 'application/vnd.microsoft.card.receipt',
        content: <IReceiptCard>{}
    };
    
    constructor(protected session?: Session) {
        
    }
    
    public title(text: string|string[], ...args: any[]): this {
        if (text) {
            this.data.content.title = fmtText(this.session, text, args);
        }
        return this;
    }
    
    public items(list: IReceiptItem[]|IIsReceiptItem[]): this {
        this.data.content.items = [];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                this.data.content.items.push((<IIsReceiptItem>item).toItem ? (<IIsReceiptItem>item).toItem() : <IReceiptItem>item);    
            }
        }
        return this;
    }

    public facts(list: IFact[]|IIsFact[]): this {
        this.data.content.facts = [];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                var fact = list[i];
                this.data.content.facts.push((<IIsFact>fact).toFact ? (<IIsFact>fact).toFact() : <IFact>fact);    
            }
        }
        return this;
    }

    public tap(action: ICardAction|IIsCardAction): this {
        if (action) {
            this.data.content.tap = (<IIsCardAction>action).toAction ? (<IIsCardAction>action).toAction() : <ICardAction>action;
        }
        return this;
    }
    
    public total(v: string): this {
        this.data.content.total = v || '';
        return this;
    }

    public tax(v: string): this {
        this.data.content.tax = v || '';
        return this;
    }

    public vat(v: string): this {
        this.data.content.vat = v || '';
        return this;
    }

    public buttons(list: ICardAction[]|IIsCardAction[]): this {
        this.data.content.buttons = [];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                var action = list[i];
                this.data.content.buttons.push((<IIsCardAction>action).toAction ? (<IIsCardAction>action).toAction() : <ICardAction>action);    
            }
        }
        return this;
    }

    public toAttachment(): IAttachment {
        return this.data;
    }
}


export class ReceiptItem implements IIsReceiptItem {
    private data = <IReceiptItem>{};
    
    constructor(private session?: Session) {
        
    }
    
    public title(text: string|string[], ...args: any[]): this {
        if (text) {
            this.data.title = fmtText(this.session, text, args);
        }
        return this;
    }

    public subtitle(text: string|string[], ...args: any[]): this {
        if (text) {
            this.data.subtitle = fmtText(this.session, text, args);
        }
        return this;
    }
    
    public text(text: string|string[], ...args: any[]): this {
        if (text) {
            this.data.text = fmtText(this.session, text, args);
        }
        return this;
    }
    
    public image(img: ICardImage|IIsCardImage): this {
        if (img) {
            this.data.image = (<IIsCardImage>img).toImage ? (<IIsCardImage>img).toImage() : <ICardImage>img;
        }
        return this;
    }

    public price(v: string): this {
        this.data.price = v || '';
        return this;
    }
    
    public quantity(v: string): this {
        this.data.quantity = v || '';
        return this;
    }
    
    public tap(action: ICardAction|IIsCardAction): this {
        if (action) {
            this.data.tap = (<IIsCardAction>action).toAction ? (<IIsCardAction>action).toAction() : <ICardAction>action;
        }
        return this;
    }
    
    public toItem(): IReceiptItem {
        return this.data;    
    }

    static create(session: Session, price: string, title?: string|string[]): ReceiptItem {
        return new ReceiptItem(session).price(price).title(title);
    }
}

export class Fact implements IIsFact {
    private data = <IFact>{ value: '' };
    
    constructor(private session?: Session) {
        
    }
    
    public key(text: string|string[], ...args: any[]): this {
        if (text) {
            this.data.key = fmtText(this.session, text, args);
        }
        return this;
    }
    
    public value(v: string): this {
        this.data.value = v || '';
        return this;
    }
    
    public toFact(): IFact {
        return this.data;    
    }

    static create(session: Session, value: string, key?: string|string[]): Fact {
        return new Fact(session).value(value).key(key);
    }
}