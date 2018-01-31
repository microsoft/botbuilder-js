/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware } from './middleware';
import { Activity, ConversationResourceResponse } from './activity';
import { StoreItems } from './storage';
/** Optional settings used to configure a BotStateManager instance. */
export interface BotStateManagerSettings {
    /** If true `context.state.user` will be persisted. The default value is true. */
    persistUserState: boolean;
    /** If true `context.state.conversation` will be persisted. The default value is true. */
    persistConversationState: boolean;
    /** If true state information will be persisted before outgoing activities are sent to the user. The default value is true. */
    writeBeforePost: boolean;
    /** If true the eTag's for user & conversation state will be set to '*' before writing to storage. The default value is true. */
    lastWriterWins: boolean;
}
/**
 * Middleware for tracking conversation and user state using the `context.storage` provider.
 *
 * __Extends BotContext:__
 * * context.state.user - User persisted state
 * * context.state.conversation - Conversation persisted data
 *
 * __Depends on:__
 * * context.storage - Storage provider for storing and retrieving objects
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new MemoryStorage())
 *      .use(new BotStateManager())
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
export declare class BotStateManager implements Middleware {
    private settings;
    /**
     * Creates a new instance of the state manager.
     *
     * @param settings (Optional) settings to adjust the behavior of the state manager.
     */
    constructor(settings?: Partial<BotStateManagerSettings>);
    contextCreated(context: BotContext, next: () => Promise<void>): Promise<void>;
    postActivity(context: BotContext, activities: Partial<Activity>[], next: (newActivities?: Partial<Activity>[]) => Promise<ConversationResourceResponse[]>): Promise<ConversationResourceResponse[]>;
    contextDone(context: BotContext, next: () => Promise<void>): Promise<void>;
    protected read(context: BotContext, keys: string[]): Promise<StoreItems>;
    protected write(context: BotContext, changes: StoreItems): Promise<void>;
    private userKey(context);
    private conversationKey(context);
}
