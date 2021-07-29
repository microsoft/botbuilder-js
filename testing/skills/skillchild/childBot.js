
const { ActivityHandler } = require('botbuilder');

class ChildBot extends ActivityHandler {

    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[ChilidBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[ChilidBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[ChilidBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;

        this.onMessage(async (context, next) => {
            if(context.activity.channelId !== 'emulator') {
                if(context.activity.text === 'skill login') {
                    await this.conversationState.load(context, true);
                    await this.userState.load(context, true);
                    await this.dialog.run(context, this.conversationState.createProperty('DialogState'));                 
                }
                else if(context.activity.text === 'skill logout') {
                    await context.adapter.signOutUser(context, process.env.ConnectionName);
                    context.sendActivity('logout from child bot successful');
                }
            }
            else {
                await context.sendActivity('hello from child');
            }
            await next();
        });
    }

    async run(context) {
        await super.run(context);

        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }

    async onSignInInvoke(context) {
        await this.conversationState.load(context, true);
        await this.userState.load(context, true);
        await this.dialog.run(context, this.conversationState.createProperty('DialogState'));
    }
}

module.exports.ChildBot = ChildBot;
