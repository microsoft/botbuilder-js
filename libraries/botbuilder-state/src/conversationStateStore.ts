/**
 * @module botbuilder-state
 */
/** second comment block */
import { BotContext, Middleware, Activity, ActivityTypes, ConversationResourceResponse, EndOfConversationCodes } from 'botbuilder';
import { Storage } from 'botbuilder-storage';
import { BotState } from './BotState';

export interface ConversationStateStoreSettings {
    /** 
     * Prefix for individual conversations within the store. The default value is 'conversation'. 
     */
    storageKeyPrefix?: string;

    /** 
     * If true the state should be flushed before posts are delivered to the user. The default 
     * value is true. 
     */
    writeBeforePost?: boolean;

    /** 
     * If true the state will be automatically deleted should the bot enconter an error. The 
     * default value is true. 
     */
    deleteOnError?: boolean;

    /** 
     * If true the state will be automatically deleted should the bot send an "endOfConversation"
     * activity to the channel. The default value is true. 
     */
    deleteOnEndOfConversation?: boolean;
}

export class ConversationStateStore implements Middleware {
    private readonly settings: ConversationStateStoreSettings;

    constructor(private storage: Storage, settings?: ConversationStateStoreSettings) {
        this.settings = Object.assign({
            storageKeyPrefix: 'conversation',
            writeBeforePost: true,
            deleteOnError: true
        } as ConversationStateStoreSettings, settings);
    }

    public contextCreated(context: BotContext, next: () => Promise<void>): Promise<void> {
        const ref = context.conversationReference;
        if (ref.conversation && ref.conversation.id) {
            const storageKey = `${(this.settings.storageKeyPrefix || '')}/${ref.channelId}/${ref.conversation.id}`;
            const state = new BotState(this.storage, storageKey);
            context.set('conversation', state);
            return new Promise((resolve, reject) => {
                // NOTE: It looks like we'll potentially write the state back out several times
                //       between the postActivity() and the trailing edge of contextCreated().
                //       The BotState class maintains a hash to avoice multiple writes so it's 
                //       actually ok that we're doing this. 
                state.read()
                    .then(() => next())
                    .then(() => state.write())
                    .then(
                        () => { resolve() },
                        (err) => {
                            if (this.settings.deleteOnError) {
                                state.delete().then(
                                    () => { reject(err) },
                                    () => { reject(err) }
                                );
                            } else {
                                reject(err);
                            }
                        }
                    );
            });
        } else {
            return next();
        }
    }

    public postActivity(context: BotContext, activities: Partial<Activity>[], next: () => Promise<ConversationResourceResponse[]>): Promise<ConversationResourceResponse[]> {
        // Check for endOfConversation
        let eoc = false;
        activities.forEach((a) => {
            if (a.type === ActivityTypes.endOfConversation) { eoc = true }
        });

        const state: BotState = context.get('conversation');
        if (eoc && this.settings.deleteOnEndOfConversation) {
            // Delete state first
            return state.delete()
                .then(() => next());
        } else if (this.settings.writeBeforePost && context.has('conversation')) {
            // Flush state first
            return state.write()
                .then(() => next());
        } else {
            return next();
        }
    }
}

