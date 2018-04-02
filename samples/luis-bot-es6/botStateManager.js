const { ConversationState, UserState, BotStateSet, TurnContext, Storage } = require('botbuilder');

class BotStateManager extends BotStateSet {

    constructor(storage) {
        super();
        this._conversation = new ConversationState(storage);
        this._user = new UserState(storage);
        this.use(this._conversation, this._user);
    }

    user(context) {
        // Get cached user state and ensure initialized
        const user = this._user.get(context);
        if (!user.reminders) { user.reminders = [] }
        return user;
    }

    conversation(context) {
        // Get cached conversation state
        return this._conversation.get(context);
    }
}

module.exports = BotStateManager;