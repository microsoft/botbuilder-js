/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext, Middleware, Activity, EndOfConversationCodes, ResourceResponse } from 'botbuilder-core';
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
export declare class BatchOutput implements Middleware {
    private context;
    /**
     * Creates a new BatchOutput instance.
     */
    constructor(context?: BotContext | undefined);
    onProcessRequest(context: BotContext, next: () => Promise<void>): Promise<void>;
    delay(ms: number): this;
    endOfConversation(code?: EndOfConversationCodes | string): this;
    event(value?: any): this;
    flush(): Promise<ResourceResponse[]>;
    reply(textOrActivity: Partial<Activity>): this;
    reply(textOrActivity: string, speak?: string, inputHint?: string): this;
    typing(): this;
    private batch();
}
