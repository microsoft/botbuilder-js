
const { ActivityHandler, ActivityTypes, DeliveryModes, TurnContext, BotFrameworkHttpClient } = require('botbuilder');
const { SimpleCredentialProvider } = require('botframework-connector');

class ParentBot extends ActivityHandler {

    constructor() {
        super();

        const client = new BotFrameworkHttpClient(new SimpleCredentialProvider('', ''));

        this.onMessage(async (context, next) => {

            await context.sendActivity('parent: before child');

            var activity = { type: ActivityTypes.Message, text: 'parent to child' };
            TurnContext.applyConversationReference(activity, TurnContext.getConversationReference(context.activity), true);
            activity.deliveryMode = DeliveryModes.BufferedReplies;

            var response = await client.postActivity(
                null,
                'toBotId',
                'http://localhost:3979/api/messages',
                'http://tempuri.org/whatever',
                'random-guid',
                activity);

            if (response.status == 200)
            {
                await context.sendActivities(response.body);
            }

            await context.sendActivity('parent: after child');

            await next();
        });
    }
}

module.exports.ParentBot = ParentBot;

