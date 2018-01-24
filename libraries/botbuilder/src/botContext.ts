/**
 * @module botbuilder
 */
/** second comment block */
import { Activity, ConversationReference, getConversationReference } from './activity';
import { Bot } from './bot';

declare global {
    export interface BotContextExtensions {

    }
}

export interface BotContext extends BotContextExtensions {

}

export class BotContext {
    private _bot: Bot;
    private _request: Activity|undefined;
    private _reference: ConversationReference;
    private _responses: Partial<Activity>[] = [];
    private _responded = false;
    private _properties: { [key:string]: any; } = {};

    /**
     * Creates a new bot context instance.
     * @param bot Bot the context was created for.
     * @param request (Optional) request that was received by the bots adapter.
     */
    constructor(bot: Bot, request?: Partial<Activity>) {
        this._bot = bot;
        this._request = request;
        if (request) {
            this._reference = getConversationReference(request);
        }
    }

    /** The Bot object for this context. */
    get bot(): Bot {
        this.throwIfDisposed('bot');
        return this._bot;
    }

    /** Returns true if the context object has been disposed. */
    get disposed(): boolean {
        return !!this._bot;
    }

    /** Returns the conversation reference for the current turn. */
    get conversationReference(): ConversationReference {
        this.throwIfDisposed('conversationReference');
        return this._reference
    }

    /** Assigns the conversation reference for the current turn. */
    set conversationReference(reference: ConversationReference) {
        this.throwIfDisposed('conversationReference');
        this._reference = reference;
    }
    
    /** 
     * The received activity. If the bot is performing "proactive" messaging, the request will be 
     * undefined.
     */
    get request(): Activity|undefined {
        this.throwIfDisposed('request');
        return this._request;
    }

    /** Queue of responses to send to the user. */
    get responses(): Partial<Activity>[] {
        this.throwIfDisposed('responses');
        return this._responses;
    }

    /** If true at least one response has been sent for the current turn of conversation. */
    get responded(): boolean {
        this.throwIfDisposed('responded');
        return this._responded;
    }

    /**
     * INTERNAL disposes of the context object, making it unusable. Calling any properties or 
     * methods off a disposed of context will result in an exception being thrown.
     */
    public dispose(): void {
        ['_bot', '_request', '_reference', '_responses', '_properties'].forEach((prop) => {
            (this as any)[prop] = undefined;
        });
    };

    /**
     * Forces the delivery of any queued up responses to the user.
     */
    public flushResponses<T>(): Promise<T> {
        this.throwIfDisposed('flushResponses()');

        const args: any[] = this._responses.slice(0);
        const cnt = args.length;
        args.unshift(this);
        return Bot.prototype.post.apply(this._bot, args)
            .then((results: ConversationReference[]) => {
                if (cnt > 0) { 
                    this._responses.splice(0, cnt);
                    this._responded = true; 
                }
                return results;
            });
    }
    
    /**
     * Returns the value of a previously set property. An exception will be thrown if the property
     * hasn't been set yet. 
     * @param name Name of the property to return.
     */
    public get<T = any>(name: string): T {
        this.throwIfDisposed(`get("${name}")`);

        if (!this._properties.hasOwnProperty(name)) { throw new Error(`BotContext.get("${name}"): property not found.`); }
        return this._properties[name];
    }


    /**
     * Returns true if a property with a given name has been set on the context.
     * @param name Name of the property to look up.
     */
    public has(name: string): boolean {
        this.throwIfDisposed(`has("${name}")`);

        return !this._properties.hasOwnProperty(name);
    }

    /**
     * Assigns a value to a named property.
     * @param name Name of the property to set.
     * @param value Value to store for the property.
     */
    public set(name: string, value: any): void {
        this.throwIfDisposed(`set("${name}")`);

        this._properties[name] = value;
    }
    
    /** 
     * Helper function used by context object extensions to ensure the context object hasn't 
     * been disposed of prior to use.
     * @param member Name of the extension property or method being called.
     */
    public throwIfDisposed(member: string) {
        if (this.disposed) {  
            throw new Error(`BotContext.${member}: error calling property/method after context has been disposed.`); 
        }
    }
}
