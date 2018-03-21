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
     * @param context (Optional) context for the current turn of conversation. This can be omitted when creating an instance of the class to use as middleware.
     */
    constructor(context?: BotContext);
    /** INTERNAL called by the adapter when used as middleware. */
    onProcessRequest(context: BotContext, next: () => Promise<void>): Promise<void>;
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
    delay(ms: number): this;
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
    endOfConversation(code?: EndOfConversationCodes | string): this;
    /**
     * Adds an `event` activity to the batch. This is most useful for DirectLine and WebChat
     * channels as a way for the bot to send a custom named event to the client.
     * @param name Name of the event being sent.
     * @param value (Optional) value to include with the event.
     */
    event(name: string, value?: any): this;
    /**
     * Flushes the batch causing all activities in the batch to be immediately sent to the user.
     */
    flush(): Promise<ResourceResponse[]>;
    /**
     * Adds a `message` activity to the batch.
     * @param textOrActivity Text or activity to add to the batch. If text a new `message` activity will be created. If an activity and missing a `type`, the type will be set to `message`.
     * @param speak (Optional) SSML to add to the activity.
     * @param inputHint (Optional) `inputHint` to assign to the activity.
     */
    reply(textOrActivity: string, speak?: string, inputHint?: string): this;
    reply(textOrActivity: Partial<Activity>): this;
    /**
     * Adds a `typing` activity to the batch.
     */
    typing(): this;
    private add(activity);
    private batch();
}
