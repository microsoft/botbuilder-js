const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const { BotFrameworkAdapter, TeamsInfo, CloudAdapter } = require('../');
const { Conversations } = require('botframework-connector/lib/connectorApi/operations');
const { MicrosoftAppCredentials, ConnectorClient, MsalAppCredentials } = require('botframework-connector');
const { TurnContext, MessageFactory, ActionTypes, Channels } = require('botbuilder-core');
const { ConfidentialClientApplication } = require('@azure/msal-node');

class TeamsInfoAdapter extends BotFrameworkAdapter {
    constructor() {
        super({ appId: 'appId', appPassword: 'appPassword' });
        this.credentials = getCredentials();
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

function getBearerToken() {
    const tokenType = 'Bearer';
    const accessToken = 'access_token';

    return `${tokenType} ${accessToken}`;
}

function getCredentials() {
    const accessToken = getBearerToken().split(' ')[1];
    const confidential = new ConfidentialClientApplication({
        auth: {
            clientId: 'appId',
            clientSecret: 'appPassword',
        },
    });

    sinon.stub(confidential, 'acquireTokenByClientCredential').returns({ accessToken, expiresOn: new Date() });
    return new MsalAppCredentials(confidential, 'appId');
}

describe('TeamsInfo', function () {
    beforeEach(function () {
        nock.cleanAll();
    });

    afterEach(function () {
        nock.cleanAll();
    });

    const connectorClient = new ConnectorClient(getCredentials(), {
        baseUri: 'https://smba.trafficmanager.net/amer/',
    });

    describe('sendMessageToTeamsChannel()', function () {
        it('should work with correct information', async function () {
            const newConversation = [
                {
                    activityid: 'activityid123',
                },
                'resourceresponseid',
            ];

            const expectedAuthHeader = getBearerToken();

            const fetchNewConversation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/conversations')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, { newConversation });

            const context = new TestContext(teamActivity);
            const msg = MessageFactory.text('test message');
            const teamChannelId = '19%3AgeneralChannelIdgeneralChannelId%40thread.skype';

            const response = await TeamsInfo.sendMessageToTeamsChannel(context, msg, teamChannelId);

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

            const expectedAuthHeader = getBearerToken();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/conversations')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, { conversations });

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const channels = await TeamsInfo.getTeamChannels(context);

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

            const expectedAuthHeader = getBearerToken();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AChannelIdgeneralChannelId%40thread.skype/conversations')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, { conversations });

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const channels = await TeamsInfo.getTeamChannels(context, '19:ChannelIdgeneralChannelId@thread.skype');

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
                type: 'standard',
            };

            const expectedAuthHeader = getBearerToken();

            const fetchTeamDetailsExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AgeneralChannelIdgeneralChannelId%40thread.skype')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, teamDetails);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedTeamDetails = await TeamsInfo.getTeamDetails(context);

            assert(fetchTeamDetailsExpectation.isDone());

            assert(fetchedTeamDetails, `teamDetails should not be falsey: ${teamDetails}`);
            assert(fetchedTeamDetails.id === '19:generalChannelIdgeneralChannelId@thread.skype');
            assert(fetchedTeamDetails.name === 'TeamName');
            assert(fetchedTeamDetails.aadGroupId === 'Team-aadGroupId');
            assert(fetchedTeamDetails.type === 'standard');
        });

        it('should work with a teamId passed in', async function () {
            const teamDetails = {
                id: '19:ChannelIdgeneralChannelId@thread.skype',
                name: 'TeamName',
                aadGroupId: 'Team-aadGroupId',
            };

            const expectedAuthHeader = getBearerToken();

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

            const expectedAuthHeader = getBearerToken();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/a%3AoneOnOneConversationId/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(oneOnOneActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getMembers(context);

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

            const expectedAuthHeader = getBearerToken();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgroupChatId%40thread.v2/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(groupChatActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getMembers(context);

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

            const expectedAuthHeader = getBearerToken();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getMembers(context);

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

            const expectedAuthHeader = getBearerToken();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/a%3AoneOnOneConversationId/members/29%3AUser-One-Id')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, member);

            const context = new TestContext(oneOnOneActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMember = await TeamsInfo.getMember(context, oneOnOneActivity.from.id);

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

            const expectedAuthHeader = getBearerToken();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members/29%3AUser-One-Id')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, member);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMember = await TeamsInfo.getMember(context, teamActivity.from.id);

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

            const expectedAuthHeader = getBearerToken();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v1/meetings/19%3AmeetingId/participants/User-aadObjectId?tenantId=tenantId-Guid')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, participant);

            const fetchedParticipant = await TeamsInfo.getMeetingParticipant(context);

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

            const expectedAuthHeader = getBearerToken();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v1/meetings/19%3AmeetingId')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, details);

            const fetchedDetails = await TeamsInfo.getMeetingInfo(context);

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

            const expectedAuthHeader = getBearerToken();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v1/meetings/meeting-id')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, details);

            const fetchedDetails = await TeamsInfo.getMeetingInfo(context, details.details.id);

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

            const expectedAuthHeader = getBearerToken();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getTeamMembers(context);

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

            const expectedAuthHeader = getBearerToken();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AChannelIdgeneralChannelId%40thread.skype/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const fetchedMembers = await TeamsInfo.getTeamMembers(context, '19:ChannelIdgeneralChannelId@thread.skype');

            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });
    });

    describe('sendTeamsMeetingNotification()', function () {
        it('should correctly map notification object as the request body of the POST request', async function () {
            const notification = {
                type: 'targetedMeetingNotification',
                value: {
                    recipients: ['random recipient id'],
                    surfaces: [
                        {
                            surface: 'meetingStage',
                            contentType: 'task',
                            content: {
                                value: {
                                    height: '3',
                                    width: '4',
                                    title: "this is Johnny's test",
                                    url: 'https://www.bing.com',
                                },
                            },
                        },
                        {
                            surface: 'meetingTabIcon',
                            tabEntityId: 'some-tab-id',
                        },
                    ],
                },
                channelData: {
                    onBehalfOf: [
                        // support for user attributions
                        {
                            itemid: 0,
                            mentionType: 'person',
                            mri: 'random admin',
                            displayName: 'admin',
                        },
                    ],
                },
            };
            const meetingId = 'randomGUID';
            const expectedAuthHeader = getBearerToken();

            const sendTeamsMeetingNotificationExpectation = nock('https://smba.trafficmanager.net/amer')
                .post(`/v1/meetings/${meetingId}/notification`, notification)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(202, {});

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            // if notification object wasn't passed as request body, test would fail
            await TeamsInfo.sendMeetingNotification(context, notification, meetingId);

            assert(sendTeamsMeetingNotificationExpectation.isDone());
        });

        it('should return an empty object if a 202 status code was returned', async function () {
            const notification = {};
            const meetingId = 'randomGUID';
            const expectedAuthHeader = getBearerToken();

            const sendTeamsMeetingNotificationExpectation = nock('https://smba.trafficmanager.net/amer')
                .post(`/v1/meetings/${meetingId}/notification`, notification)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(202, {});

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const sendTeamsMeetingNotification = await TeamsInfo.sendMeetingNotification(
                context,
                notification,
                meetingId
            );

            assert(sendTeamsMeetingNotificationExpectation.isDone());

            const isEmptyObject = (obj) => Object.keys(obj).length == 0;
            assert(isEmptyObject(sendTeamsMeetingNotification));
        });

        it('should return a MeetingNotificationResponse if a 207 status code was returned', async function () {
            const notification = {};
            const meetingId = 'randomGUID';
            const expectedAuthHeader = getBearerToken();

            const recipientsFailureInfo = {
                recipientsFailureInfo: [
                    {
                        recipientMri: '8:orgid:4e8a10c0-4687-4f0a-9ed6-95f28d67c102',
                        failureReason: 'Invalid recipient. Recipient not in roster',
                        errorCode: 'MemberNotFoundInConversation',
                    },
                    {
                        recipientMri: '8:orgid:4e8a10c0-4687-4f0a-9ed6-95f28d67c103',
                        failureReason: 'Invalid recipient. Recipient not in roster',
                        errorCode: 'MemberNotFoundInConversation',
                    },
                ],
            };

            const sendTeamsMeetingNotificationExpectation = nock('https://smba.trafficmanager.net/amer')
                .post(`/v1/meetings/${meetingId}/notification`, notification)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(207, recipientsFailureInfo);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);
            const sendTeamsMeetingNotification = await TeamsInfo.sendMeetingNotification(
                context,
                notification,
                meetingId
            );

            assert(sendTeamsMeetingNotificationExpectation.isDone());

            assert.deepEqual(sendTeamsMeetingNotification, recipientsFailureInfo);
        });

        it('should return standard error response if a 4xx status code was returned', async function () {
            const notification = {};
            const meetingId = 'randomGUID';
            const expectedAuthHeader = getBearerToken();

            const errorResponse = { error: { code: 'BadSyntax', message: 'Payload is incorrect' } };

            const sendTeamsMeetingNotificationExpectation = nock('https://smba.trafficmanager.net/amer')
                .post(`/v1/meetings/${meetingId}/notification`, notification)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(400, errorResponse);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            let isErrorThrown = false;
            try {
                await TeamsInfo.sendMeetingNotification(context, notification, meetingId);
            } catch (e) {
                assert.deepEqual(errorResponse, e.details);
                isErrorThrown = true;
            }

            assert(isErrorThrown);

            assert(sendTeamsMeetingNotificationExpectation.isDone());
        });

        it('should throw an error if an empty meeting id is provided', async function () {
            const notification = {};
            const emptyMeetingId = '';
            const expectedAuthHeader = getBearerToken();

            const sendTeamsMeetingNotificationExpectation = nock('https://smba.trafficmanager.net/amer')
                .post(`/v1/meetings/${emptyMeetingId}/notification`, notification)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(202, {});

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            let isErrorThrown = false;
            try {
                await TeamsInfo.sendMeetingNotification(context, notification, emptyMeetingId);
            } catch (e) {
                assert(typeof e, 'Error');
                assert(e.message, 'meetingId is required.');
                isErrorThrown = true;
            }

            assert(isErrorThrown);
            assert(sendTeamsMeetingNotificationExpectation.isDone() === false);
        });

        it('should get the meeting id from the context object if no meeting id is provided', async function () {
            const notification = {};
            const expectedAuthHeader = getBearerToken();

            const context = new TestContext(teamActivity);

            const sendTeamsMeetingNotificationExpectation = nock('https://smba.trafficmanager.net/amer')
                .post(
                    `/v1/meetings/${encodeURIComponent(teamActivity.channelData.meeting.id)}/notification`,
                    notification
                )
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(202, {});

            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            await TeamsInfo.sendMeetingNotification(context, notification);

            assert(sendTeamsMeetingNotificationExpectation.isDone());
        });
    });

    describe('sendMessageToListOfUsers()', function () {
        const activity = MessageFactory.text('Message to users from batch');
        const tenantId = 'randomGUID';
        const members = [
            { id: '19:member-1' },
            { id: '19:member-2' },
            { id: '19:member-3' },
            { id: '19:member-4' },
            { id: '19:member-5' },
        ];

        it('should correctly map message object as the request body of the POST request', async function () {
            const content = {
                activity: {
                    text: 'Message to users from batch',
                    type: 'message',
                },
                members: [
                    { id: '19:member-1' },
                    { id: '19:member-2' },
                    { id: '19:member-3' },
                    { id: '19:member-4' },
                    { id: '19:member-5' },
                ],
                tenantId: 'randomGUID',
            };

            const expectedAuthHeader = getBearerToken();

            const sendMessageToListOfUsersExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/users', content)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(201, {});

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            await TeamsInfo.sendMessageToListOfUsers(context, activity, tenantId, members);

            assert(sendMessageToListOfUsersExpectation.isDone());
        });

        it('should return operation id if a 201 status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();

            const sendMessageToListOfUsersExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/users')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(201, { operationId: '1' });

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            const operationId = await TeamsInfo.sendMessageToListOfUsers(context, activity, tenantId, members);

            assert(sendMessageToListOfUsersExpectation.isDone());
            assert(operationId, { operationId: '1' });
        });

        it('should return standard error response if a 4xx status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();

            const errorResponse = { error: { code: 'BadSyntax', message: 'Payload is incorrect' } };

            const sendMessageToListOfUsersExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/users')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(400, errorResponse);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            let isErrorThrown = false;
            try {
                await TeamsInfo.sendMessageToListOfUsers(context, activity, tenantId, members);
            } catch (e) {
                assert.deepEqual(errorResponse, e.errors[0].details);
                isErrorThrown = true;
            }

            assert(isErrorThrown);

            assert(sendMessageToListOfUsersExpectation.isDone());
        });

        it('should throw an error if an empty activity is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToListOfUsers(context, null, tenantId, members),
                Error('activity is required.')
            );
        });

        it('should throw an error if an empty member list is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToListOfUsers(context, activity, tenantId, null),
                Error('members list is required.')
            );
        });

        it('should throw an error if an empty tenant id is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToListOfUsers(context, activity, null, members),
                Error('tenantId is required.')
            );
        });
    });

    describe('sendMessageToAllUsersInTenant()', function () {
        const activity = MessageFactory.text('Message to users from batch');
        const tenantId = 'randomGUID';

        it('should correctly map message object as the request body of the POST request', async function () {
            const content = {
                activity: {
                    text: 'Message to users from batch',
                    type: 'message',
                },
                tenantId: 'randomGUID',
            };

            const expectedAuthHeader = getBearerToken();

            const sendMessageToAllUsersInTenantExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/tenant', content)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(201, {});

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            await TeamsInfo.sendMessageToAllUsersInTenant(context, activity, tenantId);

            assert(sendMessageToAllUsersInTenantExpectation.isDone());
        });

        it('should return operation id if a 201 status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();

            const sendMessageToAllUsersInTenantExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/tenant')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(201, { operationId: '1' });

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            const operationId = await TeamsInfo.sendMessageToAllUsersInTenant(context, activity, tenantId);

            assert(sendMessageToAllUsersInTenantExpectation.isDone());
            assert(operationId, { operationId: '1' });
        });

        it('should return standard error response if a 4xx status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();

            const errorResponse = { error: { code: 'BadSyntax', message: 'Payload is incorrect' } };

            const sendMessageToAllUsersInTenantExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/tenant')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(400, errorResponse);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            let isErrorThrown = false;
            try {
                await TeamsInfo.sendMessageToAllUsersInTenant(context, activity, tenantId);
            } catch (e) {
                assert.deepEqual(errorResponse, e.errors[0].details);
                isErrorThrown = true;
            }

            assert(isErrorThrown);

            assert(sendMessageToAllUsersInTenantExpectation.isDone());
        });

        it('should throw an error if an empty activity is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToAllUsersInTenant(context, null, tenantId),
                Error('activity is required.')
            );
        });

        it('should throw an error if an empty tenant id is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToAllUsersInTenant(context, activity, null),
                Error('tenantId is required.')
            );
        });
    });

    describe('sendMessageToAllUsersInTeam()', function () {
        const activity = MessageFactory.text('Message to users from batch');
        const tenantId = 'randomGUID';
        const teamId = 'teamRandomGUID';

        it('should correctly map message object as the request body of the POST request', async function () {
            const content = {
                activity: {
                    text: 'Message to users from batch',
                    type: 'message',
                },
                tenantId: 'randomGUID',
                teamId: 'teamRandomGUID',
            };

            const expectedAuthHeader = getBearerToken();

            const sendMessageToAllUsersInTeamExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/team', content)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(201, {});

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            await TeamsInfo.sendMessageToAllUsersInTeam(context, activity, tenantId, teamId);

            assert(sendMessageToAllUsersInTeamExpectation.isDone());
        });

        it('should return operation id if a 201 status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();

            const sendMessageToAllUsersInTeamExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/team')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(201, { operationId: '1' });

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            const operationId = await TeamsInfo.sendMessageToAllUsersInTeam(context, activity, tenantId, teamId);

            assert(sendMessageToAllUsersInTeamExpectation.isDone());
            assert(operationId, { operationId: '1' });
        });

        it('should return standard error response if a 4xx status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();

            const errorResponse = { error: { code: 'BadSyntax', message: 'Payload is incorrect' } };

            const sendMessageToAllUsersInTeamExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/team')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(400, errorResponse);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            let isErrorThrown = false;
            try {
                await TeamsInfo.sendMessageToAllUsersInTeam(context, activity, tenantId, teamId);
            } catch (e) {
                assert.deepEqual(errorResponse, e.errors[0].details);
                isErrorThrown = true;
            }

            assert(isErrorThrown);

            assert(sendMessageToAllUsersInTeamExpectation.isDone());
        });

        it('should throw an error if an empty activity is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToAllUsersInTeam(context, null, tenantId, teamId),
                Error('activity is required.')
            );
        });

        it('should throw an error if an empty tenant id is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToAllUsersInTeam(context, activity, null, teamId),
                Error('tenantId is required.')
            );
        });

        it('should throw an error if an empty team id is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToAllUsersInTeam(context, activity, teamId, null),
                Error('teamId is required.')
            );
        });
    });

    describe('sendMessageToListOfChannels()', function () {
        const activity = MessageFactory.text('Message to users from batch');
        const tenantId = 'randomGUID';
        const members = [
            { id: '19:member-1' },
            { id: '19:member-2' },
            { id: '19:member-3' },
            { id: '19:member-4' },
            { id: '19:member-5' },
        ];

        it('should correctly map message object as the request body of the POST request', async function () {
            const content = {
                activity: {
                    text: 'Message to users from batch',
                    type: 'message',
                },
                members: [
                    { id: '19:member-1' },
                    { id: '19:member-2' },
                    { id: '19:member-3' },
                    { id: '19:member-4' },
                    { id: '19:member-5' },
                ],
                tenantId: 'randomGUID',
            };

            const expectedAuthHeader = getBearerToken();

            const sendMessageToListOfChannelsExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/channels', content)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(201, {});

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            await TeamsInfo.sendMessageToListOfChannels(context, activity, tenantId, members);

            assert(sendMessageToListOfChannelsExpectation.isDone());
        });

        it('should return operation id if a 201 status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();

            const sendMessageToListOfChannelsExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/channels')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(201, { operationId: '1' });

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            const operationId = await TeamsInfo.sendMessageToListOfChannels(context, activity, tenantId, members);

            assert(sendMessageToListOfChannelsExpectation.isDone());
            assert(operationId, { operationId: '1' });
        });

        it('should return standard error response if a 4xx status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();

            const errorResponse = { error: { code: 'BadSyntax', message: 'Payload is incorrect' } };

            const sendMessageToListOfChannelsExpectation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/batch/conversation/channels')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(400, errorResponse);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            let isErrorThrown = false;
            try {
                await TeamsInfo.sendMessageToListOfChannels(context, activity, tenantId, members);
            } catch (e) {
                assert.deepEqual(errorResponse, e.errors[0].details);
                isErrorThrown = true;
            }

            assert(isErrorThrown);

            assert(sendMessageToListOfChannelsExpectation.isDone());
        });

        it('should throw an error if an empty activity is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToListOfChannels(context, null, tenantId, members),
                Error('activity is required.')
            );
        });

        it('should throw an error if an empty member list is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToListOfChannels(context, activity, tenantId, null),
                Error('members list is required.')
            );
        });

        it('should throw an error if an empty tenant id is provided', async function () {
            await assert.rejects(
                TeamsInfo.sendMessageToListOfChannels(context, activity, null, members),
                Error('tenantId is required.')
            );
        });
    });

    describe('getOperationState()', function () {
        const operationId = 'amerOperationId';

        it('should work with correct operationId in parameters', async function () {
            const operationState = {
                state: 'Completed',
                statusMap: {
                    201: 1,
                    404: 4,
                },
                totalEntriesCount: 5,
            };

            const expectedAuthHeader = getBearerToken();

            const getOperationStateExpectation = nock('https://smba.trafficmanager.net/amer')
                .get(`/v3/batch/conversation/${operationId}`)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, operationState);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            const operationStateDetails = await TeamsInfo.getOperationState(context, operationId);

            assert(getOperationStateExpectation.isDone());

            assert.deepStrictEqual(operationStateDetails, operationState);
        });

        it('should return standard error response if a 4xx status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();
            const errorResponse = { error: { code: 'BadSyntax', message: 'Payload is incorrect' } };

            const getOperationStateExpectation = nock('https://smba.trafficmanager.net/amer')
                .get(`/v3/batch/conversation/${operationId}`)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(400, errorResponse);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            let isErrorThrown = false;
            try {
                await TeamsInfo.getOperationState(context, operationId);
            } catch (e) {
                assert.deepEqual(errorResponse, e.errors[0].details);
                isErrorThrown = true;
            }

            assert(isErrorThrown);

            assert(getOperationStateExpectation.isDone());
        });

        it('should throw error for missing operation Id', async function () {
            await assert.rejects(TeamsInfo.getOperationState({ activity: {} }), Error('operationId is required.'));
        });
    });

    describe('getFailedEntries()', function () {
        const operationId = 'amerOperationId';

        it('should work with correct operationId in parameters', async function () {
            const failedEntries = {
                continuationToken: 'Token',
                failedEntryResponses: [
                    {
                        id: 'id-1',
                        error: 'error-1',
                    },
                    {
                        id: 'id-2',
                        error: 'error-2',
                    },
                    {
                        id: 'id-3',
                        error: 'error-3',
                    },
                ],
            };

            const expectedAuthHeader = getBearerToken();

            const getFailedEntriesExpectation = nock('https://smba.trafficmanager.net/amer')
                .get(`/v3/batch/conversation/failedentries/${operationId}`)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, failedEntries);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            const failedEntriesResponse = await TeamsInfo.getFailedEntries(context, operationId);

            assert(getFailedEntriesExpectation.isDone());

            assert.deepStrictEqual(failedEntriesResponse, failedEntries);
        });

        it('should return standard error response if a 4xx status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();
            const errorResponse = { error: { code: 'BadSyntax', message: 'Payload is incorrect' } };

            const getFailedEntriesExpectation = nock('https://smba.trafficmanager.net/amer')
                .get(`/v3/batch/conversation/failedentries/${operationId}`)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(400, errorResponse);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            let isErrorThrown = false;
            try {
                await TeamsInfo.getFailedEntries(context, operationId);
            } catch (e) {
                assert.deepEqual(errorResponse, e.errors[0].details);
                isErrorThrown = true;
            }

            assert(isErrorThrown);

            assert(getFailedEntriesExpectation.isDone());
        });

        it('should throw error for missing operation Id', async function () {
            await assert.rejects(TeamsInfo.getFailedEntries({ activity: {} }), Error('operationId is required.'));
        });
    });

    describe('cancelOperation()', function () {
        const operationId = 'amerOperationId';

        it('should finish operation with correct operationId in parameters', async function () {
            const expectedAuthHeader = getBearerToken();

            const cancelOperationExpectation = nock('https://smba.trafficmanager.net/amer')
                .delete(`/v3/batch/conversation/${operationId}`)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            await TeamsInfo.cancelOperation(context, operationId);

            assert(cancelOperationExpectation.isDone());
        });

        it('should return standard error response if a 4xx status code was returned', async function () {
            const expectedAuthHeader = getBearerToken();
            const errorResponse = { error: { code: 'BadSyntax', message: 'Payload is incorrect' } };

            const cancelOperationExpectation = nock('https://smba.trafficmanager.net/amer')
                .delete(`/v3/batch/conversation/${operationId}`)
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(400, errorResponse);

            const context = new TestContext(teamActivity);
            context.turnState.set(context.adapter.ConnectorClientKey, connectorClient);

            let isErrorThrown = false;
            try {
                await TeamsInfo.cancelOperation(context, operationId);
            } catch (e) {
                assert.deepEqual(errorResponse, e.errors[0].details);
                isErrorThrown = true;
            }

            assert(isErrorThrown);

            assert(cancelOperationExpectation.isDone());
        });

        it('should throw error for missing operation Id', async function () {
            await assert.rejects(TeamsInfo.getFailedEntries({ activity: {} }), Error('operationId is required.'));
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
