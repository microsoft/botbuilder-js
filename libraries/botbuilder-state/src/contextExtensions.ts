/**
 * @module botbuilder-state
 */
/** second comment block */
import { BotContext } from 'botbuilder';
import { StoreItem } from 'botbuilder-storage';
import { BotState } from './botState';

declare global {
    export interface BotContextExtensions {
        readonly user: BotState<UserState>;
        readonly conversation: BotState<ConversationState>;
    }

    export interface ConversationState extends StoreItem {
        
    }

    export interface UserState extends StoreItem {
        
    }
}


Object.defineProperty(BotContext.prototype, 'conversation', {
    get: function getConversation() {
        const context: BotContext = this as any;
        if (!context.has('conversation')) {
            if (context.conversationReference.conversation && context.conversationReference.conversation.id) {
                throw new Error(`BotContext.conversation: state not found. The ConversationStateStore middleware wasn't added to your bot.`); 
            } else {
                throw new Error(`BotContext.conversation: state not found. The request or conversationReference does not contain a valid conversation ID.`); 
            }
        }
        return context.get('conversation');
    }
});

Object.defineProperty(BotContext.prototype, 'user', {
    get: function getUser() {
        const context: BotContext = this as any;
        if (!context.has('user')) {
            if (context.conversationReference.user && context.conversationReference.user.id) {
                throw new Error(`BotContext.user: state not found. The ConversationStateStore middleware wasn't added to your bot.`); 
            } else {
                throw new Error(`BotContext.user: state not found. The request or conversationReference does not contain a valid user ID.`); 
            }
        }
        return context.get('user');
    }
});
