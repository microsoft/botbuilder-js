/**
 * @module botbuilder
 */
/** second comment block */
import { Activity, ConversationReference } from './activity';
import { Bot } from './bot';
declare global  {
    interface BotContextExtensions {
    }
}
export interface BotContext extends BotContextExtensions {
}
export declare class BotContext {
    private _bot;
    private _request;
    private _reference;
    private _responses;
    private _responded;
    private _properties;
    /**
     * Creates a new bot context instance.
     * @param bot Bot the context was created for.
     * @param request (Optional) request that was received by the bots adapter.
     */
    constructor(bot: Bot, request?: Partial<Activity>);
    /** The Bot object for this context. */
    readonly bot: Bot;
    /** Returns true if the context object has been disposed. */
    readonly disposed: boolean;
    /** Returns the conversation reference for the current turn. */
    /** Assigns the conversation reference for the current turn. */
    conversationReference: ConversationReference;
    /**
     * The received activity. If the bot is performing "proactive" messaging, the request will be
     * undefined.
     */
    readonly request: Activity | undefined;
    /** Queue of responses to send to the user. */
    readonly responses: Partial<Activity>[];
    /** If true at least one response has been sent for the current turn of conversation. */
    readonly responded: boolean;
    /**
     * INTERNAL disposes of the context object, making it unusable. Calling any properties or
     * methods off a disposed of context will result in an exception being thrown.
     */
    dispose(): void;
    /**
     * Forces the delivery of any queued up responses to the user.
     */
    flushResponses<T>(): Promise<T>;
    /**
     * Returns the value of a previously set property. An exception will be thrown if the property
     * hasn't been set yet.
     * @param name Name of the property to return.
     */
    get<T = any>(name: string): T;
    /**
     * Returns true if a property with a given name has been set on the context.
     * @param name Name of the property to look up.
     */
    has(name: string): boolean;
    /**
     * Assigns a value to a named property.
     * @param name Name of the property to set.
     * @param value Value to store for the property.
     */
    set(name: string, value: any): void;
    /**
     * Helper function used by context object extensions to ensure the context object hasn't
     * been disposed of prior to use.
     * @param member Name of the extension property or method being called.
     */
    throwIfDisposed(member: string): void;
}
