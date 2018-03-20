import { ConversationState, UserState, BotStateSet, Storage, BotContext } from 'botbuilder';

export interface Alarm {
    title: string;
    time: string;
}

export interface AlarmConversation {
    topic?: string;
    alarm?: Partial<Alarm>;
    prompt?: string;
}

export interface AlarmUser {
    alarms: Alarm[];
}

export class BotStateManager extends BotStateSet {
    private _conversation: ConversationState<AlarmConversation>;
    private _user: UserState<AlarmUser>;

    constructor(storage: Storage) {
        super();

        // Create individual state storages
        this._conversation = new ConversationState(storage);
        this._user = new UserState(storage);

        // Add them to base BotStateSet so that they read and write as a pair
        this.use(this._conversation, this._user);
    }

    public conversation(context: BotContext): AlarmConversation {
        // Get cached conversation state
        return this._conversation.get(context);
    }

    public user(context: BotContext): AlarmUser {
        // Get cached user state and ensure initialized
        const user = this._user.get(context);
        if (!user.alarms) { user.alarms = [] }
        return user;
    }
}
