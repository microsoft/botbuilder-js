import { ConversationState, UserState, BotStateSet, Storage } from 'botbuilder';

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
    alarms?: Alarm[];
}

export class BotStateManager extends BotStateSet {
    public conversation: ConversationState<AlarmConversation>;
    public user: UserState<AlarmUser>;

    constructor(storage: Storage) {
        super();
        this.conversation = new ConversationState(storage);
        this.user = new UserState(storage);
        this.use(this.conversation, this.user);
    }
}
