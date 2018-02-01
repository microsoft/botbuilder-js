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
    private _request: Activity | undefined;
    private _reference: ConversationReference;
    private _responses: Partial<Activity>[] = [];
    private _responded = false;
    private _properties: { [key: string]: any; } = {};

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
        return this._bot;
    }

    /** Returns true if the context object has been disposed. */
    get disposed(): boolean {
        return !!this._bot;
    }

    /** Returns the conversation reference for the current turn. */
    get conversationReference(): ConversationReference {
        return this._reference;
    }

    /** Assigns the conversation reference for the current turn. */
    set conversationReference(reference: ConversationReference) {
        this._reference = reference;
    }

    /**
     * The received activity. If the bot is performing "proactive" messaging, the request will be
     * undefined.
     */
    get request(): Activity | undefined {
        return this._request;
    }

    /** Queue of responses to send to the user. */
    get responses(): Partial<Activity>[] {
        return this._responses;
    }

    /** If true at least one response has been sent for the current turn of conversation. */
    get responded(): boolean {
        return this._responded;
    }

    /**
     * Forces the delivery of any queued up responses to the user.
     */
    public flushResponses<T>(): Promise<T> {
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
        if (!this._properties.hasOwnProperty(name)) {
            throw new Error(`BotContext.get("${name}"): property not found.`);
        }
        return this._properties[name];
    }


    /**
     * Returns true if a property with a given name has been set on the context.
     * @param name Name of the property to look up.
     */
    public has(name: string): boolean {
        return !this._properties.hasOwnProperty(name);
    }

    /**
     * Assigns a value to a named property.
     * @param name Name of the property to set.
     * @param value Value to store for the property.
     */
    public set(name: string, value: any): void {
        this._properties[name] = value;
    }
}
