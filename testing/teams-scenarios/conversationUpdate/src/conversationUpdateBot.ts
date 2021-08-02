// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    CardFactory,
    ChannelAccount,
    ChannelInfo,
    MessageFactory,
    TeamInfo,
    TeamsActivityHandler,
    TurnContext,
} from 'botbuilder';

/**
 * This bot must be added to a team. You might need to create your own team so you can modify the channel information.
 * From the UI you can click the 3 dots on the team level, or the channel level to add, rename, or delete the channel/team.
 * You can go to the "manage team" option at the team level to add/remove people.
 */
export class ConversationUpdateBot extends TeamsActivityHandler {
    /**
     * Initializes a new instance of the [ConversationUpdateBot](xref:conversation-update.ConversationUpdateBot) class.
     */
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity('You said ' + context.activity.text);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        this.onTeamsChannelRenamedEvent(async (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Channel Renamed', `${channelInfo.name} is the new Channel name`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
        this.onTeamsChannelCreatedEvent(async (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Channel Created', `${channelInfo.name} is the Channel created`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
        this.onTeamsChannelDeletedEvent(async (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Channel Deleted', `${channelInfo.name} is the Channel deleted`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
        this.onTeamsTeamRenamedEvent(async (teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Team Renamed', `${teamInfo.name} is the new Team name`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
        this.onTeamsMembersAddedEvent(async (membersAdded: ChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            let newMembers: string = '';
            console.log(JSON.stringify(membersAdded));
            membersAdded.forEach((account) => {
                newMembers += account.id + ' ';
            });
            const name = !teamInfo ? 'not in team' : teamInfo.name;
            const card = CardFactory.heroCard('Account Added', `${newMembers} joined ${name}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
        this.onTeamsMembersRemovedEvent(async (membersRemoved: ChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            let removedMembers: string = '';
            console.log(JSON.stringify(membersRemoved));
            membersRemoved.forEach((account) => {
                removedMembers += account.id + ' ';
            });
            const name = !teamInfo ? 'not in team' : teamInfo.name;
            const card = CardFactory.heroCard('Account Removed', `${removedMembers} removed from ${teamInfo.name}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
    }
}
