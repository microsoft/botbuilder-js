/**
 * @module botbuilder
 */
/** second comment block */
import { Middleware } from './middleware';
import { Activity, ConversationResourceResponse } from './activity';
import { StoreItem, StoreItems } from './storage';


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
export class BotStateManager implements Middleware {
    private settings: BotStateManagerSettings;

    /**
     * Creates a new instance of the state manager.
     *
     * @param settings (Optional) settings to adjust the behavior of the state manager. 
     */
    public constructor(settings?: Partial<BotStateManagerSettings>) {
        this.settings = Object.assign(<BotStateManagerSettings>{ 
            persistUserState: true,
            persistConversationState: true,
            writeBeforePost: true,
            lastWriterWins: true
        }, settings || {});
    }

    public contextCreated(context: BotContext, next: () => Promise<void>): Promise<void> {
        // read state from storage
        return this.read(context, []).then(() => next());
    }

    public postActivity(context: BotContext, activities: Partial<Activity>[], next: (newActivities?: Partial<Activity>[]) => Promise<ConversationResourceResponse[]>): Promise<ConversationResourceResponse[]> {
        if (this.settings.writeBeforePost) {
            // save state 
            return this.write(context, {}).then(() => next());
        } else {
            return next();
        }
    }

    public contextDone(context: BotContext, next: () => Promise<void>): Promise<void> {
        // save state 
        return this.write(context, {}).then(() => next());
    }

    protected read(context: BotContext, keys: string[]): Promise<StoreItems> {
        // Ensure storage
        if (!context.storage) { return Promise.reject(new Error(`BotStateManager: context.storage not found.`)); }

        // Calculate keys
        if (this.settings.persistUserState) {
            keys.push(this.userKey(context));
        }
        if (this.settings.persistConversationState) {
            keys.push(this.conversationKey(context));
        }

        // Read values
        return context.storage.read(keys).then((data: StoreItem) => {
            // Copy data to context
            keys.forEach((key) => {
                switch (key.split('/')[0]) {
                    case 'user':
                        context.state.user = data[key] || {};
                        break;
                    case 'conversation':
                        context.state.conversation = data[key] || {};
                        break;
                }
            });
            return data;
        });
    }

    protected write(context: BotContext, changes: StoreItems): Promise<void> {
        // Ensure storage
        if (!context.storage) { return Promise.reject(new Error(`BotStateManager: context.storage not found.`)); }

        // Append changes
        if (this.settings.persistUserState) {
            changes[this.userKey(context)] = context.state.user || {};
        }
        if (this.settings.persistConversationState) {
            changes[this.conversationKey(context)] = context.state.conversation || {};
        }

        // Update eTags
        if (this.settings.lastWriterWins) { 
            for (const key in changes) {
                changes[key].eTag = '*';
            }
        }

        // Write changes
        return context.storage.write(changes);
    }

    private userKey(context: BotContext): string {
        const ref = context.conversationReference;
        return 'user/' + ref.channelId + '/' + (<any>ref.user).id;
    }

    private conversationKey(context: BotContext): string {
        const ref = context.conversationReference;
        return 'conversation/' + ref.channelId + '/' + (<any>ref.conversation).id;
    }
}

