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
     */
    constructor(context) {
        this.context = context;
    }
    onProcessRequest(context, next) {
        // Extend context with batch property
        const batch = new BatchOutput(context);
        Object.defineProperties(context, {
            batch: { get: () => batch }
        });
        // Continue execution and flush upon completion
        return next().then(() => batch.flush()).then(() => { });
    }
    delay(ms) {
        this.batch().push({ type: 'delay', value: ms });
        return this;
    }
    endOfConversation(code) {
        if (code === undefined) {
            code = botbuilder_core_1.EndOfConversationCodes.CompletedSuccessfully;
        }
        this.batch().push({ type: botbuilder_core_1.ActivityTypes.EndOfConversation, code: code });
        return this;
    }
    event(value) {
        this.batch().push({ type: botbuilder_core_1.ActivityTypes.Event, value: value });
        return this;
    }
    flush() {
        try {
            const responses = this.batch().slice();
            const count = responses.length;
            if (count > 0) {
                return botbuilder_core_1.BotContext.prototype.sendActivities.apply(this.context, responses).then((responses) => {
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
        this.batch().push(activity);
        return this;
    }
    typing() {
        this.batch().push({ type: botbuilder_core_1.ActivityTypes.Typing });
        return this;
    }
    batch() {
        if (!this.context) {
            throw new Error(`BatchOutput: no context object. Pass in a context object to use BatchOutput directly, outside of middleware.`);
        }
        if (!this.context.has('batch')) {
            this.context.set('batch', []);
        }
        return this.context.get('batch');
    }
}
exports.BatchOutput = BatchOutput;
//# sourceMappingURL=batchOutput.js.map