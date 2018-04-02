import { ConversationState, UserState, BotStateSet, TurnContext, Storage } from 'botbuilder';

export interface Alarm {
    title: string;
    time: string;
}

export interface AlarmConversation {
}

export interface AlarmUser {
    alarms: Alarm[];
}

export class BotStateManager extends BotStateSet {
    private _conversation: ConversationState<AlarmConversation>;
    private _user: UserState<AlarmUser>;

    constructor(storage: Storage) {
        super();
        this._conversation = new ConversationState(storage);
        this._user = new UserState(storage);
        this.use(this._conversation, this._user);
    }

    public user(context: TurnContext): AlarmUser {
        // Get cached user state and ensure initialized
        const user = this._user.get(context);
        if (!user.alarms) { user.alarms = [] }
        return user;
    }

    public conversation(context: TurnContext): AlarmConversation {
        // Get cached conversation state
        return this._conversation.get(context);
    }
}
