const { ConversationState, UserState, BotStateSet } = require('botbuilder');

//-------------------------------------
// Shape of Data Structures
//-------------------------------------
//
// interface Alarm {
//     title: string;
//     time: string;
// }
//
// interface AlarmConversation {
//     topic?: string;
//     alarm?: Partial<Alarm>;
//     prompt?: string;
// }
//
// interface AlarmUser {
//     alarms: Alarm[];
// }
//
//-------------------------------------

class BotStateManager extends BotStateSet {
    constructor(storage) {
        super();

        // Create individual state storages
        this._conversation = new ConversationState(storage);
        this._user = new UserState(storage);

        // Add them to base BotStateSet so that they read and write as a pair
        this.use(this._conversation, this._user);
    }

    conversation(context) {
        // Get cached conversation state
        return this._conversation.get(context);
    }

    user(context) {
        // Get cached user state and ensure initialized
        const user = this._user.get(context);
        if (!user.alarms) { user.alarms = [] }
        return user;
    }
}
module.exports.BotStateManager = BotStateManager;