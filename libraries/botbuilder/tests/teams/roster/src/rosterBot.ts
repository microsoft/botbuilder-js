// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    MessageFactory,
    TeamsActivityHandler,
    TeamsInfo,
    TurnContext
} from 'botbuilder';

//
// You need to install this bot in a team. You can @mention the bot "show members", "show channels", or "show details" to get the
// members of the team, the channels of the team, or metadata about the team respectively.
//
export class RosterBot extends TeamsActivityHandler {
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            TurnContext.removeRecipientMention(context.activity);
            const msg = MessageFactory.text(`Echo: ${context.activity.text}`);
            var id = (await TeamsInfo.getTeamDetails(context)).id;

            const response = await TeamsInfo.sendMessageToTeamsChannel(context, msg, id);
            await context.sendActivity(MessageFactory.text(response.toString()));
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

    private async showMembers(context: TurnContext): Promise<void> {
        let options = {"continuationToken": null, "pageSize": 2};
        let teamsChannelAccounts = await (await TeamsInfo.getPagedMembers(context, 5)).members;
        await context.sendActivity(MessageFactory.text(`Total of ${teamsChannelAccounts.length} members are currently in team`));
        let messages = teamsChannelAccounts.map(function(teamsChannelAccount) {
            return `${teamsChannelAccount.aadObjectId} --> ${teamsChannelAccount.name} --> ${teamsChannelAccount.userPrincipalName}`;
        });
        await this.sendInBatches(context, messages);
    }

    private async showChannels(context: TurnContext): Promise<void> {
        let channels = await TeamsInfo.getTeamChannels(context);
        await context.sendActivity(MessageFactory.text(`Total of ${channels.length} channels are currently in team`));
        let messages = channels.map(function(channel) {
            return `${channel.id} --> ${channel.name ? channel.name : 'General'}`;
        });
        await this.sendInBatches(context, messages);
    }

    private async showMember(context: TurnContext): Promise<void> {
        let member = await TeamsInfo.getMember(context, context.activity.from.id);
        await context.sendActivity(MessageFactory.text("You are: " + member.name));
    }

    private async showDetails(context: TurnContext): Promise<void> {
        let teamDetails = await TeamsInfo.getTeamDetails(context);
        await context.sendActivity(MessageFactory.text(`The team name is ${teamDetails.name}. The team ID is ${teamDetails.id}. The AAD GroupID is ${teamDetails.aadGroupId}.`));
    }

    private async sendInBatches(context: TurnContext, messages: string[]): Promise<void> {
        let batch: string[] = [];
        messages.forEach(async (msg: string) => {
            batch.push(msg);
            if (batch.length == 10) {
                await context.sendActivity(MessageFactory.text(batch.join('<br>')));
                batch = [];
            }
        });

        if (batch.length > 0) {
            await context.sendActivity(MessageFactory.text(batch.join('<br>')));
        }
    }
}
