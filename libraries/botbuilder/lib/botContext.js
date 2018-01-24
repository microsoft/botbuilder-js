"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/** second comment block */
const activity_1 = require("./activity");
const bot_1 = require("./bot");
class BotContext {
    /**
     * Creates a new bot context instance.
     * @param bot Bot the context was created for.
     * @param request (Optional) request that was received by the bots adapter.
     */
    constructor(bot, request) {
        this._responses = [];
        this._responded = false;
        this._properties = {};
        this._bot = bot;
        this._request = request;
        if (request) {
            this._reference = activity_1.getConversationReference(request);
        }
    }
    /** The Bot object for this context. */
    get bot() {
        this.throwIfDisposed('bot');
        return this._bot;
    }
    /** Returns true if the context object has been disposed. */
    get disposed() {
        return !!this._bot;
    }
    /** Returns the conversation reference for the current turn. */
    get conversationReference() {
        this.throwIfDisposed('conversationReference');
        return this._reference;
    }
    /** Assigns the conversation reference for the current turn. */
    set conversationReference(reference) {
        this.throwIfDisposed('conversationReference');
        this._reference = reference;
    }
    /**
     * The received activity. If the bot is performing "proactive" messaging, the request will be
     * undefined.
     */
    get request() {
        this.throwIfDisposed('request');
        return this._request;
    }
    /** Queue of responses to send to the user. */
    get responses() {
        this.throwIfDisposed('responses');
        return this._responses;
    }
    /** If true at least one response has been sent for the current turn of conversation. */
    get responded() {
        this.throwIfDisposed('responded');
        return this._responded;
    }
    /**
     * INTERNAL disposes of the context object, making it unusable. Calling any properties or
     * methods off a disposed of context will result in an exception being thrown.
     */
    dispose() {
        ['_bot', '_request', '_reference', '_responses', '_properties'].forEach((prop) => {
            this[prop] = undefined;
        });
    }
    ;
    /**
     * Forces the delivery of any queued up responses to the user.
     */
    flushResponses() {
        this.throwIfDisposed('flushResponses()');
        const args = this._responses.slice(0);
        const cnt = args.length;
        args.unshift(this);
        return bot_1.Bot.prototype.post.apply(this._bot, args)
            .then((results) => {
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
    get(name) {
        this.throwIfDisposed(`get("${name}")`);
        if (!this._properties.hasOwnProperty(name)) {
            throw new Error(`BotContext.get("${name}"): property not found.`);
        }
        return this._properties[name];
    }
    /**
     * Returns true if a property with a given name has been set on the context.
     * @param name Name of the property to look up.
     */
    has(name) {
        this.throwIfDisposed(`has("${name}")`);
        return !this._properties.hasOwnProperty(name);
    }
    /**
     * Assigns a value to a named property.
     * @param name Name of the property to set.
     * @param value Value to store for the property.
     */
    set(name, value) {
        this.throwIfDisposed(`set("${name}")`);
        this._properties[name] = value;
    }
    /**
     * Helper function used by context object extensions to ensure the context object hasn't
     * been disposed of prior to use.
     * @param member Name of the extension property or method being called.
     */
    throwIfDisposed(member) {
        if (this.disposed) {
            throw new Error(`BotContext.${member}: error calling property/method after context has been disposed.`);
        }
    }
}
exports.BotContext = BotContext;
//# sourceMappingURL=botContext.js.map