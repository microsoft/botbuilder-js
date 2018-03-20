"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_core_1 = require("botbuilder-core");
const cacheKey = Symbol('batch');
/**
 * :package: **botbuilder-core-extensions**
 *
 * A fluent style mechanism for composing a batch of outgoing activities.  You can use this class
 * on its own anywhere within your bot and you will just need to ensure that you call [flush()](#flush)
 * before the turn completes:
 *
 * ```javascript
 *  return new BatchOutput(context)
 *      .typing()
 *      .delay(1000)
 *      .reply(`Hi... What's your name?`)
 *      .flush();
 * ```
 *
 * The other option is to use this class as a piece of middleware. This will add a new
 * `context.batch` property which you can use to call any of the methods below. It will also
 * automatically flush all queued responses upon completion of the turn, eliminating the need to
 * explicitly call flush:
 *
 * ```javascript
 *  adapter.use(new BatchOutput());
 *
 *  adapter.processRequest(req, res, (context) => {
 *      context.batch.reply(`Hello World`);
 *  });
 * ```
 *
 * For TypeScript users you can use a custom interface that extends the `BotContext` interface to
 * get full intellisense for the added property:
 *
 * ```javascript
 *  interface MyContext extends BotContext {
 *      readonly batch: BatchOutput;
 *  }
 *
 *  adapter.use(new BatchOutput());
 *
 *  adapter.processRequest(req, res, (context: MyContext) => {
 *      context.batch.reply(`Hello World`);
 *  });
 * ```
 *
 * The class supports mixed modes of usage so it's fine to both use it as middleware and then
 * create a new instance of the class somewhere else within your bots logic or within other
 * middleware.
 */
class BatchOutput {
    /**
     * Creates a new BatchOutput instance.
     * @param context (Optional) context for the current turn of conversation. This can be omitted when creating an instance of the class to use as middleware.
     */
    constructor(context) {
        this.context = context;
    }
    /** INTERNAL called by the adapter when used as middleware. */
    onProcessRequest(context, next) {
        // Extend context with batch property
        const batch = new BatchOutput(context);
        Object.defineProperties(context, {
            batch: { get: () => batch }
        });
        // Continue execution and flush upon completion
        return next().then(() => batch.flush()).then(() => { });
    }
    /**
     * Adds a delay to the batch. This can be used to pause after sending a typing indicator or
     * after sending a card with image(s).
     *
     * Most chat clients download any images sent by the bot to a CDN which can delay the showing
     * of the message to the user.  If a bot sends a message with only text immediately after
     * sending a message with images, the messages could end up being shown to the user out of
     * order. To help prevent this you can insert a delay of 2 seconds or so in between replies.
     * @param ms Number of milliseconds to pause before delivering the next activity in the batch.
     */
    delay(ms) {
        this.add({ type: 'delay', value: ms });
        return this;
    }
    /**
     * Adds an `endOfConversation` activity to the batch indicating that the bot has completed
     * it's current task or skill.  For channels like Cortana this is used to tell Cortana that the
     * skill has completed and the skills window should close.
     *
     * When used in conjunction with the `ConversationState` middleware, sending an `endOfConversation`
     * activity will cause the bots conversation state to be automatically cleared. If you're
     * building a Cortana skill this helps ensure that the next time your skill is invoked it
     * will be in a clean state given that you won't always get a new conversation ID in between
     * invocations.
     *
     * Even for non-Cortana bots it's a good practice to send an `endOfConversation` anytime you
     * complete a task with the user as it will give your bot a chance to clear its conversation
     * state and helps avoid your bot getting into a bad state for a conversation.
     * @param code (Optional) code to indicate why the bot/skill is ending. Defaults to
     * `EndOfConversationCodes.CompletedSuccessfully`.
     */
    endOfConversation(code) {
        if (code === undefined) {
            code = botbuilder_core_1.EndOfConversationCodes.CompletedSuccessfully;
        }
        this.add({ type: botbuilder_core_1.ActivityTypes.EndOfConversation, code: code });
        return this;
    }
    /**
     * Adds an `event` activity to the batch. This is most useful for DirectLine and WebChat
     * channels as a way for the bot to send a custom named event to the client.
     * @param name Name of the event being sent.
     * @param value (Optional) value to include with the event.
     */
    event(name, value) {
        this.add({ type: botbuilder_core_1.ActivityTypes.Event, name: name, value: value });
        return this;
    }
    /**
     * Flushes the batch causing all activities in the batch to be immediately sent to the user.
     */
    flush() {
        try {
            const responses = this.batch().slice();
            const count = responses.length;
            if (count > 0) {
                return botbuilder_core_1.BotContext.prototype.sendActivity.apply(this.context, responses).then((responses) => {
                    this.batch().splice(0, count);
                    return responses;
                });
            }
            return Promise.resolve([]);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    reply(textOrActivity, speak, inputHint) {
        const activity = typeof textOrActivity === 'string' ? { text: textOrActivity } : textOrActivity;
        if (!activity.type) {
            activity.type = botbuilder_core_1.ActivityTypes.Message;
        }
        if (speak) {
            activity.speak = speak;
        }
        if (inputHint) {
            activity.inputHint = inputHint;
        }
        this.add(activity);
        return this;
    }
    /**
     * Adds a `typing` activity to the batch.
     */
    typing() {
        this.add({ type: botbuilder_core_1.ActivityTypes.Typing });
        return this;
    }
    add(activity) {
        this.batch().push(activity);
        this.context.responded = true;
    }
    batch() {
        if (!this.context) {
            throw new Error(`BatchOutput: no context object. Pass in a context object to use BatchOutput directly, outside of middleware.`);
        }
        if (!this.context.has(cacheKey)) {
            this.context.set(cacheKey, []);
        }
        return this.context.get(cacheKey);
    }
}
exports.BatchOutput = BatchOutput;
//# sourceMappingURL=batchOutput.js.map