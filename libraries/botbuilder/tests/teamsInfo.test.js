const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const { BotFrameworkAdapter, TeamsInfo, CloudAdapter } = require('../');
const { Conversations } = require('botframework-connector/lib/connectorApi/operations');
const { MicrosoftAppCredentials, ConnectorClient } = require('botframework-connector');
const { TurnContext, MessageFactory, ActionTypes, Channels } = require('botbuilder-core');

class TeamsInfoAdapter extends BotFrameworkAdapter {
    constructor() {
        super({ appId: 'appId', appPassword: 'appPassword' });
    }
}

class TestContext extends TurnContext {
    constructor(activity, adapter) {
        super(adapter || new TeamsInfoAdapter(), activity);
    }
}

class TestCreateConversationAdapter extends CloudAdapter {
    appId;
    channelId;
    serviceUrl;
    audience;
    conversationParameters;

    constructor(activityId, conversationId) {
        super();
        this.activityId = activityId;
        this.conversationId = conversationId;
    }

    async createConversationAsync(botAppId, channelId, serviceUrl, audience, conversationParameters, callback) {
        this.appId = botAppId;
        this.channelId = channelId;
        this.serviceUrl = serviceUrl;
        this.audience = audience;
        this.conversationParameters = conversationParameters;

        const activity = {
            id: this.activityId,
            conversation: {
                id: this.conversationId,
            },
        };

        const mockTurnContext = {
            activity,
        };

        callback(mockTurnContext);
    }
}

const oneOnOneActivity = {
    text: 'Hello World!',
    type: 'message',
    id: 'oneOnOneActivityId',
    channelId: 'msteams',
    serviceUrl: 'https://smba.trafficmanager.net/amer/',
    from: {
        id: '29:User-One-Id',
        name: 'User One',
        aadObjectId: 'User-aadObjectId',
    },
    conversation: {
        conversationType: 'personal',
        tenantId: 'tenantId-Guid',
        id: 'a:oneOnOneConversationId',
    },
    recipient: {
        id: '28:teamsbot-Guid',
        name: 'Teams Bot',
    },
    channelData: {
        tenant: {
            id: 'tenantId-Guid',
        },
    },
};

const groupChatActivity = {
    text: '<at>Teams Bot</at> test\n',
    attachments: [
        {
            contentType: 'text/html',
            content:
                '<div><div><span itemscope="" itemtype="http://schema.skype.com/Mention" itemid="0">Teams Bot</span>&nbsp;test</div>\n</div>',
        },
    ],
    type: 'message',
    id: 'groupChatActivityId',
    channelId: 'msteams',
    serviceUrl: 'https://smba.trafficmanager.net/amer/',
    from: {
        id: '29:User-One-Id',
        name: 'User One',
        aadObjectId: 'User-aadObjectId',
    },
    conversation: {
        isGroup: true,
        conversationType: 'groupChat',
        tenantId: 'tenantId-Guid',
        id: '19:groupChatId@thread.v2',
    },
    recipient: {
        id: '28:teamsbot-Guid',
        name: 'Teams Bot',
    },
    entities: [
        {
            mentioned: {
                id: '28:teamsbot-Guid',
                name: 'Teams Bot',
            },
            text: '<at>Teams Bot</at>',
            type: 'mention',
        },
    ],
    channelData: {
        tenant: {
            id: 'tenantId-Guid',
        },
    },
};

const teamActivity = {
    text: '<at>Teams Bot</at> hi\n',
    attachments: [
        {
            contentType: 'text/html',
            content:
                '<div><div><span itemscope="" itemtype="http://schema.skype.com/Mention" itemid="0">Teams Bot</span>&nbsp;hi</div>\n</div>',
        },
    ],
    type: 'message',
    id: 'teamActivityId',
    channelId: 'msteams',
    serviceUrl: 'https://smba.trafficmanager.net/amer/',
    from: {
        id: '29:User-One-Id',
        name: 'User One',
        aadObjectId: 'User-aadObjectId',
    },
    conversation: {
        isGroup: true,
        conversationType: 'channel',
        tenantId: 'tenantId-Guid',
        id: '19:generalChannelIdgeneralChannelId@thread.skype;messageid=teamActivityId',
    },
    recipient: {
        id: '28:teamsbot-Guid',
        name: 'Teams Bot',
    },
    entities: [
        {
            mentioned: {
                id: '28:teamsbot-Guid',
                name: 'Teams Bot',
            },
            text: '<at>Teams Bot</at>',
            type: 'mention',
        },
    ],
    channelData: {
        teamsChannelId: '19:generalChannelIdgeneralChannelId@thread.skype',
        teamsTeamId: '19:generalChannelIdgeneralChannelId@thread.skype',
        channel: {
            id: '19:generalChannelIdgeneralChannelId@thread.skype',
        },
        meeting: {
            id: '19:meetingId',
        },
        team: {
            id: '19:generalChannelIdgeneralChannelId@thread.skype',
        },
        tenant: {
            id: 'tenantId-Guid',
        },
    },
};

describe('TeamsInfo', function () {
    const connectorClient = new ConnectorClient(new MicrosoftAppCredentials('abc', '123'), {
        baseUri: 'https://smba.trafficmanager.net/amer/',
    });

    beforeEach(function () {
        nock.cleanAll();
    });

    afterEach(function () {
        nock.cleanAll();
    });

    // Sets up nock expectation for an oauth token call, returning the expected auth header
    // and the nock expectation
    const nockOauth = () => {
        const tokenType = 'Bearer';
        const accessToken = 'access_token';

        const expectation = nock('https://login.microsoftonline.com')
            .post(/\/oauth2\/token/)
            .reply(200, { access_token: accessToken, token_type: tokenType });

        return { expectedAuthHeader: `${tokenType} ${accessToken}`, expectation };
    };

    describe('sendMessageToTeamsChannel()', function () {
        it('should work with correct information', async function () {
            const newConversation = [
                {
                    activityid: 'activityid123',
                },
                'resourceresponseid',
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchNewConversation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/conversations')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, { newConversation });

            const context = new TestContext(teamActivity);
            const msg = MessageFactory.text('test message');
            const teamChannelId = '19%3AgeneralChannelIdgeneralChannelId%40thread.skype';

            const response = await TeamsInfo.sendMessageToTeamsChannel(context, msg, teamChannelId);

            assert(fetchOauthToken.isDone());
            assert(fetchNewConversation.isDone());

            assert(Array.isArray(response));
            assert(newConversation[0]['activityid'] == 'activityid123');
            assert(newConversation[1] == 'resourceresponseid');
        });

        it('should work with correct information when using botAppId', async function () {
            const adapter = new TestCreateConversationAdapter(teamActivity.id, teamActivity.conversation.id);
            const expectedAppId = '1234-5678-1234-5678';

            const context = new TestContext(teamActivity, adapter);
            const msg = MessageFactory.text('test message');
            msg.channelId = Channels.Msteams;
            msg.channelData = {
                team: {
                    id: 'team-id',
                },
            };
            const teamChannelId = '19%3AgeneralChannelIdgeneralChannelId%40thread.skype';

            const response = await TeamsInfo.sendMessageToTeamsChannel(context, msg, teamChannelId, expectedAppId);

            assert(Array.isArray(response));
            assert.strictEqual(response[0].conversation.id, teamActivity.conversation.id);
            assert.strictEqual(response[1], teamActivity.id);
            assert.strictEqual(adapter.appId, expectedAppId);
            assert.strictEqual(adapter.channelId, Channels.Msteams);
            assert.strictEqual(adapter.serviceUrl, teamActivity.serviceUrl);
            assert.strictEqual(adapter.audience, null);

            const channelData = adapter.conversationParameters.channelData;
            const id = channelData.channel.id;

            assert.strictEqual(id, teamChannelId);
            assert.deepStrictEqual(msg, adapter.conversationParameters.activity);
        });

        it('should error if context is null', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToTeamsChannel(null, teamActivity, 'teamID'),
                new Error('TurnContext cannot be null')
            );
        });

        it('should error if activity is null', async function () {
            const context = new TestContext(teamActivity);

            await assert.rejects(
                TeamsInfo.sendMessageToTeamsChannel(context, null, 'teamID'),
                new Error('Activity cannot be null')
            );
        });

        it('should error if teamID is a blank string', async function () {
            const context = new TestContext(teamActivity);

            await assert.rejects(
                TeamsInfo.sendMessageToTeamsChannel(context, teamActivity, ''),
                new Error('The teamsChannelId cannot be null or empty')
            );
        });

        it('should error if teamID is null', async function () {
            const context = new TestContext(teamActivity);

            await assert.rejects(
                TeamsInfo.sendMessageToTeamsChannel(context, teamActivity, null),
                new Error('The teamsChannelId cannot be null or empty')
            );
        });
    });

    describe('getTeamChannels()', function () {
        it('should error in 1-on-1 chat', async function () {
            const context = new TestContext(oneOnOneActivity);

            await assert.rejects(
                TeamsInfo.getTeamChannels(context),
                new Error('This method is only valid within the scope of a MS Teams Team.')
            );
        });

        it('should error in Group chat', async function () {
            const context = new TestContext(groupChatActivity);

            await assert.rejects(
                TeamsInfo.getTeamChannels(context),
                new Error('This method is only valid within the scope of a MS Teams Team.')
            );
        });

        it('should work in a channel in a Team', async function () {
            // This is the property on the ConversationList that contains the information about the channels from Teams.
            const conversations = [
                {
                    id: '19:generalChannelIdgeneralChannelId@thread.skype',
                },
                {
                    id: '19:somechannelId2e5ab3df9ae9b594bdb@thread.skype',
                    name: 'Testing1',
                },
                {
                    id: '19:somechannelId388ade16aa4dd375e69@thread.skype',
                    name: 'Testing2',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/conversations')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, { conversations });

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const channels = await TeamsInfo.getTeamChannels(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert(Array.isArray(channels));
            assert(channels.length === 3, `unexpected number of channels detected: ${channels.length}`);

            // There should be a channel in the conversations returned from the conversations
            assert(
                channels.find((channel) => channel.id === '19:generalChannelIdgeneralChannelId@thread.skype'),
                'did not find general channel/team id in response'
            );
        });

        it('should work with a teamId passed in', async function () {
            // This is the property on the ConversationList that contains the information about the channels from Teams.
            const conversations = [
                {
                    id: '19:ChannelIdgeneralChannelId@thread.skype',
                },
                {
                    id: '19:somechannelId2e5ab3df9ae9b594bdb@thread.skype',
                    name: 'Testing1',
                },
                {
                    id: '19:somechannelId388ade16aa4dd375e69@thread.skype',
                    name: 'Testing2',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AChannelIdgeneralChannelId%40thread.skype/conversations')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, { conversations });

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const channels = await TeamsInfo.getTeamChannels(context, '19:ChannelIdgeneralChannelId@thread.skype');

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert(Array.isArray(channels));
            assert(channels.length === 3, `unexpected number of channels detected: ${channels.length}`);

            // There should be a channel in the conversations returned from the conversations
            assert(
                channels.find((channel) => channel.id === '19:ChannelIdgeneralChannelId@thread.skype'),
                'did not find general channel/team id in response'
            );
        });
    });

    describe('getTeamDetails()', function () {
        it('should error in 1-on-1 chat', async function () {
            const context = new TestContext(oneOnOneActivity);

            await assert.rejects(
                TeamsInfo.getTeamDetails(context),
                new Error('This method is only valid within the scope of a MS Teams Team.')
            );
        });

        it('should error in Group chat', async function () {
            const context = new TestContext(groupChatActivity);

            await assert.rejects(
                TeamsInfo.getTeamDetails(context),
                new Error('This method is only valid within the scope of a MS Teams Team.')
            );
        });

        it('should work in a channel in a Team', async function () {
            const teamDetails = {
                id: '19:generalChannelIdgeneralChannelId@thread.skype',
                name: 'TeamName',
                aadGroupId: 'Team-aadGroupId',
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchTeamDetailsExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AgeneralChannelIdgeneralChannelId%40thread.skype')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, teamDetails);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedTeamDetails = await TeamsInfo.getTeamDetails(context);

            assert(fetchOauthToken.isDone());
            assert(fetchTeamDetailsExpectation.isDone());

            assert(fetchedTeamDetails, `teamDetails should not be falsey: ${teamDetails}`);
            assert(fetchedTeamDetails.id === '19:generalChannelIdgeneralChannelId@thread.skype');
            assert(fetchedTeamDetails.name === 'TeamName');
            assert(fetchedTeamDetails.aadGroupId === 'Team-aadGroupId');
        });

        it('should work with a teamId passed in', async function () {
            const teamDetails = {
                id: '19:ChannelIdgeneralChannelId@thread.skype',
                name: 'TeamName',
                aadGroupId: 'Team-aadGroupId',
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchTeamDetailsExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AChannelIdgeneralChannelId%40thread.skype')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, teamDetails);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedTeamDetails = await TeamsInfo.getTeamDetails(
                context,
                '19:ChannelIdgeneralChannelId@thread.skype'
            );

            assert(fetchOauthToken.isDone());
            assert(fetchTeamDetailsExpectation.isDone());

            assert(fetchedTeamDetails, `teamDetails should not be falsey: ${teamDetails}`);
            assert(fetchedTeamDetails.id === '19:ChannelIdgeneralChannelId@thread.skype');
            assert(fetchedTeamDetails.name === 'TeamName');
            assert(fetchedTeamDetails.aadGroupId === 'Team-aadGroupId');
        });
    });

    describe('getMembers()', function () {
        it('should work in 1-on-1 chat', async function () {
            const members = [
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/a%3AoneOnOneConversationId/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(oneOnOneActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getMembers(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });

        it('should work in Group chat', async function () {
            const members = [
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-Two-Id',
                    name: 'User Two',
                    objectId: 'User-Two-Object-Id',
                    givenName: 'User',
                    surname: 'Two',
                    email: 'User.Two@microsoft.com',
                    userPrincipalName: 'user2@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-Three-Id',
                    name: 'User Three',
                    objectId: 'User-Three-Object-Id',
                    givenName: 'User',
                    surname: 'Three',
                    email: 'User.Three@microsoft.com',
                    userPrincipalName: 'user3@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgroupChatId%40thread.v2/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(groupChatActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getMembers(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });

        it('should work in a channel in a Team', async function () {
            const members = [
                {
                    id: '29:User-Two-Id',
                    name: 'User Two',
                    objectId: 'User-Two-Object-Id',
                    givenName: 'User',
                    surname: 'Two',
                    email: 'User.Two@microsoft.com',
                    userPrincipalName: 'user2@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getMembers(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });

        it('should not work if conversationId is falsey', async function () {
            const context = new TestContext(oneOnOneActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            context.activity.conversation.id = undefined;

            await assert.rejects(TeamsInfo.getMembers(context), (err) => {
                assert.strictEqual(err.message, 'The getMembers operation needs a valid conversationId.');
                oneOnOneActivity.conversation.id = 'a:oneOnOneConversationId';
                return true;
            });
        });
    });

    describe('getMember()', function () {
        it('should work without a Team', async function () {
            const member = {
                id: '29:User-One-Id',
                name: 'User One',
                aadObjectId: 'User-One-Object-Id',
                givenName: 'User',
                surname: 'One',
                email: 'User.One@microsoft.com',
                userPrincipalName: 'user1@microsoft.com',
                tenantId: 'tenantId-Guid',
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/a%3AoneOnOneConversationId/members/29%3AUser-One-Id')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, member);

            const context = new TestContext(oneOnOneActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMember = await TeamsInfo.getMember(context, oneOnOneActivity.from.id);

            assert(fetchOauthToken.isDone());
            assert(fetchExpectation.isDone());

            assert.deepStrictEqual(fetchedMember, member);
        });

        it('should work with a Team', async function () {
            const member = {
                id: '29:User-One-Id',
                name: 'User One',
                objectId: 'User-One-Object-Id',
                givenName: 'User',
                surname: 'One',
                email: 'User.One@microsoft.com',
                userPrincipalName: 'user1@microsoft.com',
                tenantId: 'tenantId-Guid',
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members/29%3AUser-One-Id')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, member);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMember = await TeamsInfo.getMember(context, teamActivity.from.id);

            assert(fetchOauthToken.isDone());
            assert(fetchExpectation.isDone());

            assert.deepStrictEqual(fetchedMember, member);
        });
    });

    describe('getTeamMember()', function () {
        it('should throw error when teamId is not present', async function () {
            const context = new TestContext({ type: ActionTypes.message });

            await assert.rejects(
                TeamsInfo.getTeamMember(context),
                new Error('This method is only valid within the scope of a MS Teams Team.')
            );
        });
    });

    describe('getMeetingParticipant', function () {
        const context = new TestContext(teamActivity);
        context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

        it('should work with correct arguments', async function () {
            const participant = {
                user: {
                    id: teamActivity.from.id,
                    name: teamActivity.from.name,
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: teamActivity.conversation.tenantId,
                },
                meeting: {
                    inMeeting: true,
                    role: 'Organizer',
                },
                conversation: {
                    id: teamActivity.conversation.id,
                },
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v1/meetings/19%3AmeetingId/participants/User-aadObjectId?tenantId=tenantId-Guid')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, participant);

            const fetchedParticipant = await TeamsInfo.getMeetingParticipant(context);

            assert(fetchOauthToken.isDone());
            assert(fetchExpectation.isDone());

            assert.deepStrictEqual(fetchedParticipant, participant);
        });

        it('should throw error for missing context', async function () {
            await assert.rejects(TeamsInfo.getMeetingParticipant(), Error('context is required.'));
        });
    });

    describe('getMeetingInfo', function () {
        const context = new TestContext(teamActivity);
        context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

        it('should work with correct arguments-meetingId in context', async function () {
            const details = {
                organizer: {
                    id: teamActivity.from.id,
                    name: teamActivity.from.name,
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: teamActivity.conversation.tenantId,
                },
                details: {
                    id: 'meeting-id',
                    msGraphResourceId: 'msGraph-id',
                    scheduledStartTime: new Date('Thu Jun 10 2021 15:02:32 GMT-0700'),
                    scheduledEndTime: new Date('Thu Jun 10 2021 16:02:32 GMT-0700'),
                    joinUrl: 'https://teams.microsoft.com/l/meetup-join/someEncodedMeetingString',
                    title: 'Fake meeting',
                    type: 'Scheduled',
                },
                conversation: {
                    id: teamActivity.conversation.id,
                },
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v1/meetings/19%3AmeetingId')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, details);

            const fetchedDetails = await TeamsInfo.getMeetingInfo(context);

            assert(fetchOauthToken.isDone());
            assert(fetchExpectation.isDone());

            assert.deepStrictEqual(fetchedDetails, details);
        });

        it('should work with correct arguments-meetingId passed in', async function () {
            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            const details = {
                organizer: {
                    id: teamActivity.from.id,
                    name: teamActivity.from.name,
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: teamActivity.conversation.tenantId,
                },
                details: {
                    id: 'meeting-id',
                    msGraphResourceId: 'msGraph-id',
                    scheduledStartTime: new Date('Thu Jun 10 2021 15:02:32 GMT-0700'),
                    scheduledEndTime: new Date('Thu Jun 10 2021 16:02:32 GMT-0700'),
                    joinUrl: 'https://teams.microsoft.com/l/meetup-join/someEncodedMeetingString',
                    title: 'Fake meeting',
                    type: 'Scheduled',
                },
                conversation: {
                    id: teamActivity.conversation.id,
                },
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v1/meetings/meeting-id')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, details);

            const fetchedDetails = await TeamsInfo.getMeetingInfo(context, details.details.id);

            assert(fetchOauthToken.isDone());
            assert(fetchExpectation.isDone());

            assert.deepStrictEqual(fetchedDetails, details);
        });

        it('should throw error for missing context', async function () {
            await assert.rejects(TeamsInfo.getMeetingInfo(), Error('context is required.'));
        });

        it('should throw error for missing meetingId', async function () {
            await assert.rejects(
                TeamsInfo.getMeetingInfo({ activity: {} }),
                Error('meetingId or TurnContext containing meetingId is required.')
            );
        });
    });

    describe('getTeamMembers()', function () {
        it('should error in 1-on-1 chat', async function () {
            const context = new TestContext(oneOnOneActivity);

            await assert.rejects(
                TeamsInfo.getTeamMembers(context),
                new Error('This method is only valid within the scope of a MS Teams Team.')
            );
        });

        it('should error in Group chat', async function () {
            const context = new TestContext(groupChatActivity);

            await assert.rejects(
                TeamsInfo.getTeamMembers(context),
                new Error('This method is only valid within the scope of a MS Teams Team.')
            );
        });

        it('should work in a channel in a Team', async function () {
            const members = [
                {
                    id: '29:User-Two-Id',
                    name: 'User Two',
                    objectId: 'User-Two-Object-Id',
                    givenName: 'User',
                    surname: 'Two',
                    email: 'User.Two@microsoft.com',
                    userPrincipalName: 'user2@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getTeamMembers(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });

        it('should work with a teamId passed in', async function () {
            const members = [
                {
                    id: '29:User-Two-Id',
                    name: 'User Two',
                    objectId: 'User-Two-Object-Id',
                    givenName: 'User',
                    surname: 'Two',
                    email: 'User.Two@microsoft.com',
                    userPrincipalName: 'user2@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AChannelIdgeneralChannelId%40thread.skype/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getTeamMembers(context, '19:ChannelIdgeneralChannelId@thread.skype');

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });
    });

    describe('private methods', function () {
        describe('getConnectorClient()', function () {
            it("should error if the context doesn't have an adapter", function () {
                assert.throws(
                    () => TeamsInfo.getConnectorClient({}),
                    new Error('This method requires a connector client.')
                );
            });

            it("should fallback to the connectorClient on turnState if adapter doesn't exist in context.adapter", function () {
                const context = new TurnContext({});
                context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
                const result = TeamsInfo.getConnectorClient(context);
                assert.strictEqual(result, connectorClient);
            });
        });

        describe('getMembersInternal()', function () {
            it('should error if an invalid conversationId is passed in.', async function () {
                await assert.rejects(
                    TeamsInfo.getMembersInternal({}, undefined),
                    new Error('The getMembers operation needs a valid conversationId.')
                );
            });

            it('should error if an invalid conversationId is passed in.', async function () {
                await assert.rejects(
                    TeamsInfo.getMemberInternal({}, undefined),
                    new Error('The getMember operation needs a valid conversationId.')
                );
            });

            it('should error if an invalid userId is passed in.', async function () {
                await assert.rejects(
                    TeamsInfo.getMemberInternal({}, 'conversationId', undefined),
                    new Error('The getMember operation needs a valid userId.')
                );
            });
        });

        describe('getPagedMembersInternal()', function () {
            let sandbox;
            beforeEach(function () {
                sandbox = sinon.createSandbox();
            });

            afterEach(function () {
                sandbox.restore();
            });

            it('should error if an invalid conversationId is passed in.', async function () {
                await assert.rejects(
                    TeamsInfo.getPagedMembersInternal({}, undefined, 'options'),
                    new Error('The getPagedMembers operation needs a valid conversationId.')
                );
            });

            it('should call connectorClient.conversations.getConversationPagedMembers()', async function () {
                const members = [
                    {
                        id: '29:User-One-Id',
                        name: 'User One',
                        objectId: 'User-One-Object-Id',
                        givenName: 'User',
                        surname: 'One',
                        email: 'User.One@microsoft.com',
                        userPrincipalName: 'user1@microsoft.com',
                        tenantId: 'tenantId-Guid',
                    },
                    {
                        id: '29:User-Two-Id',
                        name: 'User Two',
                        objectId: 'User-Two-Object-Id',
                        givenName: 'User',
                        surname: 'Two',
                        email: 'User.Two@microsoft.com',
                        userPrincipalName: 'user2@microsoft.com',
                        tenantId: 'tenantId-Guid',
                    },
                ];
                const conversations = new Conversations({ id: 'convo1' });
                const getPagedMembers = sandbox.stub(conversations, 'getConversationPagedMembers');
                getPagedMembers.returns({ continuationToken: 'token', members: members });
                const connector = new ConnectorClient(new MicrosoftAppCredentials('', ''));
                connector.conversations = conversations;

                await TeamsInfo.getPagedMembersInternal(connector, 'convo1');

                assert.strictEqual(
                    getPagedMembers.calledOnce,
                    true,
                    'should have called conversations.getConversationPagedMembers'
                );
            });
        });

        describe('getTeamId()', function () {
            it('should error if an invalid context is passed in.', function () {
                assert.throws(() => TeamsInfo.getTeamId(undefined), Error('Missing context parameter'));
            });

            it('should error if an invalid activity is passed in.', function () {
                assert.throws(() => TeamsInfo.getTeamId({ activity: undefined }), Error('Missing activity on context'));
            });
        });
    });
});
