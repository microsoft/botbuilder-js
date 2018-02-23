"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
class BotStateManager {
    /**
     * Creates a new instance of the state manager.
     *
     * @param settings (Optional) settings to adjust the behavior of the state manager.
     */
    constructor(settings) {
        this.settings = Object.assign({
            persistUserState: true,
            persistConversationState: true,
            writeBeforePost: true,
            lastWriterWins: true
        }, settings || {});
    }
    contextCreated(context, next) {
        // read state from storage
        return this.read(context, []).then(() => next());
    }
    postActivity(context, activities, next) {
        if (this.settings.writeBeforePost) {
            // save state
            return this.write(context, {}).then(() => next());
        }
        else {
            return next();
        }
    }
    contextDone(context, next) {
        // save state
        return this.write(context, {}).then(() => next());
    }
    read(context, keys) {
        // Ensure storage
        if (!context.storage) {
            return Promise.reject(new Error(`BotStateManager: context.storage not found.`));
        }
        // Calculate keys
        if (this.settings.persistUserState) {
            keys.push(this.userKey(context));
        }
        if (this.settings.persistConversationState) {
            keys.push(this.conversationKey(context));
        }
        // Read values
        return context.storage.read(keys).then((data) => {
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
    write(context, changes) {
        // Ensure storage
        if (!context.storage) {
            return Promise.reject(new Error(`BotStateManager: context.storage not found.`));
        }
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
    userKey(context) {
        const ref = context.conversationReference;
        return 'user/' + ref.channelId + '/' + ref.user.id;
    }
    conversationKey(context) {
        const ref = context.conversationReference;
        return 'conversation/' + ref.channelId + '/' + ref.conversation.id;
    }
}
exports.BotStateManager = BotStateManager;
//# sourceMappingURL=botStateManager.js.map