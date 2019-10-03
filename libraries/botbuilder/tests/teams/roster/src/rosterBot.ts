// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    Attachment,
    CardFactory,
    TeamsActivityHandler,
    TurnContext
} from 'botbuilder';

export class RosterBot extends TeamsActivityHandler {
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(this.createReply(context.activity, `Echo: ${context.activity.text}this.createReply(context.activity)`));
            TurnContext.removeRecipientMention(context.activity);

            switch (context.activity.text)
            {
                case "show members":
                    await this.showMembers(context);
                    break;

                case "show channels":
                    await this.showChannels(context);
                    break;

                case "show details":
                    await this.showDetails(context);
                    break;

                default:
                    await context.sendActivity(this.createReply(context.activity, 
                        'Invalid command. Type "Show channels" to see a channel list. Type "Show members" to see a list of members in a team. ' +
                        'Type "show group chat members" to see members in a group chat.'));
                    break;
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    } 
    
    private createReply(activity, text = null, locale = null) : Activity {
        return {
            type: 'message',
            from: { id: activity.recipient.id, name: activity.recipient.name },
            recipient: { id: activity.from.id, name: activity.from.name },
            replyToId: activity.id,
            serviceUrl: activity.serviceUrl,
            channelId: activity.channelId,
            conversation: { isGroup: activity.conversation.isGroup, id: activity.conversation.id, name: activity.conversation.name },
            text: text || '',
            locale: locale || activity.locale
        } as Activity;
    }

    private async showMembers(context: TurnContext): Promise<void> {
        let teamsChannelAccounts = await this.getMembers(context);
        let replyActivity = this.createReply(context.activity, `Total of ${teamsChannelAccounts.length} members are currently in team`);
        await context.sendActivity(replyActivity);

        var messages = teamsChannelAccounts.map(function(teamsChannelAccount){
            return `${teamsChannelAccount.AadObjectId} --> ${teamsChannelAccount.Name} --> ${teamsChannelAccount.UserPrincipalName}`;
        });

        await this.sendInBatches(context, messages);
    }
    
    private async showChannels(context: TurnContext): Promise<void> { 
        let channels = await this.getChannels(context);
        await context.sendActivity(this.createReply(context.activity, `Total of ${channels.length} channels are currently in team`));

        var messages = channels.map(function(channel){
            return `${channel.aadObjectId} --> ${channel.name} --> ${channel.userPrincipalName}`;
        });

        await this.sendInBatches(context, messages);
    }
   
    private async showDetails(context: TurnContext): Promise<void> {
        let teamDetails = await this.getTeamDetails(context);
        var replyActivity = this.createReply(context.activity, `The team name is ${teamDetails.Name}. The team ID is ${teamDetails.Id}. The AAD GroupID is ${teamDetails.AadGroupId}.`);
        await context.sendActivity(replyActivity);
    }

    private async getMembers(context: TurnContext): Promise<any[]> {
        return null;
    }

    private async getChannels(context: TurnContext): Promise<any[]> {
        return null;
    }

    private async getTeamDetails(context: TurnContext): Promise<any> {
        return null;
    }

    private async sendInBatches(context: TurnContext, messages: string[]): Promise<void> {
        let batch: string[] = [];
        messages.forEach(async (msg: string) => {
            batch.push(msg);
            if (batch.length == 10) {
                await context.sendActivity(this.createReply(context.activity, batch.join('<br>')));
                batch = [];
            }
        });

        if (batch.length > 0)
        {
            await context.sendActivity(this.createReply(context.activity, batch.join('<br>')));
        }
    }
}
