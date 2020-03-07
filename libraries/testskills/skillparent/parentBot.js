
const { ActivityHandler, ActivityTypes, DeliveryModes, TurnContext, BotFrameworkHttpClient, MessageFactory, StatusCodes, CardFactory } = require('botbuilder');
const { SimpleCredentialProvider } = require('botframework-connector');

class ParentBot extends ActivityHandler {

    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[ParentBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[ParentBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[ParentBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;

        const client = new BotFrameworkHttpClient(new SimpleCredentialProvider(process.env.MicrosoftAppId, process.env.MicrosoftAppPassword));

        this.onMessage(async (context, next) => {

            if(context.activity.channelId !== 'emulator') {
                const matched = /(\d{6})/.exec(context.activity.text);
                if(context.activity.text === 'login' || (matched && matched.length > 1)) {
                    // start an oauth prompt
                    await this.conversationState.load(context, true);
                    await this.userState.load(context, true);
                    await this.dialog.run(context, this.conversationState.createProperty('DialogState'));
                }
                else if(context.activity.text === 'logout') {
                    await context.adapter.signOutUser(context, process.env.ConnectionName);
                }
                else if( context.activity.text === 'skill login' || context.activity.text === 'skill logout') {
                    let cloneActivity = MessageFactory.text(context.activity.text);
                    TurnContext.applyConversationReference(cloneActivity, TurnContext.getConversationReference(context.activity), true);
                    cloneActivity.deliveryMode = DeliveryModes.BufferedReplies;
                    const skillResponse = await client.postActivity(
                        process.env.MicrosoftAppId,
                        process.env.SkillMicrosoftAppId,
                        'http://localhost:3979/api/messages',
                        'http://localhost:3978/api/messages',
                        context.activity.conversation.id,
                        cloneActivity
                    );

                    if(skillResponse.status === StatusCodes.OK) {
                        if(!(await this.interceptOAuthCards(skillResponse.body, context, client))) {
                            await context.sendActivities(skillResponse.body);
                        }
                    }
                }
                else {
                    await context.sendActivity(`Bot: ${ context.activity.text }`);
                }
            }
            else {
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
            }

            await next();
        });
    }

    async run(context) {
        await super.run(context);

        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }

    async interceptOAuthCards(activities, context,client) {
        if(activities.length === 0) {
            return false;
        }
        const activity = activities[0];
        if(activity.attachments) {
            const oauthCardAttachments = activity.attachments.filter(a => a.contentType === CardFactory.contentTypes.oauthCard);
            for(let i = 0; i < oauthCardAttachments.length; i++ ) {
                const attachment = oauthCardAttachments[i];
                if(attachment.content.tokenExchangeResource) {
                    const result = await context.adapter.exchangeToken(
                        context,
                        process.env.ConnectionName,
                        context.activity.from.id,
                        {
                            uri: attachment.content.tokenExchangeResource.uri
                        });
                    if(result && result.token) {
                        return await this.sendTokenExchangeInvokeToSkill(context, activity, attachment.content.tokenExchangeResource.id, result.token,client);
                    }
                }
            }
        }
        return false;
    }

    async sendTokenExchangeInvokeToSkill(context, incomingActivity, id, token,client) {
        const activity = this.createReply(incomingActivity);
        activity.type = ActivityTypes.Invoke;
        activity.name = 'signin/tokenExchange';
        activity.value = {
            id,
            token
        };

        //route the activity to the skill
        const skillResponse = await client.postActivity(
            process.env.MicrosoftAppId,
            process.env.SkillMicrosoftAppId,
            'http://localhost:3979/api/messages',
            'http://localhost:3978/api/messages',
            context.activity.conversation.id,
            activity 
        );
        const success = skillResponse.status >= 200 && skillResponse.status <= 299;
        if(success) {
            await context.sendActivity('Skill token exchange successful');
        }
        else {
            await context.sendActivity('Skill token exchange failed');
        }
        return success;
    }

    createReply(activity, text, locale = null) {
        return {
            type: ActivityTypes.Message,
            from: { id: activity.recipient.id, name: activity.recipient.name },
            recipient: { id: activity.from.id, name: activity.from.name },
            replyToId: activity.id,
            serviceUrl: activity.serviceUrl,
            channelId: activity.channelId,
            conversation: { isGroup: activity.conversation.isGroup, id: activity.conversation.id, name: activity.conversation.name },
            text: text || '',
            locale: locale || activity.locale
        };
    }
}

module.exports.ParentBot = ParentBot;

